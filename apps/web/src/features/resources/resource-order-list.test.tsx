import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { ResourceOrderList } from "./resource-order-list";
const { reorderResources } = vi.hoisted(() => ({
  reorderResources: vi.fn().mockResolvedValue([]),
}));
vi.mock("./api", () => ({ reorderResources }));
describe("ResourceOrderList", () => {
  it("links each resource title to its detail page", () => {
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
          ]}
        />
      </QueryClientProvider>,
    );

    expect(screen.getByRole("link", { name: "Primeiro" })).toHaveAttribute(
      "href",
      "/recursos/00000000-0000-4000-8000-000000000011",
    );
  });

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
    const moveDown = screen.getByRole("button", {
      name: "Mover Primeiro para baixo",
    });
    await user.click(moveDown);
    expect(reorderResources).toHaveBeenCalledWith(
      "00000000-0000-4000-8000-000000000001",
      [
        "00000000-0000-4000-8000-000000000012",
        "00000000-0000-4000-8000-000000000011",
      ],
    );
  });

  it("prevents another reorder while an update is pending", async () => {
    reorderResources.mockImplementationOnce(() => new Promise(() => undefined));
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

    await waitFor(() =>
      expect(
        screen.getByRole("button", { name: "Mover Primeiro para baixo" }),
      ).toBeDisabled(),
    );
    expect(
      screen.getByRole("button", { name: "Arrastar Primeiro" }),
    ).toBeDisabled();
  });

  it("reports a reorder failure after rolling the order back", async () => {
    reorderResources.mockRejectedValueOnce(new Error("Falha"));
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

    expect(await screen.findByRole("alert")).toHaveTextContent(
      "Não foi possível alterar a ordem dos recursos.",
    );
  });
});
