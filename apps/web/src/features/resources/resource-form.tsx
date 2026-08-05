"use client";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  createResourceInputSchema,
  type ResourceDetail,
} from "@my-learning/contracts";
import { useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import {
  cloneElement,
  isValidElement,
  type ReactElement,
  useEffect,
} from "react";
import { useFieldArray, useForm } from "react-hook-form";
import { z } from "zod";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { trailKeys } from "@/features/trails/queries";
import { createResource, updateResource } from "./api";
import { resourceKeys } from "./queries";

const formSchema = createResourceInputSchema;
type Values = z.input<typeof formSchema>;
const formats = {
  MATERIAL: [
    { value: "COURSE", label: "Curso" },
    { value: "DOCUMENTATION", label: "Documentação" },
    { value: "ARTICLE", label: "Artigo" },
    { value: "VIDEO", label: "Vídeo" },
    { value: "BOOK", label: "Livro" },
    { value: "OTHER", label: "Outro" },
  ],
  PRACTICE: [
    { value: "QUESTION", label: "Questão" },
    { value: "PROBLEM", label: "Problema" },
    { value: "PROJECT", label: "Projeto" },
    { value: "FLASHCARD", label: "Flashcard" },
  ],
} as const;
export function ResourceForm({
  mode,
  trailId,
  resource,
}: {
  mode: "create" | "edit";
  trailId: string;
  resource?: ResourceDetail;
}) {
  const router = useRouter();
  const client = useQueryClient();
  const form = useForm<Values>({
    resolver: zodResolver(formSchema),
    shouldUnregister: true,
    defaultValues: resource
      ? {
          title: resource.title,
          description: resource.description ?? "",
          category: resource.category,
          format: resource.format,
          url: resource.url ?? undefined,
          prompt: resource.prompt ?? undefined,
          flashcardFront: resource.flashcardFront ?? undefined,
          flashcardBack: resource.flashcardBack ?? undefined,
          ...(resource.format === "PROJECT"
            ? {
                requirements: resource.projectRequirements.map((item) => ({
                  text: item.text,
                })),
              }
            : {}),
        }
      : { title: "" },
  });
  const category = form.watch("category");
  const format = form.watch("format");
  const requirements = useFieldArray({
    control: form.control,
    name: "requirements",
  });
  useEffect(() => {
    if (mode === "edit") {
      if (format !== "PROJECT") form.unregister("requirements");
      return;
    }
    if (format !== "PROJECT") {
      form.unregister("requirements");
      return;
    }
    if (format === "PROJECT" && requirements.fields.length === 0) {
      requirements.append({ text: "" });
    }
  }, [
    format,
    mode,
    form.unregister,
    requirements.append,
    requirements.fields.length,
  ]);
  const submit = form.handleSubmit(async (values) => {
    try {
      const { requirements, ...resourceValues } = values;
      const createInput =
        values.format === "PROJECT"
          ? { ...resourceValues, requirements }
          : resourceValues;
      const saved =
        mode === "create"
          ? await createResource(trailId, formSchema.parse(createInput))
          : await updateResource(resource!.id, {
              title: values.title,
              description: values.description,
              url: values.url,
              prompt: values.prompt,
              flashcardFront: values.flashcardFront,
              flashcardBack: values.flashcardBack,
            });
      client.setQueryData(resourceKeys.detail(saved.id), saved);
      await Promise.all([
        client.invalidateQueries({ queryKey: trailKeys.detail(trailId) }),
        client.invalidateQueries({ queryKey: trailKeys.all, exact: true }),
      ]);
      router.push(`/recursos/${saved.id}`);
    } catch (error) {
      form.setError("root", {
        message:
          error instanceof Error
            ? error.message
            : "Não foi possível salvar o recurso.",
      });
    }
  });
  return (
    <form
      className="max-w-2xl space-y-5"
      noValidate
      onSubmit={(event) => void submit(event)}
    >
      {form.formState.errors.root ? (
        <Alert variant="destructive">
          <AlertDescription>
            {form.formState.errors.root.message}
          </AlertDescription>
        </Alert>
      ) : null}
      <Field
        error={form.formState.errors.title?.message}
        id="resource-title"
        label="Título"
      >
        <input {...form.register("title")} />
      </Field>
      {mode === "edit" ? (
        <div className="space-y-2">
          <p className="text-sm font-medium">Categoria</p>
          <p className="text-sm">{resource?.category}</p>
          <input type="hidden" {...form.register("category")} />
        </div>
      ) : (
        <Field
          error={form.formState.errors.category?.message}
          id="resource-category"
          label="Categoria"
        >
          <select
            {...form.register("category", {
              onChange: () => form.resetField("format"),
            })}
          >
            <option value="">Selecione uma categoria</option>
            <option value="MATERIAL">Material</option>
            <option value="PRACTICE">Prática</option>
          </select>
        </Field>
      )}
      {mode === "edit" ? (
        <div className="space-y-2">
          <p className="text-sm font-medium">Formato</p>
          <p className="text-sm">{resource?.format}</p>
          <input type="hidden" {...form.register("format")} />
        </div>
      ) : (
        <Field
          error={form.formState.errors.format?.message}
          id="resource-format"
          label="Formato"
        >
          <select {...form.register("format")} disabled={!category}>
            <option value="">Selecione um formato</option>
            {(category ? formats[category] : []).map((item) => (
              <option key={item.value} value={item.value}>
                {item.label}
              </option>
            ))}
          </select>
        </Field>
      )}
      <Field
        error={form.formState.errors.description?.message}
        id="resource-description"
        label="Descrição"
      >
        <textarea {...form.register("description")} />
      </Field>
      {category === "MATERIAL" ? (
        <Field
          error={form.formState.errors.url?.message}
          id="resource-url"
          label="URL"
        >
          <input type="url" {...form.register("url")} />
        </Field>
      ) : null}
      {["QUESTION", "PROBLEM", "PROJECT"].includes(format) ? (
        <Field
          error={form.formState.errors.prompt?.message}
          id="resource-prompt"
          label="Enunciado"
        >
          <textarea {...form.register("prompt")} />
        </Field>
      ) : null}
      {format === "PROJECT" && mode === "edit" ? (
        <section className="space-y-2">
          <h3 className="text-sm font-medium">Requisitos</h3>
          <ol className="list-decimal space-y-1 pl-5 text-sm">
            {resource?.projectRequirements.map((requirement) => (
              <li key={requirement.id}>{requirement.text}</li>
            ))}
          </ol>
        </section>
      ) : null}
      {format === "PROJECT" && mode === "create" ? (
        <div className="space-y-2">
          {requirements.fields.map((field, index) => (
            <Field
              error={form.formState.errors.requirements?.[index]?.text?.message}
              id={`requirement-${index}`}
              key={field.id}
              label={`Requisito ${index + 1}`}
            >
              <input {...form.register(`requirements.${index}.text`)} />
            </Field>
          ))}
          <Button
            onClick={() => requirements.append({ text: "" })}
            type="button"
            variant="outline"
          >
            Adicionar requisito
          </Button>
        </div>
      ) : null}
      {format === "FLASHCARD" ? (
        <>
          <Field
            error={form.formState.errors.flashcardFront?.message}
            id="resource-front"
            label="Frente"
          >
            <textarea {...form.register("flashcardFront")} />
          </Field>
          <Field
            error={form.formState.errors.flashcardBack?.message}
            id="resource-back"
            label="Verso"
          >
            <textarea {...form.register("flashcardBack")} />
          </Field>
        </>
      ) : null}
      <Button disabled={form.formState.isSubmitting} type="submit">
        Salvar
      </Button>
    </form>
  );
}
function Field({
  children,
  error,
  id,
  label,
}: {
  children: React.ReactNode;
  error?: string | undefined;
  id: string;
  label: string;
}) {
  const errorId = `${id}-error`;
  return (
    <div className="space-y-2">
      <label className="block text-sm font-medium" htmlFor={id}>
        {label}
      </label>
      {isValidElement(children)
        ? cloneElement(
            children as ReactElement<{
              id?: string;
              "aria-invalid"?: boolean;
              "aria-describedby"?: string;
            }>,
            {
              id,
              "aria-invalid": Boolean(error),
              ...(error ? { "aria-describedby": errorId } : {}),
            },
          )
        : children}
      {error ? (
        <p className="text-sm text-destructive" id={errorId} role="alert">
          {error}
        </p>
      ) : null}
    </div>
  );
}
