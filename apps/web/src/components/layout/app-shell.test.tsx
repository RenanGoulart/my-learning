import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";

import { AppShell } from "./app-shell.js";

vi.mock("next/navigation", () => ({
  usePathname: () => "/trilhas",
}));

vi.mock("@/features/dashboard/queries", () => ({
  useDashboard: () => ({
    data: {
      continueStudying: [
        {
          resourceId: "550e8400-e29b-41d4-a716-446655440001",
          resourceTitle: "HTTP",
        },
      ],
    },
  }),
}));

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
    expect(screen.getByRole("link", { name: "Trilhas" })).toHaveAttribute(
      "aria-current",
      "page",
    );
    expect(screen.getByRole("link", { name: /Continuar HTTP/ })).toHaveAttribute(
      "href",
      "/recursos/550e8400-e29b-41d4-a716-446655440001",
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

  it("closes the mobile sheet when navigating", async () => {
    const user = userEvent.setup();
    render(
      <AppShell>
        <main>Conteúdo</main>
      </AppShell>,
    );

    await user.click(screen.getByRole("button", { name: "Abrir navegação" }));
    const dialog = screen.getByRole("dialog");
    await user.click(within(dialog).getByRole("link", { name: "Trilhas" }));

    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
  });
});
