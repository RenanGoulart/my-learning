"use client";

import type { ResourceDetail } from "@my-learning/contracts";
import { useQueryClient } from "@tanstack/react-query";
import { useState } from "react";

import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { savePracticeAnswer } from "@/features/resources/api";
import { resourceKeys } from "@/features/resources/queries";

export function PracticeAnswer({ resource }: { resource: ResourceDetail }) {
  const client = useQueryClient();
  const [answer, setAnswer] = useState(resource.practiceAnswer ?? "");
  const [error, setError] = useState<string>();
  const [isSaving, setIsSaving] = useState(false);

  async function save() {
    setError(undefined);
    setIsSaving(true);
    try {
      const saved = await savePracticeAnswer(
        resource.id,
        answer.trim() || null,
      );
      client.setQueryData(resourceKeys.detail(saved.id), saved);
    } catch (reason) {
      setError(
        reason instanceof Error
          ? reason.message
          : "Não foi possível salvar a resposta.",
      );
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <section className="space-y-3">
      <h2 className="text-lg font-medium">Resposta atual</h2>
      {error ? (
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      ) : null}
      <Textarea
        aria-label="Resposta atual"
        onChange={(event) => setAnswer(event.target.value)}
        value={answer}
      />
      <Button disabled={isSaving} onClick={() => void save()} type="button">
        {isSaving ? "Salvando..." : "Salvar resposta"}
      </Button>
    </section>
  );
}
