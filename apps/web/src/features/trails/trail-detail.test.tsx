import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";

import { DeleteTrailButton } from "./delete-trail-button";

const { getTrail, deleteTrail } = vi.hoisted(() => ({
  getTrail: vi.fn(),
  deleteTrail: vi.fn(),
}));

vi.mock("./api", () => ({ getTrail, deleteTrail }));
vi.mock("next/navigation", () => ({ useRouter: () => ({ push: vi.fn() }) }));

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
