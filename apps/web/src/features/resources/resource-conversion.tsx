"use client";

import type { ConvertResourceInput } from "@my-learning/contracts";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useRef, useState } from "react";

import { Button } from "@/components/ui/button";
import { trailKeys } from "@/features/trails/queries";

import { convertResource, previewResourceConversion } from "./api";
import { resourceKeys } from "./queries";

type Category = ConvertResourceInput["targetCategory"];
type Format = ConvertResourceInput["targetFormat"];

const formats: Record<Category, { label: string; value: Format }[]> = {
  MATERIAL: [
    { label: "Curso", value: "COURSE" },
    { label: "Documentação", value: "DOCUMENTATION" },
    { label: "Artigo", value: "ARTICLE" },
    { label: "Vídeo", value: "VIDEO" },
    { label: "Livro", value: "BOOK" },
    { label: "Outro", value: "OTHER" },
  ],
  PRACTICE: [
    { label: "Questão", value: "QUESTION" },
    { label: "Problema", value: "PROBLEM" },
    { label: "Projeto", value: "PROJECT" },
    { label: "Flashcard", value: "FLASHCARD" },
  ],
};

const names: Record<string, string> = {
  url: "URL",
  prompt: "Enunciado",
  practiceAnswer: "Resposta da prática",
  projectRequirements: "Requisitos do projeto",
  flashcardFront: "Frente do flashcard",
  flashcardBack: "Verso do flashcard",
};

