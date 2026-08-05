import { expect, test } from "@playwright/test";

import { expectNoAccessibilityViolations } from "./accessibility";

const snapshot = {
  formatVersion: "1.0.0",
  exportedAt: "2026-08-05T12:00:00.000Z",
  timeZone: "America/Sao_Paulo",
  data: {
    trails: [
      {
        id: "00000000-0000-4000-8000-000000000001",
        title: "Trilha restaurada",
        description: null,
        goal: null,
        createdAt: "2026-08-05T11:00:00.000Z",
        updatedAt: "2026-08-05T11:00:00.000Z",
      },
    ],
    resources: [],
    practiceAnswers: [],
    projectRequirements: [],
    studyCheckIns: [],
  },
};

test.describe("operaÃ§Ã£o local", () => {
  test("valida e restaura um backup somente apÃ³s confirmaÃ§Ã£o", async ({
    page,
  }) => {
    await page.goto("/configuracoes");
    await expect(page.getByText("Armazenamento local")).toBeVisible();
    await page.getByLabel("Arquivo JSON").setInputFiles({
      name: "backup.json",
      mimeType: "application/json",
      buffer: Buffer.from(JSON.stringify(snapshot)),
    });
    await page.getByRole("button", { name: "Validar arquivo" }).click();
    await expect(page.getByText("Resumo do backup")).toBeVisible();
    await expect(
      page.getByText("Todos os dados atuais serÃ£o substituÃ­dos."),
    ).toBeVisible();
    await page
      .getByRole("button", { name: "Importar e substituir" })
      .first()
      .click();
    const dialog = page.getByRole("dialog");
    await expect(dialog).toBeVisible();
    await dialog.getByRole("button", { name: "Importar e substituir" }).click();
    await expect(page.getByText("Backup restaurado.")).toBeVisible();
    await page.goto("/trilhas");
    await expect(page.getByText("Trilha restaurada")).toBeVisible();
    await expectNoAccessibilityViolations(page);
  });
});
