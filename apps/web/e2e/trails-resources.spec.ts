import { expect, test } from "@playwright/test";

import { expectNoAccessibilityViolations } from "./accessibility";

test.describe("trilhas e recursos", () => {
  test("keeps long headers and resources inside the mobile viewport", async ({
    page,
  }) => {
    const longTrailTitle = `Trilha-${"MuitoLonga".repeat(16)}`;
    const longResourceTitle = `Recurso-${"SemEspacos".repeat(16)}`;
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto("/trilhas/nova");
    await page.getByLabel(/^T.tulo$/).fill(longTrailTitle);
    await page.getByRole("button", { name: "Salvar" }).click();

    await expect(
      page.getByRole("heading", { level: 1, name: longTrailTitle }),
    ).toBeVisible();
    const trailPath = page.url();
    expect(
      await page.locator("body").evaluate((body) => body.scrollWidth),
    ).toBeLessThanOrEqual(390);

    await page
      .locator("header")
      .getByRole("button", { name: "Novo recurso" })
      .click();
    await page.getByLabel(/^T.tulo$/).fill(longResourceTitle);
    await page.getByLabel("Categoria").selectOption("MATERIAL");
    await page.getByLabel("Formato").selectOption("COURSE");
    await page.getByRole("button", { name: "Salvar" }).click();
    await page.goto(trailPath);

    await expect(
      page.getByRole("link", { name: longResourceTitle }),
    ).toBeVisible();
    expect(
      await page.locator("body").evaluate((body) => body.scrollWidth),
    ).toBeLessThanOrEqual(390);
    await expectNoAccessibilityViolations(page);

    await page.goto("/trilhas");
    await expect(
      page.getByRole("link", { name: longTrailTitle }),
    ).toBeVisible();
    expect(
      await page.locator("body").evaluate((body) => body.scrollWidth),
    ).toBeLessThanOrEqual(390);
  });

  test("cria, ordena, progride, converte e exclui recursos", async ({
    page,
  }) => {
    await page.goto("/trilhas/nova");
    await page.getByLabel("Título").fill("Trilha E2E");
    await page.getByRole("button", { name: "Salvar" }).click();
    await expect(
      page.getByRole("heading", { name: "Trilha E2E" }),
    ).toBeVisible();
    const trailPath = page.url();
    await page
      .locator("header")
      .getByRole("button", { name: "Novo recurso" })
      .click();
    await page.getByLabel("Título").fill("Material A");
    await page.getByLabel("Categoria").selectOption("MATERIAL");
    await page.getByLabel("Formato").selectOption("COURSE");
    await page.getByLabel("URL").fill("https://example.com/a");
    await page.getByRole("button", { name: "Salvar" }).click();
    await expect(
      page.getByRole("heading", { name: "Material A" }),
    ).toBeVisible();
    await page.goto(trailPath);
    await page
      .locator("header")
      .getByRole("button", { name: "Novo recurso" })
      .click();
    await page.getByLabel("Título").fill("Material B");
    await page.getByLabel("Categoria").selectOption("MATERIAL");
    await page.getByLabel("Formato").selectOption("COURSE");
    await page.getByLabel("URL").fill("https://example.com/b");
    await page.getByRole("button", { name: "Salvar" }).click();
    await expect(
      page.getByRole("heading", { name: "Material B" }),
    ).toBeVisible();
    await page.goto(trailPath);
    const moveDown = page.getByRole("button", {
      name: "Mover Material A para baixo",
    });
    await moveDown.focus();
    await expect(moveDown).toBeFocused();
    const reordered = page.waitForResponse(
      (response) =>
        response.request().method() === "PUT" &&
        response.url().endsWith("/resources/order"),
    );
    await moveDown.press("Enter");
    await expect((await reordered).status()).toBe(200);
    await expect
      .poll(() => page.locator("ol > li").getByRole("link").allTextContents())
      .toEqual(["Material B", "Material A"]);
    await page.getByRole("link", { name: "Material A", exact: true }).click();
    const started = page.waitForResponse(
      (response) =>
        response.request().method() === "PATCH" &&
        response.url().endsWith("/status"),
    );
    await page.getByRole("radio", { name: "Em andamento" }).click();
    await expect((await started).status()).toBe(200);
    const completed = page.waitForResponse(
      (response) =>
        response.request().method() === "PATCH" &&
        response.url().endsWith("/status"),
    );
    await page.getByRole("radio", { name: "Concluído" }).click();
    await expect((await completed).status()).toBe(200);
    await page.goto(trailPath);
    await expect(page.getByText("50%")).toBeVisible();
    await page.getByRole("link", { name: "Material A", exact: true }).click();
    await page.getByLabel("Nova categoria").selectOption("PRACTICE");
    await page.getByLabel("Novo formato").selectOption("QUESTION");
    await page.getByLabel("Enunciado da conversão").fill("Explique A");
    const previewed = page.waitForResponse(
      (response) =>
        response.request().method() === "POST" &&
        response.url().endsWith("/conversion-preview"),
    );
    await page.getByRole("button", { name: "Verificar conversão" }).click();
    await expect((await previewed).status()).toBe(200);
    await page.getByLabel("Confirmo o descarte dos dados listados").check();
    const converted = page.waitForResponse(
      (response) =>
        response.request().method() === "POST" &&
        response.url().endsWith("/convert"),
    );
    await page.getByRole("button", { name: "Converter" }).click();
    await expect((await converted).status()).toBe(200);
    await expect(
      page.getByRole("paragraph").filter({ hasText: "Explique A" }),
    ).toBeVisible();
    await expect(
      page.getByRole("link", { name: "Abrir material" }),
    ).toHaveCount(0);
    await page.getByRole("button", { name: "Excluir recurso" }).click();
    const deleted = page.waitForResponse(
      (response) =>
        response.request().method() === "DELETE" &&
        response.url().includes("/api/v1/resources/"),
    );
    await page.getByRole("button", { name: "Excluir" }).last().click();
    await expect((await deleted).status()).toBe(204);
    await expect(page).toHaveURL(trailPath);
    await expect(
      page.getByRole("link", { name: "Material A", exact: true }),
    ).toHaveCount(0);
    await expect(
      page.getByRole("link", { name: "Material B", exact: true }),
    ).toBeVisible();
    const noOverflow = await page
      .locator("body")
      .evaluate((body) => body.scrollWidth <= window.innerWidth);
    expect(noOverflow).toBe(true);
    await expectNoAccessibilityViolations(page);
  });
});
