import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import type { ResourceDetail } from "@my-learning/contracts";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { ResourceForm } from "./resource-form";
const { createResource, updateResource, push } = vi.hoisted(() => ({
  createResource: vi.fn(),
  updateResource: vi.fn(),
  push: vi.fn(),
}));
vi.mock("./api", () => ({ createResource, updateResource }));
vi.mock("next/navigation", () => ({ useRouter: () => ({ push }) }));
describe("ResourceForm", () => {
  it("requires an explicit category and format selection", () => {
    render(
      <QueryClientProvider client={new QueryClient()}>
        <ResourceForm
          mode="create"
          trailId="00000000-0000-4000-8000-000000000001"
        />
      </QueryClientProvider>,
    );

    expect(screen.getByLabelText("Categoria")).toHaveValue("");
    expect(screen.getByLabelText("Formato")).toHaveValue("");
  });

  it("navigates to the created resource after a successful save", async () => {
    const saved = {
      id: "00000000-0000-4000-8000-000000000002",
    };
    createResource.mockResolvedValueOnce(saved);
    const client = new QueryClient();
    const invalidateQueries = vi.spyOn(client, "invalidateQueries");
    const user = userEvent.setup();
    render(
      <QueryClientProvider client={client}>
        <ResourceForm
          mode="create"
          trailId="00000000-0000-4000-8000-000000000001"
        />
      </QueryClientProvider>,
    );
    await user.type(screen.getByLabelText("Título"), "Material");
    await user.selectOptions(screen.getByLabelText("Categoria"), "MATERIAL");
    await user.selectOptions(screen.getByLabelText("Formato"), "COURSE");
    await user.type(screen.getByLabelText("URL"), "https://example.com");
    await user.click(screen.getByRole("button", { name: "Salvar" }));
    await waitFor(() => {
      expect(push).toHaveBeenCalledWith(
        "/recursos/00000000-0000-4000-8000-000000000002",
      );
    });
    expect(client.getQueryData(["resources", saved.id])).toEqual(saved);
    expect(invalidateQueries).toHaveBeenCalledWith({
      queryKey: ["trails", "00000000-0000-4000-8000-000000000001"],
    });
  });

  it("prevents a duplicate submit while the save is pending", async () => {
    createResource.mockImplementationOnce(() => new Promise(() => undefined));
    const user = userEvent.setup();
    render(
      <QueryClientProvider client={new QueryClient()}>
        <ResourceForm
          mode="create"
          trailId="00000000-0000-4000-8000-000000000001"
        />
      </QueryClientProvider>,
    );
    await user.type(screen.getByLabelText("Título"), "Material");
    await user.selectOptions(screen.getByLabelText("Categoria"), "MATERIAL");
    await user.selectOptions(screen.getByLabelText("Formato"), "COURSE");
    await user.type(screen.getByLabelText("URL"), "https://example.com");
    await user.click(screen.getByRole("button", { name: "Salvar" }));

    await waitFor(() =>
      expect(screen.getByRole("button", { name: "Salvar" })).toBeDisabled(),
    );
  });

  it("shows only the fields required by the selected project format", async () => {
    const user = userEvent.setup();
    render(
      <QueryClientProvider client={new QueryClient()}>
        <ResourceForm
          mode="create"
          trailId="00000000-0000-4000-8000-000000000001"
        />
      </QueryClientProvider>,
    );
    await user.selectOptions(screen.getByLabelText("Categoria"), "PRACTICE");
    await user.selectOptions(screen.getByLabelText("Formato"), "PROJECT");
    expect(screen.getByLabelText("Enunciado")).toBeVisible();
    expect(screen.getByLabelText("Requisito 1")).toBeVisible();
    expect(screen.queryByLabelText("URL")).not.toBeInTheDocument();
  });

  it("updates the resource cache after editing", async () => {
    const resource: ResourceDetail = {
      id: "00000000-0000-4000-8000-000000000002",
      trailId: "00000000-0000-4000-8000-000000000001",
      title: "Material",
      description: null,
      category: "MATERIAL",
      format: "COURSE",
      status: "NOT_STARTED",
      position: 1,
      url: "https://example.com",
      prompt: null,
      practiceAnswer: null,
      flashcardFront: null,
      flashcardBack: null,
      projectRequirements: [],
      createdAt: "2026-08-01T12:00:00.000Z",
      updatedAt: "2026-08-01T12:00:00.000Z",
    };
    const saved = {
      ...resource,
      title: "Material atualizado",
      updatedAt: "2026-08-01T12:01:00.000Z",
    };
    updateResource.mockResolvedValueOnce(saved);
    const client = new QueryClient();
    const user = userEvent.setup();
    render(
      <QueryClientProvider client={client}>
        <ResourceForm
          mode="edit"
          resource={resource}
          trailId={resource.trailId}
        />
      </QueryClientProvider>,
    );

    await user.clear(screen.getByLabelText("Título"));
    await user.type(screen.getByLabelText("Título"), saved.title);
    await user.click(screen.getByRole("button", { name: "Salvar" }));

    await waitFor(() => expect(updateResource).toHaveBeenCalledOnce());
    expect(push).toHaveBeenCalledWith(`/recursos/${resource.id}`);
    await waitFor(() =>
      expect(client.getQueryData(["resources", resource.id])).toEqual(saved),
    );
  });

  it("shows project requirements as read-only while editing", () => {
    const resource: ResourceDetail = {
      id: "00000000-0000-4000-8000-000000000002",
      trailId: "00000000-0000-4000-8000-000000000001",
      title: "Projeto",
      description: null,
      category: "PRACTICE",
      format: "PROJECT",
      status: "NOT_STARTED",
      position: 1,
      url: null,
      prompt: "Construa",
      practiceAnswer: null,
      flashcardFront: null,
      flashcardBack: null,
      projectRequirements: [
        {
          id: "00000000-0000-4000-8000-000000000003",
          resourceId: "00000000-0000-4000-8000-000000000002",
          text: "Inclua testes",
          position: 1,
          isCompleted: false,
          createdAt: "2026-08-01T12:00:00.000Z",
          updatedAt: "2026-08-01T12:00:00.000Z",
        },
      ],
      createdAt: "2026-08-01T12:00:00.000Z",
      updatedAt: "2026-08-01T12:00:00.000Z",
    };

    render(
      <QueryClientProvider client={new QueryClient()}>
        <ResourceForm
          mode="edit"
          resource={resource}
          trailId={resource.trailId}
        />
      </QueryClientProvider>,
    );

    expect(screen.getByText("Inclua testes")).toBeVisible();
    expect(screen.queryByLabelText("Requisito 1")).not.toBeInTheDocument();
  });
});
