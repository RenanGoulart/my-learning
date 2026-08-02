"use client";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { convertResource, previewResourceConversion } from "./api";
const names: Record<string, string> = {
  url: "URL",
  prompt: "Enunciado",
  practiceAnswer: "Resposta da prática",
  projectRequirements: "Requisitos do projeto",
  flashcardFront: "Frente do flashcard",
  flashcardBack: "Verso do flashcard",
};
export function ResourceConversion({ resourceId }: { resourceId: string }) {
  const [category, setCategory] = useState<"MATERIAL" | "PRACTICE">("MATERIAL");
  const [format, setFormat] = useState("COURSE");
  const [preview, setPreview] = useState<{ discardedFields: string[] } | null>(
    null,
  );
  const [expectedUpdatedAt, setExpectedUpdatedAt] = useState("");
  const [confirmed, setConfirmed] = useState(false);
  const [prompt, setPrompt] = useState("");
  return (
    <section className="space-y-4">
      <h2 className="text-lg font-medium">Converter recurso</h2>
      <label className="block text-sm">
        Nova categoria
        <select
          aria-label="Nova categoria"
          className="ml-2"
          onChange={(event) =>
            setCategory(event.target.value as "MATERIAL" | "PRACTICE")
          }
          value={category}
        >
          <option value="MATERIAL">Material</option>
          <option value="PRACTICE">Prática</option>
        </select>
      </label>
      <label className="block text-sm">
        Novo formato
        <select
          aria-label="Novo formato"
          className="ml-2"
          onChange={(event) => setFormat(event.target.value)}
          value={format}
        >
          <option value="COURSE">Curso</option>
          <option value="QUESTION">Questão</option>
          <option value="PROBLEM">Problema</option>
          <option value="PROJECT">Projeto</option>
          <option value="FLASHCARD">Flashcard</option>
        </select>
      </label>
      <Button
        onClick={() =>
          void previewResourceConversion(resourceId, {
            targetCategory: category,
            targetFormat: format,
          }).then((result) => {
            setPreview(result);
            setExpectedUpdatedAt(result.resourceUpdatedAt);
            setConfirmed(false);
          })
        }
        type="button"
        variant="outline"
      >
        Verificar conversão
      </Button>
      {preview ? (
        <div className="space-y-2">
          {preview.discardedFields.length ? (
            <>
              <p>Os seguintes dados serão descartados:</p>
              <ul>
                {preview.discardedFields.map((field) => (
                  <li key={field}>{names[field]}</li>
                ))}
              </ul>
              <label className="flex gap-2 text-sm">
                <input
                  aria-label="Confirmo o descarte dos dados listados"
                  checked={confirmed}
                  onChange={(event) => setConfirmed(event.target.checked)}
                  type="checkbox"
                />
                Confirmo o descarte dos dados listados
              </label>
            </>
          ) : (
            <p>Nenhum dado será descartado.</p>
          )}
        </div>
      ) : null}
      {category === "PRACTICE" &&
      ["QUESTION", "PROBLEM", "PROJECT"].includes(format) ? (
        <label className="block text-sm">
          Enunciado
          <textarea
            aria-label="Enunciado da conversão"
            className="mt-1 block w-full"
            onChange={(event) => setPrompt(event.target.value)}
            value={prompt}
          />
        </label>
      ) : null}
      {preview ? (
        <Button
          disabled={preview.discardedFields.length > 0 && !confirmed}
          onClick={() =>
            void convertResource(resourceId, {
              targetCategory: category,
              targetFormat: format as any,
              expectedUpdatedAt,
              discardConfirmed:
                preview.discardedFields.length === 0 || confirmed,
              ...(category === "PRACTICE" &&
              ["QUESTION", "PROBLEM", "PROJECT"].includes(format)
                ? { prompt }
                : {}),
            })
          }
          type="button"
        >
          Converter
        </Button>
      ) : null}
    </section>
  );
}
