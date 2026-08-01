import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { AppShell } from "./app-shell.js";

describe("AppShell", () => {
  it("renders the operational destinations", () => {
    render(
      <AppShell>
        <main>Conteudo</main>
      </AppShell>,
    );

    expect(screen.getByRole("link", { name: "Dashboard" })).toHaveAttribute(
      "href",
      "/",
    );
    expect(screen.getByRole("link", { name: "Trilhas" })).toHaveAttribute(
      "href",
      "/trilhas",
    );
    expect(screen.getByRole("link", { name: "Historico" })).toHaveAttribute(
      "href",
      "/historico",
    );
    expect(screen.getByRole("link", { name: "Configuracoes" })).toHaveAttribute(
      "href",
      "/configuracoes",
    );
  });

  it("exposes an accessible mobile navigation trigger", () => {
    render(
      <AppShell>
        <main>Conteudo</main>
      </AppShell>,
    );

    expect(
      screen.getByRole("button", { name: "Abrir navegacao" }),
    ).toBeVisible();
  });
});
