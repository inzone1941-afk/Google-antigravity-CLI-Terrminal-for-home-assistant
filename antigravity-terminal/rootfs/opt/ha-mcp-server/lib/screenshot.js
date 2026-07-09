/**
 * Screenshot Helpers
 *
 * Headless Chromium screenshot capture for Home Assistant frontend pages.
 * Implements three complementary auth strategies to handle the HA frontend's
 * authentication flow:
 *
 *   1. localStorage injection  — sets hassTokens for the auth module
 *   2. WebSocket interceptor   — responds to auth_required handshake
 *   3. HTTP request interception — injects Authorization header for REST calls
 *
 * Security: validateScreenshotUrl() enforces an allowlist of local HA origins
 * to prevent SSRF-style misuse when --no-sandbox is required inside Docker.
 */

import puppeteer from "puppeteer-core";

const HA_ACCESS_TOKEN = process.env.HA_ACCESS_TOKEN;
const CHROMIUM_PATH = process.env.PUPPETEER_EXECUTABLE_PATH || "/usr/bin/chromium";

// ============================================================================
// URL ALLOWLIST (Fix #2 – Security)
// ============================================================================

/**
 * Allowed URL origin patterns for screenshot targets.
 *
 * Only local/private network addresses are permitted. This prevents the
 * headless Chromium instance (which runs without a sandbox inside Docker)
 * from being directed at arbitrary external URLs by a malicious request.
 *
 * Patterns are tested against the *origin* (scheme + host + port) of the
 * discovered HA Core URL before any navigation takes place.
 */
const ALLOWED_ORIGIN_PATTERNS = [
  // Private IPv4 ranges
  /^https?:\/\/10\.\d{1,3}\.\d{1,3}\.\d{1,3}(:\d+)?$/,
  /^https?:\/\/172\.(1[6-9]|2\d|3[01])\.\d{1,3}\.\d{1,3}(:\d+)?$/,
  /^https?:\/\/192\.168\.\d{1,3}\.\d{1,3}(:\d+)?$/,
  // Loopback
  /^https?:\/\/127\.\d{1,3}\.\d{1,3}\.\d{1,3}(:\d+)?$/,
  /^https?:\/\/localhost(:\d+)?$/,
  // Common Home Assistant hostnames
  /^https?:\/\/homeassistant\.local(:\d+)?$/,
  /^https?:\/\/homeassistant(:\d+)?$/,
  /^https?:\/\/hassio(:\d+)?$/,
];

/**
 * Validate that a HA Core URL is on the local-network allowlist.
 *
 * @param {string} haCoreUrl  Base URL to validate (e.g. "http://192.168.1.100:8123")
 * @throws {Error} If the URL does not match any allowed pattern
 */
export function validateScreenshotUrl(haCoreUrl) {
  // Strip trailing slash before testing
  const origin = haCoreUrl.replace(/\/+$/, "");
  const allowed = ALLOWED_ORIGIN_PATTERNS.some(pattern => pattern.test(origin));
  if (!allowed) {
    throw new Error(
      `Screenshot blocked: "${origin}" is not a recognised local Home Assistant address.\n` +
      "Only private-network and localhost origins are permitted to prevent misuse of the\n" +
      "headless browser. Configure a local internal_url in Settings → System → Network."
    );
  }
}

// ============================================================================
// takeScreenshot
// ============================================================================

/**
 * Take a screenshot of a Home Assistant page using headless Chromium.
 *
 * @param {string} haCoreUrl - HA Core base URL (e.g. "http://192.168.1.100:8123")
 * @param {string} urlPath   - Page path to screenshot (e.g. "/lovelace/0")
 * @param {object} [options]
 * @param {number} [options.width=1280]      - Viewport width in pixels
 * @param {number} [options.height=720]      - Viewport height in pixels
 * @param {number} [options.waitSeconds=3]   - Extra wait time for dynamic content
 * @param {boolean} [options.fullPage=false] - Capture full scrollable page
 * @returns {Promise<string>} Base64-encoded PNG screenshot
 * @throws {Error} If the URL is not on the allowlist or capture fails
 */
