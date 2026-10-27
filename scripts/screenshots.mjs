import { chromium } from "@playwright/test";
import { spawn } from "node:child_process";
import fs from "node:fs";
const origin = "http://localhost:5195";
const server = spawn(
  process.execPath,
  [
    "node_modules/vite/bin/vite.js",
    "--host",
    "localhost",
    "--port",
    "5195",
    "--strictPort",
  ],
  {
    env: {
      ...process.env,
      VITE_SUPABASE_URL: "",
      VITE_SUPABASE_PUBLISHABLE_KEY: "",
      VITE_BASE_PATH: "/",
    },
    stdio: "ignore",
    windowsHide: true,
  },
);
let browser;
try {
  for (let i = 0; i < 50; i++) {
    try {
      if ((await fetch(origin)).ok) break;
    } catch {}
    await new Promise((r) => setTimeout(r, 200));
  }
  fs.mkdirSync("docs/screenshots", { recursive: true });
  browser = await chromium.launch();
  const page = await browser.newPage({
    viewport: { width: 1440, height: 1100 },
    deviceScaleFactor: 1,
  });
  const ready = async () => {
    await page.evaluate(() => window.scrollTo(0, 0));
    await page.evaluate(() => document.fonts.ready);
    await page.waitForFunction(() =>
      Array.from(document.images).every(
        (i) => i.complete && i.naturalWidth > 0,
      ),
    );
  };
  await page.goto(origin);
  await ready();
  await page.screenshot({
    path: "docs/screenshots/welcome-desktop.png",
    fullPage: true,
    animations: "disabled",
  });
  await page.getByRole("button", { name: "Enter Our Little World" }).click();
  await page.goto(origin + "/#/pets");
  for (let i = 0; i < 4; i++) {
    await page.getByRole("button", { name: "Bring me home" }).first().click();
    await page.getByRole("button", { name: "Already home" }).nth(i).waitFor();
  }
  await ready();
  await page.screenshot({
    path: "docs/screenshots/adoption-desktop.png",
    fullPage: true,
    animations: "disabled",
  });
  await page.goto(origin + "/#/decorate");
  await page.getByRole("heading", { name: "Sage daydream" }).waitFor();
  await ready();
  await page.screenshot({
    path: "docs/screenshots/decorate-desktop.png",
    fullPage: true,
    animations: "disabled",
  });
  await page.setViewportSize({ width: 390, height: 844 });
  await page.screenshot({
    path: "docs/screenshots/decorate-mobile.png",
    fullPage: true,
    animations: "disabled",
  });
  await page.setViewportSize({ width: 1440, height: 1100 });
  await page.goto(origin + "/#/");
  await page.getByRole("button", { name: "Cuddle", exact: true }).waitFor();
  await ready();
  await page.getByRole("status").waitFor({ state: "hidden" });
  await page.screenshot({
    path: "docs/screenshots/home-desktop.png",
    fullPage: true,
    animations: "disabled",
  });
  await page.setViewportSize({ width: 390, height: 844 });
  await ready();
  await page.screenshot({
    path: "docs/screenshots/home-mobile.png",
    fullPage: true,
    animations: "disabled",
  });
  await page.setViewportSize({ width: 1440, height: 1100 });
  await page.goto(origin + "/#/decorate");
  for (const name of ["Honey blossom rug", "Mint cloud bed"]) {
    await page
      .locator("article")
      .filter({ has: page.getByRole("heading", { name, exact: true }) })
      .getByRole("button")
      .click();
  }
  await page.goto(origin + "/#/");
  await page.getByRole("button", { name: "Cuddle", exact: true }).waitFor();
  await ready();
  await page.getByRole("status").waitFor({ state: "hidden" });
  await page.screenshot({
    path: "docs/screenshots/home-decorated-desktop.png",
    fullPage: true,
    animations: "disabled",
  });
  await page.setViewportSize({ width: 390, height: 844 });
  await ready();
  await page.screenshot({
    path: "docs/screenshots/home-decorated-mobile.png",
    fullPage: true,
    animations: "disabled",
  });
  await page.goto(origin + "/#/music");
  await page.getByRole("button", { name: "Play", exact: true }).waitFor();
  await ready();
  await page.screenshot({
    path: "docs/screenshots/music-mobile.png",
    fullPage: true,
    animations: "disabled",
  });
  console.log("Saved welcome, adoption, home, and music screenshots.");
} finally {
  if (browser) await browser.close();
  server.kill();
}
