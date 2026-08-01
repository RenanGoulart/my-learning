import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { DeleteResourceButton } from "./delete-resource-button";
const { deleteResource } = vi.hoisted(() => ({
  deleteResource: vi.fn().mockResolvedValue(undefined),
}));
vi.mock("./api", () => ({ deleteResource }));
vi.mock("next/navigation", () => ({ useRouter: () => ({ push: vi.fn() }) }));
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
});
