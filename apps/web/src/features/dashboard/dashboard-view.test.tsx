import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { render, screen } from "@testing-library/react";
import { expect, it } from "vitest";
import { DashboardView } from "./dashboard-view";

it("renders streaks and links continue items to resource detail", () => {
  render(
    <QueryClientProvider client={new QueryClient()}>
      <DashboardView
        dashboard={{
          currentLocalDate: "2026-08-01",
          checkIn: null,
          currentStreak: 2,
          bestStreak: 4,
          lastCheckInDate: null,
          activeTrails: [],
          continueStudying: [
            {
              trailId: "550e8400-e29b-41d4-a716-446655440000",
              trailTitle: "Web",
              resourceId: "550e8400-e29b-41d4-a716-446655440001",
              resourceTitle: "HTTP",
              category: "MATERIAL",
              format: "ARTICLE",
              status: "IN_PROGRESS",
              position: 1,
              updatedAt: "2026-08-01T12:00:00.000Z",
            },
          ],
        }}
      />
    </QueryClientProvider>,
  );
  expect(screen.getByText(/Streak atual: 2 dias/)).toBeVisible();
  expect(screen.getByRole("link", { name: "HTTP" })).toHaveAttribute(
    "href",
    "/recursos/550e8400-e29b-41d4-a716-446655440001",
  );
});
