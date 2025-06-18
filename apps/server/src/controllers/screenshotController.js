import { chromium } from "playwright";

export const captureMapScreenshot = async (req, res) => {
    const {
        center,
        zoom = 5,
        facilities = [],
        width = 1280,
        height = 1280,
        mapId = null,
    } = req.body || {};

    if (
        !center ||
        typeof center.lat !== "number" ||
        typeof center.lng !== "number"
    ) {
        return res
            .status(400)
            .json({ message: "center with lat & lng required" });
    }

    // Build HTML content with Google Maps JS API
    const apiKey = process.env.MAPS_API_KEY || "";
    if (!apiKey) {
        return res
            .status(500)
            .json({ message: "Google Maps API key not configured on server" });
    }

    // Build the HTML (no more logo support for markers)
    const html = buildMapHtml({
        apiKey,
        center,
        zoom,
        facilities,
        mapId: process.env.MAP_ID,
        width,
        height,
    });

    let browser;
    try {
        browser = await chromium.launch({
            args: ["--disable-dev-shm-usage", "--no-sandbox"],
            headless: true,
        });

        const scale = 2; // retina quality
        const context = await browser.newContext({
            viewport: { width, height },
            deviceScaleFactor: scale,
        });

        const page = await context.newPage();
        // Ensure JS sees the high DPR value (important for retina tiles)
        await page.addInitScript(() => {
            Object.defineProperty(window, "devicePixelRatio", { get: () => 2 });
        });

        await page.setContent(html, {
            waitUntil: "domcontentloaded",
            timeout: 60000,
        });

        // Wait until our custom flag is set from the page when Google Map fires the first 'idle' event
        await page
            .waitForFunction(() => window.__MAP_READY === true, {
                timeout: 30000,
            })
            .catch(() => {});
        // extra buffer
        await page.waitForTimeout(1000);

        const buffer = await page.screenshot({ type: "png" });
        res.setHeader("Content-Type", "image/png");
        return res.end(buffer);
    } catch (err) {
        console.error("Screenshot capture failed", err);
        return res
            .status(500)
            .json({ message: "Failed to capture screenshot" });
    } finally {
        if (browser) {
            await browser.close();
        }
    }
};

function buildMapHtml({
    apiKey,
    center,
    zoom,
    facilities,
    mapId,
    width,
    height,
}) {
    const mapIdSegment = mapId ? ", mapId: '" + mapId + "'" : "";

    return `<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <title>Map Screenshot</title>
    <style>
      html,body,#map{ margin:0; padding:0; width:${width}px; height:${height}px; }
    </style>
    <script src="https://maps.googleapis.com/maps/api/js?key=${apiKey}"></script>
    <script>
      function init() {
        const center = { lat: ${center.lat}, lng: ${center.lng} };
        const map = new google.maps.Map(document.getElementById('map'), { zoom: ${zoom}, center, disableDefaultUI: true${mapIdSegment} });
        const facilities = ${JSON.stringify(facilities)};
        facilities.forEach(f => {
          new google.maps.Marker({ position: { lat: f.latitude, lng: f.longitude }, map, icon: generateIcon(f) });
        });

        google.maps.event.addListenerOnce(map, 'idle', () => { window.__MAP_READY = true; });
      }

      function generateIcon(facility) {
        const mainColor = facility.color || '#0ea5e9';
        const svg = '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="32" viewBox="0 0 120 160" fill="none">' +
            '<circle cx="60" cy="60" r="50" fill="white" stroke="' + mainColor + '" stroke-width="10" />' +
            '<path d="M30 100 L90 100 L60 150 Z" fill="' + mainColor + '" />' +
            '</svg>';
        return {
          url: 'data:image/svg+xml;charset=UTF-8,' + encodeURIComponent(svg)
        };
      }

      window.onload = init;
    </script>
  </head>
  <body>
    <div id="map"></div>
  </body>
</html>`;
}
