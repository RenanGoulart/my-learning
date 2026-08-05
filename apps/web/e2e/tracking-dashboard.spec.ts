import { expect, test } from "@playwright/test";

import { expectNoAccessibilityViolations } from "./accessibility";

test.describe("acompanhamento e dashboard", () => {
  test("registra um check-in no Dashboard e mostra o histórico", async ({
    page,
  }) => {
    await page.goto("/");
    await expect(
      page.getByRole("heading", { name: "Check-in de hoje" }),
    ).toBeVisible();
    await page.getByLabel("Minutos").fill("45");
    await page.getByLabel("Observação").fill("Estudo E2E");
    const saved = page.waitForResponse(
      (response) =>
        response.request().method() === "PUT" &&
        response.url().includes("/api/v1/check-ins/"),
    );
    await page.getByRole("button", { name: "Registrar check-in" }).click();
    await expect((await saved).status()).toBe(200);
    await page.goto("/historico");
    await expect(page.getByText("Estudo E2E")).toBeVisible();
    await expect(page.getByText("45min")).toBeVisible();
    await expectNoAccessibilityViolations(page);
  });
});
