import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { act, render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { ResourceConversion } from "./resource-conversion";
const { previewResourceConversion, convertResource } = vi.hoisted(() => ({
  previewResourceConversion: vi.fn(),
  convertResource: vi.fn(),
}));
vi.mock("./api", () => ({ previewResourceConversion, convertResource }));
describe("ResourceConversion", () => {
  it("requires confirmation when the preview discards fields", async () => {
    previewResourceConversion.mockResolvedValueOnce({
      resourceId: "00000000-0000-4000-8000-000000000001",
      resourceUpdatedAt: "2026-08-01T12:00:00.000Z",
      targetCategory: "PRACTICE",
      targetFormat: "QUESTION",
      discardedFields: ["url"],
    });
    const user = userEvent.setup();
    render(
      <QueryClientProvider client={new QueryClient()}>
        <ResourceConversion resourceId="00000000-0000-4000-8000-000000000001" />
      </QueryClientProvider>,
    );
    await user.selectOptions(
      screen.getByLabelText("Nova categoria"),
      "PRACTICE",
    );
    await user.selectOptions(screen.getByLabelText("Novo formato"), "QUESTION");
    await user.click(
      screen.getByRole("button", { name: "Verificar conversão" }),
    );
    expect(await screen.findByText("URL")).toBeVisible();
    expect(
      screen.getByRole("checkbox", {
        name: "Confirmo o descarte dos dados listados",
      }),
    ).toBeVisible();
  });

  it("invalidates the preview when the conversion target changes", async () => {
    previewResourceConversion.mockResolvedValueOnce({
      resourceId: "00000000-0000-4000-8000-000000000001",
      resourceUpdatedAt: "2026-08-01T12:00:00.000Z",
      targetCategory: "PRACTICE",
      targetFormat: "QUESTION",
      discardedFields: [],
    });
    const user = userEvent.setup();
    render(
      <QueryClientProvider client={new QueryClient()}>
        <ResourceConversion resourceId="00000000-0000-4000-8000-000000000001" />
      </QueryClientProvider>,
    );

    await user.selectOptions(
      screen.getByLabelText("Nova categoria"),
      "PRACTICE",
    );
    await user.selectOptions(screen.getByLabelText("Novo formato"), "QUESTION");
    await user.click(
      screen.getByRole("button", { name: "Verificar conversão" }),
    );
    expect(
      await screen.findByRole("button", { name: "Converter" }),
    ).toBeVisible();

    await user.selectOptions(screen.getByLabelText("Novo formato"), "PROBLEM");

    expect(
      screen.queryByRole("button", { name: "Converter" }),
    ).not.toBeInTheDocument();
  });

  it("collects project requirements for the conversion payload", async () => {
    previewResourceConversion.mockResolvedValueOnce({
      resourceId: "00000000-0000-4000-8000-000000000001",
      resourceUpdatedAt: "2026-08-01T12:00:00.000Z",
      targetCategory: "PRACTICE",
      targetFormat: "PROJECT",
      discardedFields: [],
    });
    convertResource.mockResolvedValueOnce({});
    const user = userEvent.setup();
    render(
      <QueryClientProvider client={new QueryClient()}>
        <ResourceConversion resourceId="00000000-0000-4000-8000-000000000001" />
      </QueryClientProvider>,
    );

    await user.selectOptions(
      screen.getByLabelText("Nova categoria"),
      "PRACTICE",
    );
    await user.selectOptions(screen.getByLabelText("Novo formato"), "PROJECT");
    await user.type(
      screen.getByLabelText("Enunciado da conversão"),
      "Construa",
    );
    await user.type(
      screen.getByLabelText("Requisito 1 da conversão"),
      "Inclua testes",
    );
    await user.click(
      screen.getByRole("button", { name: "Verificar conversão" }),
    );
    await user.click(await screen.findByRole("button", { name: "Converter" }));

    await waitFor(() =>
      expect(convertResource).toHaveBeenCalledWith(
        "00000000-0000-4000-8000-000000000001",
        expect.objectContaining({
          targetFormat: "PROJECT",
          prompt: "Construa",
          requirements: [{ text: "Inclua testes" }],
        }),
      ),
    );
  });

  it("collects both flashcard sides", async () => {
    const user = userEvent.setup();
    render(
      <QueryClientProvider client={new QueryClient()}>
        <ResourceConversion resourceId="00000000-0000-4000-8000-000000000001" />
      </QueryClientProvider>,
    );

    await user.selectOptions(
      screen.getByLabelText("Nova categoria"),
      "PRACTICE",
    );
    await user.selectOptions(
      screen.getByLabelText("Novo formato"),
      "FLASHCARD",
    );

    expect(screen.getByLabelText("Frente da conversão")).toBeVisible();
    expect(screen.getByLabelText("Verso da conversão")).toBeVisible();
  });

  it("updates the resource cache and invalidates its trail after conversion", async () => {
    const converted = {
      id: "00000000-0000-4000-8000-000000000001",
      trailId: "00000000-0000-4000-8000-000000000002",
      title: "Questão",
      description: null,
      category: "PRACTICE",
      format: "QUESTION",
      status: "NOT_STARTED",
      position: 1,
      url: null,
      prompt: "Explique",
      practiceAnswer: null,
      flashcardFront: null,
      flashcardBack: null,
      projectRequirements: [],
      createdAt: "2026-08-01T12:00:00.000Z",
      updatedAt: "2026-08-01T12:01:00.000Z",
    } as const;
    previewResourceConversion.mockResolvedValueOnce({
      resourceId: converted.id,
      resourceUpdatedAt: "2026-08-01T12:00:00.000Z",
      targetCategory: "PRACTICE",
      targetFormat: "QUESTION",
      discardedFields: [],
    });
    convertResource.mockResolvedValueOnce(converted);
    const client = new QueryClient();
    const invalidateQueries = vi.spyOn(client, "invalidateQueries");
    const user = userEvent.setup();
    render(
      <QueryClientProvider client={client}>
        <ResourceConversion resourceId={converted.id} />
      </QueryClientProvider>,
    );

    await user.selectOptions(
      screen.getByLabelText("Nova categoria"),
      "PRACTICE",
    );
    await user.selectOptions(screen.getByLabelText("Novo formato"), "QUESTION");
    await user.type(
      screen.getByLabelText("Enunciado da conversão"),
      "Explique",
    );
    await user.click(
      screen.getByRole("button", { name: "Verificar conversão" }),
    );
    await user.click(await screen.findByRole("button", { name: "Converter" }));

    await waitFor(() =>
      expect(client.getQueryData(["resources", converted.id])).toEqual(
        converted,
      ),
    );
    expect(invalidateQueries).toHaveBeenCalledWith({
      queryKey: ["trails", converted.trailId],
    });
  });

  it("reports a conversion failure and preserves the preview", async () => {
    previewResourceConversion.mockResolvedValueOnce({
      resourceId: "00000000-0000-4000-8000-000000000001",
      resourceUpdatedAt: "2026-08-01T12:00:00.000Z",
      targetCategory: "PRACTICE",
      targetFormat: "QUESTION",
      discardedFields: [],
    });
    convertResource.mockRejectedValueOnce(new Error("Falha"));
    const user = userEvent.setup();
    render(
      <QueryClientProvider client={new QueryClient()}>
        <ResourceConversion resourceId="00000000-0000-4000-8000-000000000001" />
      </QueryClientProvider>,
    );

    await user.selectOptions(
      screen.getByLabelText("Nova categoria"),
      "PRACTICE",
    );
    await user.selectOptions(screen.getByLabelText("Novo formato"), "QUESTION");
    await user.type(
      screen.getByLabelText("Enunciado da conversão"),
      "Explique",
    );
    await user.click(
      screen.getByRole("button", { name: "Verificar conversão" }),
    );
    await user.click(await screen.findByRole("button", { name: "Converter" }));

    expect(await screen.findByRole("alert")).toHaveTextContent(
      "Não foi possível converter o recurso.",
    );
    expect(screen.getByRole("button", { name: "Converter" })).toBeVisible();
  });

  it("ignores a preview response for a target that is no longer selected", async () => {
    const delayedPreview = {
      resourceId: "00000000-0000-4000-8000-000000000001",
      resourceUpdatedAt: "2026-08-01T12:00:00.000Z",
      targetCategory: "PRACTICE" as const,
      targetFormat: "QUESTION" as const,
      discardedFields: [] as string[],
    };
    let resolvePreview: (value: typeof delayedPreview) => void = () =>
      undefined;
    previewResourceConversion.mockImplementationOnce(
      () =>
        new Promise((resolve) => {
          resolvePreview = resolve;
        }),
    );
    const user = userEvent.setup();
    render(
      <QueryClientProvider client={new QueryClient()}>
        <ResourceConversion resourceId={delayedPreview.resourceId} />
      </QueryClientProvider>,
    );

    await user.selectOptions(
      screen.getByLabelText("Nova categoria"),
      "PRACTICE",
    );
    await user.selectOptions(screen.getByLabelText("Novo formato"), "QUESTION");
    await user.click(
      screen.getByRole("button", { name: "Verificar conversão" }),
    );
    await user.selectOptions(screen.getByLabelText("Novo formato"), "PROBLEM");
    await act(async () => {
      resolvePreview(delayedPreview);
      await Promise.resolve();
    });

    expect(
      screen.queryByRole("button", { name: "Converter" }),
    ).not.toBeInTheDocument();
  });

  it("reports a preview failure", async () => {
    previewResourceConversion.mockRejectedValueOnce(new Error("Falha"));
    const user = userEvent.setup();
    render(
      <QueryClientProvider client={new QueryClient()}>
        <ResourceConversion resourceId="00000000-0000-4000-8000-000000000001" />
      </QueryClientProvider>,
    );

    await user.click(
      screen.getByRole("button", { name: "Verificar conversão" }),
    );

    expect(await screen.findByRole("alert")).toHaveTextContent(
      "Não foi possível verificar a conversão.",
    );
  });
});
