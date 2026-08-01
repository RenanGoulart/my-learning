import { expect, test } from "@playwright/test";

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
    expect(pageErrors).toEqual([]);
    if (viewport.name === "mobile") {
      await page.getByRole("button", { name: /Abrir navega/ }).click();
      await expect(page.getByRole("dialog")).toBeVisible();
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
