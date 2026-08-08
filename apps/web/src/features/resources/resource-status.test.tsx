import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";

import { ResourceStatus } from "./resource-status";

const { updateResourceStatus } = vi.hoisted(() => ({
  updateResourceStatus: vi.fn(),
}));
vi.mock("./api", () => ({ updateResourceStatus }));

describe("ResourceStatus", () => {
  it("uses the amber status presentation for the selected in-progress option", () => {
    render(
      <QueryClientProvider client={new QueryClient()}>
        <ResourceStatus
          resourceId="00000000-0000-4000-8000-000000000001"
          status="IN_PROGRESS"
        />
      </QueryClientProvider>,
    );

    expect(
      screen.getByRole("radio", { name: "Em andamento" }).closest("label"),
    ).toHaveClass("text-status-in-progress-foreground");
  });

  it("rolls back an optimistic status failure", async () => {
    updateResourceStatus.mockRejectedValueOnce(new Error("Falha"));
    const user = userEvent.setup();
    render(
      <QueryClientProvider client={new QueryClient()}>
        <ResourceStatus
          resourceId="00000000-0000-4000-8000-000000000001"
          status="NOT_STARTED"
        />
      </QueryClientProvider>,
    );
    await user.click(screen.getByRole("radio", { name: "Em andamento" }));
    await waitFor(() =>
      expect(screen.getByRole("radio", { name: "Não iniciado" })).toBeChecked(),
    );
    expect(screen.getByRole("alert")).toHaveTextContent(
      "Não foi possível alterar o status.",
    );
  });

  it("prevents another transition while an update is pending", async () => {
    updateResourceStatus.mockImplementationOnce(
      () => new Promise(() => undefined),
    );
    const user = userEvent.setup();
    render(
      <QueryClientProvider client={new QueryClient()}>
        <ResourceStatus
          resourceId="00000000-0000-4000-8000-000000000001"
          status="NOT_STARTED"
        />
      </QueryClientProvider>,
    );

    await user.click(screen.getByRole("radio", { name: "Em andamento" }));

    await waitFor(() =>
      expect(
        screen.getByRole("radio", { name: "Em andamento" }),
      ).toBeDisabled(),
    );
  });
});
