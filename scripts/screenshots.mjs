import { chromium } from "@playwright/test";
import fs from "node:fs";
fs.mkdirSync("docs/screenshots", { recursive: true });
const browser = await chromium.launch();
const page = await browser.newPage({
  viewport: { width: 1440, height: 1100 },
  deviceScaleFactor: 1,
});
await page.goto("http://localhost:5175");
await page.getByRole("button", { name: "Enter Our Little World" }).click();
await page.goto("http://localhost:5175/#/pets");
for (let i = 0; i < 4; i++) {
  await page.getByRole("button", { name: "Bring me home" }).first().click();
  await page.getByRole("button", { name: "Already home" }).nth(i).waitFor();
}
await page.goto("http://localhost:5175/#/");
await page.getByRole("button", { name: "Cuddle", exact: true }).waitFor();
await page.evaluate(() => document.fonts.ready);
await page.getByRole("status").waitFor({ state: "hidden" });
await page.screenshot({
  path: "docs/screenshots/home-desktop.png",
  fullPage: true,
});
await page.setViewportSize({ width: 390, height: 844 });
await page.screenshot({
  path: "docs/screenshots/home-mobile.png",
  fullPage: true,
});
await page.goto("http://localhost:5175/#/music");
await page.getByRole("button", { name: "Play", exact: true }).waitFor();
await page.screenshot({
  path: "docs/screenshots/music-mobile.png",
  fullPage: true,
});
await browser.close();
console.log("Saved desktop and mobile previews");
