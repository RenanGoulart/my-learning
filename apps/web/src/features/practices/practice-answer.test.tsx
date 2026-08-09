import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import type { ResourceDetail } from "@my-learning/contracts";
import { act, render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { PracticeAnswer } from "./practice-answer";

const { savePracticeAnswer } = vi.hoisted(() => ({
  savePracticeAnswer: vi.fn(),
}));
vi.mock("@/features/resources/api", () => ({ savePracticeAnswer }));

const resource: ResourceDetail = {
  id: "00000000-0000-4000-8000-000000000001",
  trailId: "00000000-0000-4000-8000-000000000002",
  title: "Questão",
  description: null,
  category: "PRACTICE",
  format: "QUESTION",
  status: "NOT_STARTED",
  position: 1,
  url: null,
  prompt: "Quando usar cache?",
  practiceAnswer: null,
  flashcardFront: null,
  flashcardBack: null,
  projectRequirements: [],
  createdAt: "2026-08-01T12:00:00.000Z",
  updatedAt: "2026-08-01T12:00:00.000Z",
};

describe("PracticeAnswer", () => {
  beforeEach(() => vi.clearAllMocks());

  it("shows saving feedback and restores the action after a failed save", async () => {
    let rejectSave: (reason?: unknown) => void = () => undefined;
    savePracticeAnswer.mockImplementationOnce(
      () =>
        new Promise((_, reject) => {
          rejectSave = reject;
        }),
    );
    const user = userEvent.setup();
    render(
      <QueryClientProvider client={new QueryClient()}>
        <PracticeAnswer resource={resource} />
      </QueryClientProvider>,
    );

    await user.click(screen.getByRole("button", { name: "Salvar resposta" }));

    try {
      expect(
        screen.getByRole("button", { name: "Salvando..." }),
      ).toBeDisabled();
    } finally {
      act(() => {
        rejectSave(new Error("Falha ao salvar"));
      });
    }

    expect(
      await screen.findByRole("button", { name: "Salvar resposta" }),
    ).toBeEnabled();
  });

  it("saves only after the explicit answer action", async () => {
    savePracticeAnswer.mockResolvedValueOnce({
      ...resource,
      practiceAnswer: "Minha resposta",
    });
    const user = userEvent.setup();
    render(
      <QueryClientProvider client={new QueryClient()}>
        <PracticeAnswer resource={resource} />
      </QueryClientProvider>,
    );
    await user.type(screen.getByLabelText("Resposta atual"), "Minha resposta");
    expect(savePracticeAnswer).not.toHaveBeenCalled();
    await user.click(screen.getByRole("button", { name: "Salvar resposta" }));
    await waitFor(() =>
      expect(savePracticeAnswer).toHaveBeenCalledWith(
        resource.id,
        "Minha resposta",
      ),
    );
  });
});
