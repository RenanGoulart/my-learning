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
      page.getByRole("heading", {
        level: 1,
        name: "Seu aprendizado, em movimento.",
      }),
    ).toBeVisible();
    if (viewport.name === "desktop") {
      await expect(
        page.getByRole("navigation", { name: "Navegação principal" }),
      ).toBeVisible();
    } else {
      await page.getByRole("button", { name: /Abrir navega/ }).click();
      await expect(
        page
          .getByRole("dialog")
          .getByRole("navigation", { name: "Navegação principal" }),
      ).toBeVisible();
    }
    await expectNoAccessibilityViolations(page);
    expect(pageErrors).toEqual([]);
    if (viewport.name === "mobile") {
      const dialog = page.getByRole("dialog");
      await expect(dialog).toBeVisible();
      await expect(dialog).toHaveCSS("opacity", "1");
      await expect(dialog.locator(":focus")).toHaveCount(1);
      await page.keyboard.press("Tab");
      await expect(dialog.locator(":focus")).toHaveCount(1);
      await expectNoAccessibilityViolations(page);
    } else {
      await page.goto("/trilhas");
      await expect(page.getByRole("link", { name: "Trilhas" })).toHaveAttribute(
        "aria-current",
        "page",
      );
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

test("keeps the vibrant palette accessible in dark mode", async ({ page }) => {
  await page.goto("/trilhas/nova");
  await page.getByLabel("Título").fill("Tema escuro");
  await page.getByRole("button", { name: "Salvar" }).click();
  await page
    .locator("header")
    .getByRole("button", { name: "Novo recurso" })
    .click();
  await page.getByLabel("Título").fill("Contraste âmbar");
  await page.getByLabel("Categoria").selectOption("MATERIAL");
  await page.getByLabel("Formato").selectOption("COURSE");
  await page.getByRole("button", { name: "Salvar" }).click();
  await page.getByRole("radio", { name: "Em andamento" }).click();
  await page.getByRole("button", { name: "Usar tema escuro" }).first().click();
  await expect(page.locator("html")).toHaveClass(/dark/);
  await expect(page.getByText("Em andamento").first()).toBeVisible();
  await expectNoAccessibilityViolations(page);
});
