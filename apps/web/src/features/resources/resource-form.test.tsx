import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { ResourceForm } from "./resource-form";
const { createResource } = vi.hoisted(() => ({ createResource: vi.fn() }));
vi.mock("./api", () => ({ createResource }));
vi.mock("next/navigation", () => ({ useRouter: () => ({ push: vi.fn() }) }));
describe("ResourceForm", () => {
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
});
