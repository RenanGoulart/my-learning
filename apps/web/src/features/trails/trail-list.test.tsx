import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { TrailList } from "./trail-list";

const { getTrails } = vi.hoisted(() => ({ getTrails: vi.fn() }));

vi.mock("./api", () => ({ getTrails }));

function renderTrailList() {
  return render(
    <QueryClientProvider client={new QueryClient()}>
      <TrailList />
    </QueryClientProvider>,
  );
}

describe("TrailList", () => {
  it("shows each trail progress and semantic status", async () => {
    getTrails.mockResolvedValueOnce([
      {
        id: "00000000-0000-4000-8000-000000000001",
        title: "React",
        description: "Aprenda componentes.",
        goal: "Dominar React",
        progress: {
          completedResources: 2,
          totalResources: 3,
          percentage: 68,
        },
        isComplete: false,
        isActive: true,
        createdAt: "2026-08-08T00:00:00.000Z",
        updatedAt: "2026-08-08T00:00:00.000Z",
      },
    ]);

    renderTrailList();

    expect(
      await screen.findByRole("progressbar", { name: "Progresso de React" }),
    ).toHaveAttribute("aria-valuenow", "68");
    expect(screen.getByText("Em andamento")).toBeVisible();
  });

  it("offers an action to create the first trail", async () => {
    getTrails.mockResolvedValueOnce([]);

    renderTrailList();

    expect(
      await screen.findByRole("link", { name: "Criar trilha" }),
    ).toHaveAttribute("href", "/trilhas/nova");
  });
});
