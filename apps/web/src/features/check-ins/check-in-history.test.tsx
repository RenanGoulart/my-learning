import { render, screen } from "@testing-library/react";
import { expect, it } from "vitest";
import { CheckInHistory } from "./check-in-history";

it("formats history dates and durations", () => {
  render(
    <CheckInHistory
      checkIns={[
        {
          id: "550e8400-e29b-41d4-a716-446655440000",
          localDate: "2026-08-01",
          note: "Notas",
          durationMinutes: 90,
          createdAt: "2026-08-01T12:00:00.000Z",
          updatedAt: "2026-08-01T12:00:00.000Z",
        },
      ]}
    />,
  );
  expect(screen.getByText("01/08/2026")).toBeVisible();
  expect(screen.getByText("1h 30min")).toBeVisible();
});

it("offers a useful empty history state", () => {
  render(<CheckInHistory checkIns={[]} />);

  expect(screen.getByText("Nenhum check-in registrado")).toBeVisible();
  expect(
    screen.getByText("Seus registros diários aparecerão aqui."),
  ).toBeVisible();
});

it("keeps long unbroken notes within the history card", () => {
  const note = "nota".repeat(100);

  render(
    <CheckInHistory
      checkIns={[
        {
          id: "550e8400-e29b-41d4-a716-446655440001",
          localDate: "2026-08-02",
          note,
          durationMinutes: 30,
          createdAt: "2026-08-02T12:00:00.000Z",
          updatedAt: "2026-08-02T12:00:00.000Z",
        },
      ]}
    />,
  );

  const noteElement = screen.getByText(note);
  expect(noteElement.parentElement).toHaveClass("min-w-0");
  expect(noteElement).toHaveClass("break-words");
});