export function ResourceConversion({ resourceId }: { resourceId: string }) {
  const [category, setCategory] = useState<Category>("MATERIAL");
  const [format, setFormat] = useState<Format>("COURSE");
  const [preview, setPreview] = useState<{ discardedFields: string[] } | null>(
    null,
  );
  const [expectedUpdatedAt, setExpectedUpdatedAt] = useState("");
  const [confirmed, setConfirmed] = useState(false);
  const [url, setUrl] = useState("");
  const [prompt, setPrompt] = useState("");
  const [requirements, setRequirements] = useState([""]);
  const [flashcardFront, setFlashcardFront] = useState("");
  const [flashcardBack, setFlashcardBack] = useState("");
  const [previewPending, setPreviewPending] = useState(false);
  const [previewError, setPreviewError] = useState(false);
  const previewRequest = useRef(0);
  const client = useQueryClient();
  const conversion = useMutation({
    mutationFn: (input: ConvertResourceInput) =>
      convertResource(resourceId, input),
    onSuccess: (resource) => {
      client.setQueryData(resourceKeys.detail(resourceId), resource);
      void client.invalidateQueries({
        queryKey: trailKeys.detail(resource.trailId),
      });
      setPreview(null);
    },
  });

  const invalidatePreview = () => {
    previewRequest.current += 1;
    setPreview(null);
    setExpectedUpdatedAt("");
    setConfirmed(false);
    setPreviewPending(false);
    setPreviewError(false);
    conversion.reset();
  };
  const handlePreview = async () => {
    const request = ++previewRequest.current;
    setPreviewPending(true);
    setPreviewError(false);
    try {
      const result = await previewResourceConversion(resourceId, {
        targetCategory: category,
        targetFormat: format,
      });
      if (request !== previewRequest.current) return;
      setPreview(result);
      setExpectedUpdatedAt(result.resourceUpdatedAt);
      setConfirmed(false);
    } catch {
      if (request === previewRequest.current) setPreviewError(true);
    } finally {
      if (request === previewRequest.current) setPreviewPending(false);
    }
  };
  const hasRequiredData =
    category === "MATERIAL" ||
    ((format === "QUESTION" || format === "PROBLEM") &&
      prompt.trim().length > 0) ||
    (format === "PROJECT" &&
      prompt.trim().length > 0 &&
      requirements.length > 0 &&
      requirements.every((requirement) => requirement.trim().length > 0)) ||
    (format === "FLASHCARD" &&
      flashcardFront.trim().length > 0 &&
      flashcardBack.trim().length > 0);

  const conversionInput = (): ConvertResourceInput => ({
    targetCategory: category,
    targetFormat: format,
    expectedUpdatedAt,
    discardConfirmed: Boolean(
      preview && (preview.discardedFields.length === 0 || confirmed),
    ),
    ...(category === "MATERIAL" && url.trim() ? { url } : {}),
    ...((format === "QUESTION" || format === "PROBLEM") && prompt.trim()
      ? { prompt }
      : {}),
    ...(format === "PROJECT"
      ? {
          prompt,
          requirements: requirements.map((text) => ({ text })),
        }
      : {}),
    ...(format === "FLASHCARD" ? { flashcardFront, flashcardBack } : {}),
  });

  return (
    <section className="space-y-4">
      <h2 className="text-lg font-medium">Converter recurso</h2>
      <label className="block text-sm">
        Nova categoria
        <select
          aria-label="Nova categoria"
          className="ml-2"
          onChange={(event) => {
            const nextCategory = event.target.value as Category;
            setCategory(nextCategory);
            setFormat(formats[nextCategory][0]!.value);
            invalidatePreview();
          }}
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
          onChange={(event) => {
            setFormat(event.target.value as Format);
            invalidatePreview();
          }}
          value={format}
        >
          {formats[category].map((item) => (
            <option key={item.value} value={item.value}>
              {item.label}
            </option>
          ))}
        </select>
      </label>
      <Button
        disabled={previewPending}
        onClick={() => void handlePreview()}
        type="button"
        variant="outline"
      >
        {previewPending ? "Verificando..." : "Verificar conversão"}
      </Button>
      {previewError ? (
        <p className="text-sm text-destructive" role="alert">
          Não foi possível verificar a conversão.
        </p>
      ) : null}
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
      {category === "MATERIAL" ? (
        <label className="block text-sm">
          URL
          <input
            aria-label="URL da conversão"
            className="mt-1 block w-full"
            onChange={(event) => setUrl(event.target.value)}
            type="url"
            value={url}
          />
        </label>
      ) : null}
      {format === "QUESTION" || format === "PROBLEM" || format === "PROJECT" ? (
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
      {format === "PROJECT" ? (
        <div className="space-y-2">
          {requirements.map((requirement, index) => (
            <label className="block text-sm" key={index}>
              Requisito {index + 1}
              <input
                aria-label={`Requisito ${index + 1} da conversão`}
                className="mt-1 block w-full"
                onChange={(event) =>
                  setRequirements((current) =>
                    current.map((item, itemIndex) =>
                      itemIndex === index ? event.target.value : item,
                    ),
                  )
                }
                value={requirement}
              />
            </label>
          ))}
          <Button
            onClick={() => setRequirements((current) => [...current, ""])}
            type="button"
            variant="outline"
          >
            Adicionar requisito
          </Button>
        </div>
      ) : null}
      {format === "FLASHCARD" ? (
        <div className="space-y-2">
          <label className="block text-sm">
            Frente
            <textarea
              aria-label="Frente da conversão"
              className="mt-1 block w-full"
              onChange={(event) => setFlashcardFront(event.target.value)}
              value={flashcardFront}
            />
          </label>
          <label className="block text-sm">
            Verso
            <textarea
              aria-label="Verso da conversão"
              className="mt-1 block w-full"
              onChange={(event) => setFlashcardBack(event.target.value)}
              value={flashcardBack}
            />
          </label>
        </div>
      ) : null}
      {preview ? (
        <Button
          disabled={
            conversion.isPending ||
            !hasRequiredData ||
            (preview.discardedFields.length > 0 && !confirmed)
          }
          onClick={() => conversion.mutate(conversionInput())}
          type="button"
        >
          {conversion.isPending ? "Convertendo..." : "Converter"}
        </Button>
      ) : null}
      {conversion.isError ? (
        <p className="text-sm text-destructive" role="alert">
          Não foi possível converter o recurso.
        </p>
      ) : null}
    </section>
  );
}
