import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";

vi.mock("@/features/import-export/api", () => ({
  confirmImport: vi.fn(),
  previewImport: vi.fn().mockResolvedValue({
    formatVersion: "1.0.0",
    counts: {
      trails: 2,
      resources: 1,
      practiceAnswers: 0,
      projectRequirements: 0,
      studyCheckIns: 0,
    },
  }),
}));
vi.mock("./api", () => ({
  getSystemInfo: vi.fn().mockResolvedValue({
    databasePath: "C:/data/my-learning.db",
    snapshotFormatVersion: "1.0.0",
    timeZone: "America/Sao_Paulo",
  }),
}));

import { SettingsView } from "./settings-view.js";

describe("SettingsView", () => {
  it("organizes settings into storage, export, and restore regions", async () => {
    render(
      <QueryClientProvider client={new QueryClient()}>
        <SettingsView />
      </QueryClientProvider>,
    );

    expect(
      screen.getByRole("heading", { level: 1, name: "Configurações" }),
    ).toBeVisible();
    expect(
      screen.getByRole("region", { name: "Armazenamento local" }),
    ).toBeVisible();
    expect(
      screen.getByRole("region", { name: "Exportar backup" }),
    ).toBeVisible();
    expect(
      screen.getByRole("region", { name: "Restaurar backup" }),
    ).toBeVisible();
  });

  it("shows the preview and replacement warning before confirmation", async () => {
    const user = userEvent.setup();
    render(
      <QueryClientProvider client={new QueryClient()}>
        <SettingsView />
      </QueryClientProvider>,
    );

    await screen.findByText("C:/data/my-learning.db");
    await user.upload(
      screen.getByLabelText("Arquivo JSON"),
      new File(["{}"], "backup.json", { type: "application/json" }),
    );
    await user.click(screen.getByRole("button", { name: "Validar arquivo" }));

    expect(await screen.findByText("2 trilhas")).toBeVisible();
    expect(
      screen.getByText(/todos os dados atuais serão substituídos/i),
    ).toBeVisible();
    expect(
      screen.getByRole("button", { name: "Importar e substituir" }),
    ).toBeVisible();
  });
});
