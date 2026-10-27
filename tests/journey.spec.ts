import { test, expect } from "@playwright/test";
test("a complete little demo journey", async ({ page }) => {
  await page.goto("/");
  await page.getByRole("button", { name: "Enter Our Little World" }).click();
  await expect(page.getByText("DEMO WORLD", { exact: false })).toBeVisible();
  await page.getByRole("link", { name: "Meet the little ones" }).click();
  await page.getByRole("button", { name: "Bring me home" }).first().click();
  await page.goto("/#/");
  await expect(
    page.getByRole("button", { name: "Mochi rename" }),
  ).toBeVisible();
  await page.getByRole("button", { name: "Cuddle", exact: true }).click();
  await expect(page.getByRole("status")).toContainText("Mochi loved");
  await page.reload();
  await expect(
    page.getByRole("button", { name: "Mochi rename" }),
  ).toBeVisible();
  await page.goto("/#/mail");
  await page.getByRole("button", { name: "Write a little letter" }).click();
  await page.getByLabel("Subject", { exact: true }).fill("A tiny thank you");
  await page.getByLabel("Your words").fill("For making our world softer.");
  await page.getByRole("button", { name: "Seal with love" }).click();
  await page.getByRole("button", { name: /A tiny thank you/ }).click();
  await expect(page.getByText("For making our world softer.")).toBeVisible();
  await page.getByRole("button", { name: "Close", exact: true }).click();
  await page.goto("/#/music");
  await page.getByRole("button", { name: "Play", exact: true }).click();
  await expect(
    page.getByRole("button", { name: "Pause", exact: true }),
  ).toBeVisible();
  await expect
    .poll(() =>
      page
        .locator("audio")
        .evaluate((audio: HTMLAudioElement) => audio.currentTime),
    )
    .toBeGreaterThan(0);
  await page.getByRole("button", { name: "Next track" }).click();
  await expect(page.locator("audio")).toHaveAttribute("src", "/audio/rain.wav");
  await expect
    .poll(() =>
      page
        .locator("audio")
        .evaluate(
          (audio: HTMLAudioElement) => !audio.paused && audio.currentTime > 0,
        ),
    )
    .toBe(true);
  await page.getByRole("button", { name: "Pause", exact: true }).click();
  await expect
    .poll(() =>
      page.locator("audio").evaluate((audio: HTMLAudioElement) => audio.paused),
    )
    .toBe(true);
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= innerWidth,
    ),
  ).toBe(true);
});

test("decorating, both games, settings, favorites, and offline state", async ({
  page,
  context,
  isMobile,
}) => {
  await page.goto("/");
  await page.getByRole("button", { name: "Enter Our Little World" }).click();
  if (isMobile) {
    await page.getByRole("button", { name: "More rooms" }).click();
    await page
      .getByRole("link", { name: "Make it cozy", exact: true })
      .last()
      .click();
  } else {
    await page
      .getByRole("link", { name: "Make it cozy", exact: true })
      .first()
      .click();
  }
  await page
    .locator("article")
    .filter({ has: page.getByRole("heading", { name: "Little pink bow" }) })
    .getByRole("button")
    .click();
  await expect(page.locator(".treat-count")).toContainText("22");
  await page.goto("/#/music");
  await page
    .getByRole("button", {
      name: "Favorite A soft little morning",
      exact: true,
    })
    .click();
  await expect(
    page.getByRole("button", {
      name: "Favorite A soft little morning",
      exact: true,
    }),
  ).toHaveAttribute("aria-pressed", "true");
  await page.goto("/#/play");
  await page
    .getByRole("button", { name: "Musical Notes", exact: true })
    .click();
  await page.getByRole("button", { name: "Let’s play" }).click();
  for (const n of ["C", "E", "G", "E", "C", "C", "E", "G", "E", "C"])
    await page
      .locator(".notes")
      .getByRole("button", { name: n, exact: true })
      .click();
  await expect(
    page.getByText("You made 10 happy little moments!"),
  ).toBeVisible();
  await page
    .getByRole("button", { name: /Collect participation gift/ })
    .click();
  await expect(page.locator(".treat-count")).toContainText("25");
  await page
    .getByRole("button", { name: "Catch the Treats", exact: true })
    .click();
  await page.getByRole("button", { name: "Let’s play" }).click();
  await page.getByRole("button", { name: "Pause", exact: true }).click();
  await expect(page.getByRole("button", { name: "Resume" })).toBeVisible();
  await page.getByRole("button", { name: "Finish", exact: true }).click();
  await page.goto("/#/settings");
  await page
    .getByLabel("A little wrapped surprise")
    .fill("You are my favorite melody.");
  await page.getByRole("button", { name: "Save our little details" }).click();
  await page.goto("/#/moments");
  await page
    .getByRole("button", { name: /A little something for you/ })
    .click();
  await expect(
    page.getByRole("heading", { name: "You are my favorite melody." }),
  ).toBeVisible();
  await context.setOffline(true);
  await expect(
    page.getByText("Offline · local demo is available"),
  ).toBeVisible();
  await context.setOffline(false);
});
