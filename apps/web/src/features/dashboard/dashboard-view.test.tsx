import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { render, screen, within } from "@testing-library/react";
import { expect, it } from "vitest";
import { DashboardView } from "./dashboard-view";

it("renders the learning overview, active trail progress, and continue link", () => {
  render(
    <QueryClientProvider client={new QueryClient()}>
      <DashboardView
        dashboard={{
          currentLocalDate: "2026-08-01",
          checkIn: null,
          currentStreak: 2,
          bestStreak: 4,
          lastCheckInDate: null,
          activeTrails: [
            {
              id: "550e8400-e29b-41d4-a716-446655440002",
              title: "Web",
              description: "Fundamentos da web",
              goal: "Construir para a web",
              progress: {
                completedResources: 1,
                totalResources: 2,
                percentage: 50,
              },
              isComplete: false,
              isActive: true,
              createdAt: "2026-08-01T12:00:00.000Z",
              updatedAt: "2026-08-01T12:00:00.000Z",
            },
          ],
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
  expect(
    screen.getByRole("heading", {
      level: 1,
      name: "Seu aprendizado, em movimento.",
    }),
  ).toBeVisible();
  expect(screen.getByText("2 dias")).toBeVisible();
  expect(screen.getByText("4 dias")).toBeVisible();
  expect(screen.getByRole("link", { name: /HTTP/ })).toHaveAttribute(
    "href",
    "/recursos/550e8400-e29b-41d4-a716-446655440001",
  );
  expect(
    screen.getByRole("progressbar", { name: "Progresso de Web" }),
  ).toHaveAttribute("aria-valuenow", "50");
  expect(
    within(
      screen.getByRole("link", { name: /Web Em andamento 50%/ }),
    ).getByText("Em andamento"),
  ).toHaveClass("bg-status-in-progress");
  expect(
    screen.getByRole("heading", { name: "Check-in de hoje" }),
  ).toBeVisible();
});

it("explains how to add content when there is nothing to continue or track", () => {
  render(
    <QueryClientProvider client={new QueryClient()}>
      <DashboardView
        dashboard={{
          currentLocalDate: "2026-08-01",
          checkIn: null,
          currentStreak: 0,
          bestStreak: 0,
          lastCheckInDate: null,
          activeTrails: [],
          continueStudying: [],
        }}
      />
    </QueryClientProvider>,
  );

  expect(
    screen.getByRole("heading", { name: "Nada para continuar agora" }),
  ).toBeVisible();
  expect(
    screen.getByRole("heading", { name: "Nenhuma trilha ativa" }),
  ).toBeVisible();
});
