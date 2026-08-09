import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { expect, it, vi } from "vitest";
import { CheckInForm } from "./check-in-form";

const { saveCheckIn } = vi.hoisted(() => ({ saveCheckIn: vi.fn() }));

vi.mock("./api", () => ({ deleteCheckIn: vi.fn(), saveCheckIn }));

it("shows the delete confirmation for an existing check-in", async () => {
  const user = userEvent.setup();
  render(
    <QueryClientProvider client={new QueryClient()}>
      <CheckInForm
        currentLocalDate="2026-08-01"
        checkIn={{
          id: "550e8400-e29b-41d4-a716-446655440000",
          localDate: "2026-08-01",
          note: null,
          durationMinutes: null,
          createdAt: "2026-08-01T12:00:00.000Z",
          updatedAt: "2026-08-01T12:00:00.000Z",
        }}
      />
    </QueryClientProvider>,
  );
  await user.click(screen.getByRole("button", { name: "Excluir check-in" }));
  expect(screen.getByRole("dialog")).toHaveTextContent(
    "streak será recalculado",
  );
});

it("shows saving progress while a new check-in is pending", async () => {
  saveCheckIn.mockImplementationOnce(() => new Promise(() => undefined));
  const user = userEvent.setup();

  render(
    <QueryClientProvider client={new QueryClient()}>
      <CheckInForm currentLocalDate="2026-08-01" checkIn={null} />
    </QueryClientProvider>,
  );

  await user.click(screen.getByRole("button", { name: "Registrar check-in" }));

  await waitFor(() =>
    expect(screen.getByRole("button", { name: "Salvando..." })).toBeDisabled(),
  );
});
