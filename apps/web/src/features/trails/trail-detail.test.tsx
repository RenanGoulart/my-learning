import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";

import { DeleteTrailButton } from "./delete-trail-button";
import { TrailDetail } from "./trail-detail";

const { getTrail, deleteTrail } = vi.hoisted(() => ({
  getTrail: vi.fn(),
  deleteTrail: vi.fn(),
}));

vi.mock("./api", () => ({ getTrail, deleteTrail }));
vi.mock("next/navigation", () => ({ useRouter: () => ({ push: vi.fn() }) }));

function renderTrailDetail() {
  return render(
    <QueryClientProvider client={new QueryClient()}>
      <TrailDetail trailId="00000000-0000-4000-8000-000000000001" />
    </QueryClientProvider>,
  );
}

describe("DeleteTrailButton", () => {
  it("refetches and shows the current resource count before deleting", async () => {
    getTrail.mockResolvedValueOnce({
      id: "00000000-0000-4000-8000-000000000001",
      title: "Web",
      resources: [{ id: "00000000-0000-4000-8000-000000000002" }],
    });
    const user = userEvent.setup();

    render(
      <QueryClientProvider client={new QueryClient()}>
        <DeleteTrailButton trailId="00000000-0000-4000-8000-000000000001" />
      </QueryClientProvider>,
    );

    await user.click(screen.getByRole("button", { name: "Excluir trilha" }));

    await waitFor(() => expect(getTrail).toHaveBeenCalledTimes(1));
    expect(screen.getByRole("dialog")).toHaveTextContent("Web");
    expect(screen.getByRole("dialog")).toHaveTextContent("1 recurso");
  });
});

describe("TrailDetail", () => {
  it("shows trail progress, objective, and resource status", async () => {
    getTrail.mockResolvedValueOnce({
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
      resources: [
        {
          id: "00000000-0000-4000-8000-000000000002",
          trailId: "00000000-0000-4000-8000-000000000001",
          title: "Componentes",
          description: null,
          category: "MATERIAL",
          format: "DOCUMENTATION",
          status: "IN_PROGRESS",
          position: 1,
          url: null,
          createdAt: "2026-08-08T00:00:00.000Z",
          updatedAt: "2026-08-08T00:00:00.000Z",
        },
      ],
    });

    renderTrailDetail();

    expect(
      await screen.findByRole("button", { name: "Novo recurso" }),
    ).toHaveAttribute(
      "href",
      "/trilhas/00000000-0000-4000-8000-000000000001/recursos/novo",
    );
    expect(
      screen.getByRole("progressbar", { name: "Progresso da trilha" }),
    ).toHaveAttribute("aria-valuenow", "68");
    expect(screen.getAllByText("Em andamento")).toHaveLength(2);
    expect(screen.getByText("Objetivo")).toBeVisible();
    expect(screen.getByText("Dominar React")).toBeVisible();
  });
});
