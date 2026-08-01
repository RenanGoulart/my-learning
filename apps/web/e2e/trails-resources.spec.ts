import { expect, test } from "@playwright/test";

test.describe("trilhas e recursos", () => {
  test("exibe a lista de trilhas sem overflow horizontal", async ({ page }) => {
    await page.goto("/trilhas");
    const hasNoOverflow = await page
      .locator("body")
      .evaluate((body) => body.scrollWidth <= window.innerWidth);
    expect(hasNoOverflow).toBe(true);
  });
});