export async function takeScreenshot(haCoreUrl, urlPath, options = {}) {
  // Security check: reject non-local HA URLs before launching the browser
  validateScreenshotUrl(haCoreUrl);

  const { width = 1280, height = 720, waitSeconds = 3, fullPage = false } = options;

  const browser = await puppeteer.launch({
    executablePath: CHROMIUM_PATH,
    headless: "new",
    args: [
      "--no-sandbox",
      "--disable-setuid-sandbox",
      "--disable-dev-shm-usage",
      "--disable-gpu",
      "--no-first-run",
      "--disable-extensions",
    ],
  });

  try {
    const page = await browser.newPage();
    await page.setViewport({ width, height });

    // ── Auth Strategy 1: localStorage tokens ──────────────────────────
    // The HA frontend reads "hassTokens" from localStorage on startup.
    // We inject a token entry with a non-empty refresh_token (empty string
    // is falsy and causes the auth module to reject the token) and a
    // far-future expiry so it won't attempt a refresh during our brief
    // screenshot window.
    await page.evaluateOnNewDocument((config) => {
      try {
        localStorage.setItem("hassTokens", JSON.stringify({
          hassUrl: config.hassUrl,
          clientId: config.hassUrl + "/",
          access_token: config.token,
          token_type: "Bearer",
          refresh_token: "ha-screenshot-tool",
          expires_in: 1800,
          expires: Date.now() + 1800000,
        }));
      } catch (e) {
        // localStorage may be unavailable in rare cases — fall through
        // to the other auth strategies
      }

      // ── Auth Strategy 2: WebSocket interceptor ────────────────────
      // Monkey-patch the WebSocket constructor so that when the HA
      // frontend opens /api/websocket, our listener auto-responds to
      // the auth_required handshake with the LLAT.
      const _WebSocket = window.WebSocket;
      window.WebSocket = function (url, protocols) {
        const ws = protocols !== undefined
          ? new _WebSocket(url, protocols)
          : new _WebSocket(url);

        if (url && url.includes("/api/websocket")) {
          let authSent = false;
          ws.addEventListener("message", function (event) {
            try {
              const msg = JSON.parse(event.data);
              if (msg.type === "auth_required" && !authSent) {
                authSent = true;
                ws.send(JSON.stringify({
                  type: "auth",
                  access_token: config.token,
                }));
              }
            } catch (_) { /* ignore parse errors on non-JSON frames */ }
          });
        }

        return ws;
      };
      // Preserve prototype chain so instanceof checks still work
      window.WebSocket.prototype = _WebSocket.prototype;
      window.WebSocket.CONNECTING = _WebSocket.CONNECTING;
      window.WebSocket.OPEN = _WebSocket.OPEN;
      window.WebSocket.CLOSING = _WebSocket.CLOSING;
      window.WebSocket.CLOSED = _WebSocket.CLOSED;
    }, { hassUrl: haCoreUrl, token: HA_ACCESS_TOKEN });

    // ── Auth Strategy 3: HTTP request interception ────────────────────
    // Add the Authorization header to every request targeting the HA
    // server. External requests (fonts, map tiles, etc.) are left
    // untouched so we don't leak the token to third parties.
    await page.setRequestInterception(true);
    page.on("request", (req) => {
      if (req.url().startsWith(haCoreUrl)) {
        req.continue({
          headers: { ...req.headers(), Authorization: `Bearer ${HA_ACCESS_TOKEN}` },
        });
      } else {
        req.continue();
      }
    });

    // Navigate to the target page
    const normalizedPath = urlPath.startsWith("/") ? urlPath : `/${urlPath}`;
    const fullUrl = `${haCoreUrl}${normalizedPath}`;

    // Use "load" rather than "networkidle0"/"networkidle2" because the HA
    // frontend keeps a persistent WebSocket open (/api/websocket). "load"
    // fires once the page and its subresources are fetched, ignoring ongoing
    // connections. Dynamic content rendering is handled by the waitSeconds
    // delay below.
    await page.goto(fullUrl, {
      waitUntil: "load",
      timeout: 30000,
    });

    // Wait for dynamic content to render (dashboards, cards, graphs, etc.)
    const clampedWait = Math.max(0, Math.min(waitSeconds, 15));
    if (clampedWait > 0) {
      await new Promise(resolve => setTimeout(resolve, clampedWait * 1000));
    }

    const screenshotBuffer = await page.screenshot({
      type: "png",
      fullPage,
      encoding: "base64",
    });

    return screenshotBuffer;
  } finally {
    await browser.close();
  }
}
