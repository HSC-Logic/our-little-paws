// Checks the real generated service worker; its temporary HTTP listener always closes.
import { build } from "vite";
import { chromium } from "@playwright/test";
import sharp from "sharp";
import fs from "node:fs/promises";
import http from "node:http";
import path from "node:path";
import os from "node:os";
import assert from "node:assert/strict";
const base = "/our-little-paws/";
const root = await fs.mkdtemp(path.join(os.tmpdir(), "little-paws-pwa-"));
process.env.VITE_SUPABASE_URL = "";
process.env.VITE_SUPABASE_PUBLISHABLE_KEY = "";
process.env.VITE_BASE_PATH = base;
await build({
  base,
  logLevel: "error",
  build: { outDir: root, emptyOutDir: false },
});
let checks = 0;
function check(condition, message) {
  assert.ok(condition, message);
  console.log("PASS " + message);
  checks++;
}
const mime = {
  ".html": "text/html",
  ".js": "text/javascript",
  ".css": "text/css",
  ".webmanifest": "application/manifest+json",
  ".png": "image/png",
  ".svg": "image/svg+xml",
  ".webp": "image/webp",
  ".wav": "audio/wav",
};
const server = http.createServer(async (req, res) => {
  const url = new URL(req.url, "http://localhost");
  if (url.pathname === base + "api/private-letter") {
    res.writeHead(200, {
      "Content-Type": "application/json",
      "Cache-Control": "no-store",
    });
    res.end(JSON.stringify({ body: "PRIVATE_TEST_FIXTURE" }));
    return;
  }
  if (!url.pathname.startsWith(base)) {
    res.writeHead(404);
    res.end();
    return;
  }
  const relative =
      decodeURIComponent(url.pathname.slice(base.length)) || "index.html",
    file = path.resolve(root, relative);
  if (!file.startsWith(root + path.sep)) {
    res.writeHead(403);
    res.end();
    return;
  }
  try {
    const bytes = await fs.readFile(file);
    res.writeHead(200, {
      "Content-Type": mime[path.extname(file)] || "application/octet-stream",
      "Cache-Control": "no-cache",
    });
    res.end(bytes);
  } catch {
    res.writeHead(404);
    res.end();
  }
});
let browser;
try {
  await new Promise((resolve, reject) => {
    server.once("error", reject);
    server.listen(0, "127.0.0.1", resolve);
  });
  const origin = `http://127.0.0.1:${server.address().port}`,
    url = origin + base;
  browser = await chromium.launch();
  const context = await browser.newContext();
  const page = await context.newPage();
  await page.goto(url);
  await page.getByRole("button", { name: "Enter Our Little World" }).waitFor();
  const manifestURL = await page
    .locator("link[rel=manifest]")
    .getAttribute("href");
  check(
    manifestURL === base + "manifest.webmanifest",
    "Manifest uses the GitHub Pages base path",
  );
  const manifest = await (
    await context.request.get(origin + manifestURL)
  ).json();
  check(
    new URL(manifest.start_url, origin + manifestURL).href === url + "#/",
    "Installed app launches the hash-routed home",
  );
  check(
    new URL(manifest.scope, origin + manifestURL).href === url &&
      manifest.display === "standalone",
    "Standalone mode and app-scoped navigation",
  );
  for (const size of [192, 512]) {
    const icon = manifest.icons.find(
      (i) => i.sizes === `${size}x${size}` && i.purpose === "any",
    );
    const bytes = await (
      await context.request.get(new URL(icon.src, origin + manifestURL).href)
    ).body();
    const meta = await sharp(bytes).metadata();
    check(
      meta.width === size && meta.height === size,
      `Valid ${size}px install icon`,
    );
  }
  const mask = manifest.icons.find((i) => i.purpose === "maskable");
  const maskMeta = await sharp(
    await (
      await context.request.get(new URL(mask.src, origin + manifestURL).href)
    ).body(),
  ).metadata();
  check(
    maskMeta.width === 512 && !maskMeta.hasAlpha,
    "Opaque maskable icon with a safe padded mark",
  );
  await page.evaluate(() => navigator.serviceWorker.ready.then(() => true));
  await page.waitForFunction(() => !!navigator.serviceWorker.controller);
  check(
    (await page.evaluate(
      () => navigator.serviceWorker.controller.scriptURL,
    )) ===
      url + "sw.js",
    "Generated worker controls the Pages project scope",
  );
  const cdp = await context.newCDPSession(page);
  const appManifest = await cdp.send("Page.getAppManifest");
  check(
    appManifest.errors.length === 0,
    "Chromium parses the app manifest without errors",
  );
  const criteria = await cdp.send("Page.getInstallabilityErrors");
  check(
    criteria.installabilityErrors.length === 0,
    "Chromium installability criteria pass",
  );
  await page.evaluate(async (base) => {
    await fetch(base + "api/private-letter").then((r) => r.json());
  }, base);
  const cached = await page.evaluate(async () => {
    const entries = [];
    for (const key of await caches.keys()) {
      for (const request of await (await caches.open(key)).keys())
        entries.push(request.url);
    }
    return entries;
  });
  check(
    cached.length > 20 && cached.every((u) => new URL(u).origin === origin),
    "Public application assets are precached",
  );
  check(
    !cached.some(
      (u) =>
        u.includes("/api/") || u.includes("/auth/") || u.includes("/rest/"),
    ),
    "Dynamic/private responses stay out of the offline cache",
  );
  await context.setOffline(true);
  await page.reload();
  await page.getByRole("button", { name: "Enter Our Little World" }).waitFor();
  check(true, "Offline reopening loads the cached app shell");
  await page.getByRole("button", { name: "Enter Our Little World" }).click();
  await page.getByRole("link", { name: "Meet the little ones" }).click();
  await page.getByRole("button", { name: "Bring me home" }).first().click();
  await page.getByRole("button", { name: "Already home" }).waitFor();
  check(true, "An unvisited lazy route and demo adoption work offline");
  await page.goto(url + "#/music");
  await page.getByRole("button", { name: "Play", exact: true }).click();
  await page.waitForFunction(() => {
    const a = document.querySelector("audio");
    return a && !a.paused && a.currentTime > 0;
  });
  check(true, "Bundled original music plays from the offline cache");
  await context.setOffline(false);
  await page.goto(url + "#/settings");
  await page
    .getByRole("heading", { name: "A little home on your home screen" })
    .waitFor();
  check(true, "Installation guidance is available in settings");
  console.log(`${checks} PWA checks passed.`);
} finally {
  if (browser) await browser.close();
  server.closeAllConnections();
  await new Promise((resolve) => server.close(resolve));
  console.log("Temporary PWA test listener stopped.");
}
