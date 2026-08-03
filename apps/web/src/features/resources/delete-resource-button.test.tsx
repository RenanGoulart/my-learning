import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { DeleteResourceButton } from "./delete-resource-button";
const { deleteResource, push } = vi.hoisted(() => ({
  deleteResource: vi.fn().mockResolvedValue(undefined),
  push: vi.fn(),
}));
vi.mock("./api", () => ({ deleteResource }));
vi.mock("next/navigation", () => ({ useRouter: () => ({ push }) }));
describe("DeleteResourceButton", () => {
  it("warns about dependent practice data before deleting", async () => {
    const user = userEvent.setup();
    render(
      <QueryClientProvider client={new QueryClient()}>
        <DeleteResourceButton
          resource={{
            id: "00000000-0000-4000-8000-000000000001",
            trailId: "00000000-0000-4000-8000-000000000002",
            title: "Questão",
            category: "PRACTICE",
          }}
        />
      </QueryClientProvider>,
    );
    await user.click(screen.getByRole("button", { name: "Excluir recurso" }));
    expect(screen.getByRole("dialog")).toHaveTextContent("Questão");
    expect(screen.getByRole("dialog")).toHaveTextContent(
      "dados de prática dependentes",
    );
  });

  it("keeps the dialog open and reports a deletion failure", async () => {
    deleteResource.mockRejectedValueOnce(new Error("Falha"));
    const user = userEvent.setup();
    render(
      <QueryClientProvider client={new QueryClient()}>
        <DeleteResourceButton
          resource={{
            id: "00000000-0000-4000-8000-000000000001",
            trailId: "00000000-0000-4000-8000-000000000002",
            title: "Material",
            category: "MATERIAL",
          }}
        />
      </QueryClientProvider>,
    );

    await user.click(screen.getByRole("button", { name: "Excluir recurso" }));
    await user.click(screen.getByRole("button", { name: "Excluir" }));

    expect(await screen.findByRole("alert")).toHaveTextContent(
      "Não foi possível excluir o recurso.",
    );
    expect(screen.getByRole("dialog")).toBeVisible();
    await waitFor(() =>
      expect(screen.getByRole("button", { name: "Excluir" })).toBeEnabled(),
    );
    expect(push).not.toHaveBeenCalled();
  });

  it("removes the resource cache and invalidates its trail after deletion", async () => {
    deleteResource.mockResolvedValueOnce(undefined);
    const client = new QueryClient();
    const invalidateQueries = vi.spyOn(client, "invalidateQueries");
    const resource = {
      id: "00000000-0000-4000-8000-000000000001",
      trailId: "00000000-0000-4000-8000-000000000002",
      title: "Material",
      category: "MATERIAL",
    };
    client.setQueryData(["resources", resource.id], resource);
    const user = userEvent.setup();
    render(
      <QueryClientProvider client={client}>
        <DeleteResourceButton resource={resource} />
      </QueryClientProvider>,
    );

    await user.click(screen.getByRole("button", { name: "Excluir recurso" }));
    await user.click(screen.getByRole("button", { name: "Excluir" }));

    await waitFor(() =>
      expect(push).toHaveBeenCalledWith(`/trilhas/${resource.trailId}`),
    );
    expect(client.getQueryData(["resources", resource.id])).toBeUndefined();
    expect(invalidateQueries).toHaveBeenCalledWith({
      queryKey: ["trails", resource.trailId],
    });
  });
});
