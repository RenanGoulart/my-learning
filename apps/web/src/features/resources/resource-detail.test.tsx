import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { render, screen, within } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { ResourceDetail } from "./resource-detail";

const { getResource } = vi.hoisted(() => ({
  getResource: vi.fn(),
}));

vi.mock("./api", () => ({ getResource }));
vi.mock("next/navigation", () => ({ useRouter: () => ({ push: vi.fn() }) }));

describe("ResourceDetail", () => {
  it("composes the material detail header and external-resource action", async () => {
    getResource.mockResolvedValueOnce({
      id: "00000000-0000-4000-8000-000000000001",
      trailId: "00000000-0000-4000-8000-000000000002",
      title: "Material A",
      description: "Material para estudo",
      category: "MATERIAL",
      format: "ARTICLE",
      status: "IN_PROGRESS",
      position: 1,
      url: "https://example.com/material-a",
      prompt: null,
      practiceAnswer: null,
      flashcardFront: null,
      flashcardBack: null,
      projectRequirements: [],
      createdAt: "2026-08-01T12:00:00.000Z",
      updatedAt: "2026-08-01T12:00:00.000Z",
    });

    render(
      <QueryClientProvider client={new QueryClient()}>
        <ResourceDetail resourceId="00000000-0000-4000-8000-000000000001" />
      </QueryClientProvider>,
    );

    expect(
      await screen.findByRole("heading", { level: 1, name: "Material A" }),
    ).toBeVisible();
    expect(
      within(screen.getByRole("banner")).getByText("Em andamento"),
    ).toBeVisible();
    expect(
      screen.getByRole("link", { name: "Abrir material" }),
    ).toHaveAttribute("target", "_blank");
    expect(
      screen.getByRole("heading", { name: "Converter recurso" }),
    ).toBeVisible();
  });
});
