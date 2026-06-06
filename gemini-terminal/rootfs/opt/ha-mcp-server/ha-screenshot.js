#!/usr/bin/env node
/**
 * ha-screenshot - CLI tool to take Home Assistant screenshots
 * Usage: ha-screenshot <path> [width] [height] [wait_seconds]
 */
import puppeteer from 'puppeteer-core';
import { writeFileSync } from 'fs';

const urlPath = process.argv[2] || '/lovelace/0';
const width = parseInt(process.argv[3] || '1280');
const height = parseInt(process.argv[4] || '720');
const waitSeconds = parseInt(process.argv[5] || '3');

const CHROMIUM_PATH = process.env.PUPPETEER_EXECUTABLE_PATH || '/usr/bin/chromium';
const HA_ACCESS_TOKEN = process.env.HA_ACCESS_TOKEN;
const SUPERVISOR_TOKEN = process.env.SUPERVISOR_TOKEN;

async function run() {
    if (!HA_ACCESS_TOKEN) {
        console.error("Error: HA_ACCESS_TOKEN not set. Set 'access_token' in add-on config.");
        process.exit(1);
    }

    // Discover HA Core URL
    let haCoreUrl = 'http://supervisor/core';
    
    const browser = await puppeteer.launch({
        executablePath: CHROMIUM_PATH,
        headless: "new",
        args: ["--no-sandbox", "--disable-setuid-sandbox"]
    });

    try {
        const page = await browser.newPage();
        await page.setViewport({ width, height });

        // Auth strategy
        await page.evaluateOnNewDocument((token) => {
            localStorage.setItem("hassTokens", JSON.stringify({
                access_token: token,
                token_type: "Bearer",
                refresh_token: "ha-screenshot-cli"
            }));
        }, HA_ACCESS_TOKEN);

        const fullUrl = `${haCoreUrl}${urlPath.startsWith('/') ? '' : '/'}${urlPath}`;
        console.error(`Navigating to ${fullUrl}...`);
        
        await page.goto(fullUrl, { waitUntil: "load", timeout: 30000 });
        if (waitSeconds > 0) await new Promise(r => setTimeout(r, waitSeconds * 1000));

        const buffer = await page.screenshot({ type: "png" });
        const outputPath = `/tmp/screenshot.png`;
        writeFileSync(outputPath, buffer);
        
        console.log(`Screenshot saved to ${outputPath}`);
        console.log(`BASE64_START`);
        console.log(buffer.toString('base64'));
        console.log(`BASE64_END`);

    } catch (e) {
        console.error(`Error: ${e.message}`);
        process.exit(1);
    } finally {
        await browser.close();
    }
}

run();
