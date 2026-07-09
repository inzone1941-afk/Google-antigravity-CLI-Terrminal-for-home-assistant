/**
 * Home Assistant API Helpers
 *
 * Provides the three core async helpers for communicating with Home Assistant
 * from within the Supervisor add-on environment:
 *
 *   - callHA()            — Proxy requests through the Supervisor core API
 *   - callSupervisor()    — Call the Supervisor API directly
 *   - discoverHACoreUrl() — Auto-detect the HA Core frontend URL
 */

const SUPERVISOR_API = "http://supervisor/core/api";
const SUPERVISOR_TOKEN = process.env.SUPERVISOR_TOKEN;

/**
 * Emit a structured log line to stderr (captured by the MCP client).
 * Lightweight local logger to avoid circular imports with index.js.
 *
 * @param {"debug"|"info"|"warning"|"error"} level
 * @param {string} logger  Logger name (e.g. "ha-api")
 * @param {object} data    Structured payload
 */
function _log(level, logger, data) {
  console.error(
    JSON.stringify({ type: "log", level, logger, data, timestamp: new Date().toISOString() })
  );
}

// ============================================================================
// callHA — Supervisor-proxied Core API
// ============================================================================

/**
 * Call Home Assistant via the Supervisor API proxy.
 * Used for most endpoints proxied through the Supervisor (e.g. /api/states).
 *
 * @param {string} endpoint  API path, e.g. "/states/light.living_room"
 * @param {string} [method="GET"]
 * @param {object|null} [body]  Request body (serialised to JSON automatically)
 * @returns {Promise<object|string>} Parsed JSON or raw text
 * @throws {Error} On non-2xx responses
 */
export async function callHA(endpoint, method = "GET", body = null) {
  _log("debug", "ha-api", { action: "request", endpoint, method });

  const options = {
    method,
    headers: {
      Authorization: `Bearer ${SUPERVISOR_TOKEN}`,
      "Content-Type": "application/json",
    },
  };

  if (body) {
    options.body = JSON.stringify(body);
  }

  const response = await fetch(`${SUPERVISOR_API}${endpoint}`, options);

  if (!response.ok) {
    const text = await response.text();
    _log("error", "ha-api", { action: "error", endpoint, status: response.status, error: text });
    throw new Error(`HA API error (${response.status}): ${text}`);
  }

  const contentType = response.headers.get("content-type");
  if (contentType && contentType.includes("application/json")) {
    const result = await response.json();
    _log("debug", "ha-api", { action: "response", endpoint, success: true });
    return result;
  }
  return response.text();
}

// ============================================================================
// callSupervisor — Direct Supervisor API
// ============================================================================

/**
 * Call the Home Assistant Supervisor API directly.
 * Used for add-on management, updates, jobs, and system operations.
 *
 * @param {string} endpoint  Supervisor API path, e.g. "/addons"
 * @param {string} [method="GET"]
 * @param {object|null} [body]
 * @returns {Promise<object|string>} Unwrapped data (strips the Supervisor envelope)
 * @throws {Error} On non-2xx responses
 */
export async function callSupervisor(endpoint, method = "GET", body = null) {
  _log("debug", "supervisor-api", { action: "request", endpoint, method });

  const options = {
    method,
    headers: {
      Authorization: `Bearer ${SUPERVISOR_TOKEN}`,
      "Content-Type": "application/json",
    },
  };

  if (body) {
    options.body = JSON.stringify(body);
  }

  const response = await fetch(`http://supervisor${endpoint}`, options);

  if (!response.ok) {
    const text = await response.text();
    _log("error", "supervisor-api", { action: "error", endpoint, status: response.status, error: text });
    throw new Error(`Supervisor API error (${response.status}): ${text}`);
  }

  const contentType = response.headers.get("content-type");
  if (contentType && contentType.includes("application/json")) {
    const result = await response.json();
    _log("debug", "supervisor-api", { action: "response", endpoint, success: true });
    // Supervisor API wraps data in { result: "ok", data: {...} }
    return result.data !== undefined ? result.data : result;
  }
  return response.text();
}

// ============================================================================
// discoverHACoreUrl — Frontend URL detection
// ============================================================================

/**
 * Discover the Home Assistant Core frontend URL.
 *
 * Tries internal_url / external_url from /api/config first, then falls back
 * to network interface discovery via the Supervisor API.
 *
 * @returns {Promise<string>} The HA Core URL (e.g. "http://192.168.1.100:8123")
 * @throws {Error} If the URL cannot be determined
 */
export async function discoverHACoreUrl() {
  let haConfig;
  try {
    haConfig = await callHA("/config");
  } catch (e) {
    throw new Error(`Failed to get HA config: ${e.message}`);
  }

  let haCoreUrl = (haConfig.internal_url || haConfig.external_url || "").replace(/\/+$/, "");

  if (!haCoreUrl) {
    // internal_url is "automatic" (null) — discover from Supervisor APIs
    try {
      const [coreInfo, networkInfo] = await Promise.all([
        callSupervisor("/core/info"),
        callSupervisor("/network/info"),
      ]);

      const port = coreInfo.port || 8123;
      const ssl = coreInfo.ssl || false;
      const protocol = ssl ? "https" : "http";

      let hostIp = null;
      if (networkInfo.interfaces) {
        const primary = networkInfo.interfaces.find(i => i.primary && i.connected);
        const iface = primary || networkInfo.interfaces.find(i => i.connected);
        if (iface?.ipv4?.address?.[0]) {
          hostIp = iface.ipv4.address[0].split("/")[0];
        }
      }

      if (hostIp) {
        haCoreUrl = `${protocol}://${hostIp}:${port}`;
      }
    } catch (e) {
      _log("warning", "ha-core-url", { action: "network_fallback_failed", error: e.message });
    }
  }

  if (!haCoreUrl) {
    throw new Error(
      "Could not determine HA Core URL. " +
      "Set internal_url in Settings → System → Network, " +
      "or ensure the host has a connected network interface."
    );
  }

  _log("debug", "ha-core-url", { action: "discovered", url: haCoreUrl });
  return haCoreUrl;
}
