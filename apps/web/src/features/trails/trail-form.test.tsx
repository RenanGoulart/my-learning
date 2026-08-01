import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";

import { ApiClientError } from "@/lib/api/client";

import { TrailForm } from "./trail-form";

const { createTrail } = vi.hoisted(() => ({ createTrail: vi.fn() }));

vi.mock("./api", () => ({ createTrail }));
vi.mock("next/navigation", () => ({ useRouter: () => ({ push: vi.fn() }) }));

describe("TrailForm", () => {
  it("does not register beforeunload while the form is pristine", () => {
    const addEventListener = vi.spyOn(window, "addEventListener");
    render(
      <QueryClientProvider client={new QueryClient()}>
        <TrailForm mode="create" />
      </QueryClientProvider>,
    );

    expect(addEventListener).not.toHaveBeenCalledWith(
      "beforeunload",
      expect.any(Function),
    );
    addEventListener.mockRestore();
  });

  it("keeps entered values and associates a server field error", async () => {
    createTrail.mockRejectedValueOnce(
      new ApiClientError(422, {
        error: {
          code: "VALIDATION_ERROR",
          message: "Revise os campos.",
          fieldErrors: { title: ["Informe o título."] },
        },
      }),
    );
    const user = userEvent.setup();

    render(
      <QueryClientProvider client={new QueryClient()}>
        <TrailForm mode="create" />
      </QueryClientProvider>,
    );

    await user.type(screen.getByLabelText("Título"), "Minha trilha");
    await user.click(screen.getByRole("button", { name: "Salvar" }));

    expect(screen.getByLabelText("Título")).toHaveValue("Minha trilha");
    expect(screen.getByRole("alert")).toHaveTextContent("Informe o título.");
  });
});
