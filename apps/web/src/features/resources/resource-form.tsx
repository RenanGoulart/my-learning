"use client";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  createResourceInputSchema,
  type ResourceDetail,
} from "@my-learning/contracts";
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
import { createResource, updateResource } from "./api";

const formSchema = createResourceInputSchema;
type Values = z.input<typeof formSchema>;
const formats = {
  MATERIAL: ["COURSE", "DOCUMENTATION", "ARTICLE", "VIDEO", "BOOK", "OTHER"],
  PRACTICE: ["QUESTION", "PROBLEM", "PROJECT", "FLASHCARD"],
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
  const form = useForm<Values>({
    resolver: zodResolver(formSchema),
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
          requirements: resource.projectRequirements.map((item) => ({
            text: item.text,
          })),
        }
      : { title: "", category: "MATERIAL", format: "COURSE" },
  });
  const category = form.watch("category");
  const format = form.watch("format");
  const requirements = useFieldArray({
    control: form.control,
    name: "requirements",
  });
  useEffect(() => {
    if (format === "PROJECT" && requirements.fields.length === 0)
      requirements.append({ text: "" });
  }, [format, requirements]);
  const submit = form.handleSubmit(async (values) => {
    try {
      const saved =
        mode === "create"
          ? await createResource(trailId, formSchema.parse(values))
          : await updateResource(resource!.id, {
              title: values.title,
              description: values.description,
              url: values.url,
              prompt: values.prompt,
              flashcardFront: values.flashcardFront,
              flashcardBack: values.flashcardBack,
            });
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
      <Field
        error={form.formState.errors.category?.message}
        id="resource-category"
        label="Categoria"
      >
        <select {...form.register("category")} disabled={mode === "edit"}>
          <option value="MATERIAL">Material</option>
          <option value="PRACTICE">Prática</option>
        </select>
      </Field>
      <Field
        error={form.formState.errors.format?.message}
        id="resource-format"
        label="Formato"
      >
        <select {...form.register("format")} disabled={mode === "edit"}>
          {formats[category].map((item) => (
            <option key={item} value={item}>
              {item}
            </option>
          ))}
        </select>
      </Field>
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
      {format === "PROJECT" ? (
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
      <Button type="submit">Salvar</Button>
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
