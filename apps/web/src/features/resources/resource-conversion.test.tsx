import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { render, screen } from "@testing-library/react";
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
});
