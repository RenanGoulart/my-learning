import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { expect, it } from "vitest";
import { CheckInForm } from "./check-in-form";

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
