import { expect, test } from "@playwright/test";

import { expectNoAccessibilityViolations } from "./accessibility";

const viewports = [
  { name: "desktop", width: 1366, height: 768 },
  { name: "mobile", width: 390, height: 844 },
] as const;

for (const viewport of viewports) {
  test(`opens directly on the operational Dashboard (${viewport.name})`, async ({
    page,
  }) => {
    const pageErrors: Error[] = [];
    page.on("pageerror", (error) => pageErrors.push(error));

    await page.setViewportSize(viewport);
    await page.goto("/");

    await expect(
      page.getByRole("heading", { name: "Dashboard" }),
    ).toBeVisible();
    await expectNoAccessibilityViolations(page);
    expect(pageErrors).toEqual([]);
    if (viewport.name === "mobile") {
      await page.getByRole("button", { name: /Abrir navega/ }).click();
      const dialog = page.getByRole("dialog");
      await expect(dialog).toBeVisible();
      await expect(dialog).toHaveCSS("opacity", "1");
      await expect(dialog.locator(":focus")).toHaveCount(1);
      await page.keyboard.press("Tab");
      await expect(dialog.locator(":focus")).toHaveCount(1);
      await expectNoAccessibilityViolations(page);
    }
    await expect(page.getByRole("link", { name: "Trilhas" })).toBeVisible();
    await expect(page.locator("main")).not.toHaveCSS("overflow-x", "scroll");
    expect(
      await page
        .locator("html")
        .evaluate(
          (documentElement) =>
            documentElement.scrollWidth <= documentElement.clientWidth,
        ),
    ).toBeTruthy();
  });
}
