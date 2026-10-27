// Browser-only layout check: intercepts a built app's requests; opens no listening server.
import { build } from "vite";
import { chromium } from "@playwright/test";
import fs from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import { initialWorld, species } from "../src/lib/model.ts";
const root = await fs.mkdtemp(path.join(os.tmpdir(), "little-paws-layout-"));
process.env.VITE_SUPABASE_URL = "";
process.env.VITE_SUPABASE_PUBLISHABLE_KEY = "";
process.env.VITE_BASE_PATH = "/";
await build({
  base: "/",
  logLevel: "error",
  build: { outDir: root, emptyOutDir: false },
});
const browser = await chromium.launch();
const origin = "http://localhost:5199";
const types = {
  ".html": "text/html",
  ".js": "text/javascript",
  ".css": "text/css",
  ".webp": "image/webp",
  ".png": "image/png",
  ".wav": "audio/wav",
};
const sizes = [
  [1880, 870],
  [1440, 900],
  [1366, 768],
  [1024, 768],
  [768, 1024],
  [601, 800],
  [390, 844],
  [375, 667],
  [320, 568],
  [844, 390],
];
await fs.mkdir("docs/screenshots", { recursive: true });
try {
  for (const [width, height] of sizes) {
    const context = await browser.newContext({
      viewport: { width, height },
      deviceScaleFactor: 1,
    });
    await context.route("**/*", async (route) => {
      const url = new URL(route.request().url());
      if (url.origin !== origin) return route.continue();
      const relative =
        decodeURIComponent(url.pathname) === "/"
          ? "index.html"
          : decodeURIComponent(url.pathname).slice(1);
      const file = path.resolve(root, relative);
      if (!file.startsWith(root + path.sep)) return route.abort();
      try {
        await route.fulfill({
          path: file,
          contentType: types[path.extname(file)] || "application/octet-stream",
        });
      } catch {
        await route.fulfill({ status: 404, body: "Not found" });
      }
    });
    const w = initialWorld();
    w.pets = species.map((s) => ({
      id: s.key,
      name: s.name,
      species: s.key,
      happiness: 75,
      fullness: 65,
      energy: 80,
      affection: 60,
      activity: "idle",
      adopted_at: new Date().toISOString(),
      updated_at: new Date(0).toISOString(),
    }));
    await context.addInitScript((world) => {
      localStorage.setItem("little-paws-entered", "yes");
      localStorage.setItem("little-paws-world-v1", JSON.stringify(world));
    }, w);
    const page = await context.newPage();
    await page.goto(origin);
    await page
      .getByRole("group", { name: "Pet care actions", exact: true })
      .waitFor();
    await page.evaluate(() => document.fonts.ready);
    await page.waitForFunction(() =>
      Array.from(document.images).every(
        (i) => i.complete && i.naturalWidth > 0,
      ),
    );
    const metrics = await page.evaluate(() => {
      const actions = Array.from(
        document.querySelectorAll(".care-actions button"),
      ).map((b) => {
        const r = b.getBoundingClientRect();
        return {
          name: b.textContent.trim(),
          x: r.x,
          y: r.y,
          width: r.width,
          height: r.height,
          bottom: r.bottom,
        };
      });
      const nav = document.querySelector(".mobile-nav");
      const r = nav?.getBoundingClientRect();
      return {
        actions,
        overflow: document.documentElement.scrollWidth > innerWidth,
        navTop: r && r.height > 0 ? r.top : innerHeight,
      };
    });
    if (metrics.overflow)
      throw Error(`${width}x${height}: horizontal overflow`);
    for (const a of metrics.actions) {
      if (a.width < 43.5 || a.height < 43.5)
        throw Error(
          `${width}x${height}: touch target too small: ${JSON.stringify(a)}`,
        );
      if (a.x < 0 || a.x + a.width > width + 1 || a.y < 0 || a.bottom > height)
        throw Error(
          `${width}x${height}: care button off screen: ${JSON.stringify(a)}`,
        );
      if (width <= 600 && a.bottom > metrics.navTop)
        throw Error(`${width}x${height}: care overlaps navigation`);
    }
    if (metrics.actions.length !== 8) throw Error("Missing care actions");
    await page.getByRole("button", { name: "Feed", exact: true }).click();
    await page.getByRole("status").filter({ hasText: "Mochi loved" }).waitFor();
    await page
      .getByRole("combobox", { name: "Choose a pet to care for" })
      .selectOption("kitten");
    await page.getByRole("button", { name: "Cuddle", exact: true }).click();
    await page.getByRole("status").filter({ hasText: "Luna loved" }).waitFor();
    await page.getByRole("button", { name: "Dismiss notification" }).click();
    if (width === 1440 || width === 390 || width === 320 || width === 844) {
      await page.screenshot({
        path: `docs/screenshots/home-responsive-${width}.png`,
        animations: "disabled",
      });
    }
    console.log(
      `PASS ${width}x${height}: 8 visible touch controls, pet switching, feeding, cuddling, no overflow`,
    );
    await context.close();
  }
} finally {
  await browser.close();
}
console.log("Responsive checks complete; no local server was started.");
