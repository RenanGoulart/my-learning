import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it } from "vitest";

import { AppShell } from "./app-shell.js";

describe("AppShell", () => {
  it("renders the operational destinations", () => {
    render(
      <AppShell>
        <main>Conteúdo</main>
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
    expect(screen.getByRole("link", { name: "Histórico" })).toHaveAttribute(
      "href",
      "/historico",
    );
    expect(screen.getByRole("link", { name: "Configurações" })).toHaveAttribute(
      "href",
      "/configuracoes",
    );
  });

  it("opens and closes the mobile sheet accessibly", async () => {
    const user = userEvent.setup();
    render(
      <AppShell>
        <main>Conteúdo</main>
      </AppShell>,
    );

    const trigger = screen.getByRole("button", { name: "Abrir navegação" });
    await user.click(trigger);

    expect(screen.getByRole("dialog")).toHaveAttribute("aria-modal", "true");
    await user.keyboard("{Escape}");
    expect(trigger).toHaveFocus();
  });
});
