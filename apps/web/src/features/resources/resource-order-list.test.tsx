import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { ResourceOrderList } from "./resource-order-list";
const { reorderResources } = vi.hoisted(() => ({
  reorderResources: vi.fn().mockResolvedValue([]),
}));
vi.mock("./api", () => ({ reorderResources }));
describe("ResourceOrderList", () => {
  it("moves a resource down through its accessible action", async () => {
    const user = userEvent.setup();
    render(
      <QueryClientProvider client={new QueryClient()}>
        <ResourceOrderList
          trailId="00000000-0000-4000-8000-000000000001"
          resources={[
            {
              id: "00000000-0000-4000-8000-000000000011",
              title: "Primeiro",
              position: 1,
            },
            {
              id: "00000000-0000-4000-8000-000000000012",
              title: "Segundo",
              position: 2,
            },
          ]}
        />
      </QueryClientProvider>,
    );
    await user.click(
      screen.getByRole("button", { name: "Mover Primeiro para baixo" }),
    );
    expect(reorderResources).toHaveBeenCalledWith(
      "00000000-0000-4000-8000-000000000001",
      [
        "00000000-0000-4000-8000-000000000012",
        "00000000-0000-4000-8000-000000000011",
      ],
    );
  });
});
