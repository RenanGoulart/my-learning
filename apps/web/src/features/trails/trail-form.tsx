"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import {
  createTrailInputSchema,
  type TrailDetail,
} from "@my-learning/contracts";
import { useRouter } from "next/navigation";
import {
  cloneElement,
  isValidElement,
  useEffect,
  type ReactElement,
} from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";

import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { ApiClientError } from "@/lib/api/client";

import { useCreateTrail, useUpdateTrail } from "./queries";

const trailFormSchema = createTrailInputSchema.extend({
  description: z.string().optional(),
  goal: z.string().optional(),
});

type TrailFormValues = z.input<typeof trailFormSchema>;

function applyApiErrors(
  error: unknown,
  setError: ReturnType<typeof useForm<TrailFormValues>>["setError"],
) {
  if (!(error instanceof ApiClientError)) return;
  const fieldErrors = error.body.error.fieldErrors;
  if (!fieldErrors) return;
  for (const [field, messages] of Object.entries(fieldErrors)) {
    if (field === "title" || field === "description" || field === "goal") {
      const message = messages[0];
      if (message) setError(field, { type: "server", message });
    }
  }
}

export function TrailForm({
  mode,
  trail,
}: {
  mode: "create" | "edit";
  trail?: TrailDetail;
}) {
  const router = useRouter();
  const createMutation = useCreateTrail();
  const updateMutation = useUpdateTrail(trail?.id ?? "");
  const form = useForm<TrailFormValues>({
    resolver: zodResolver(trailFormSchema),
    defaultValues: {
      title: trail?.title ?? "",
      description: trail?.description ?? "",
      goal: trail?.goal ?? "",
    },
  });
  const mutation = mode === "create" ? createMutation : updateMutation;

  useEffect(() => {
    if (!form.formState.isDirty) return;
    const confirm = (event: BeforeUnloadEvent) => {
      event.preventDefault();
      event.returnValue = "";
    };
    window.addEventListener("beforeunload", confirm);
    return () => window.removeEventListener("beforeunload", confirm);
  }, [form.formState.isDirty]);

  const onSubmit = form.handleSubmit(async (values) => {
    form.clearErrors();
    try {
      const input = trailFormSchema.parse(values);
      const saved = await mutation.mutateAsync(input);
      router.push(`/trilhas/${saved.id}`);
    } catch (error) {
      applyApiErrors(error, form.setError);
      if (!(error instanceof ApiClientError) || !error.body.error.fieldErrors) {
        form.setError("root", {
          message:
            error instanceof Error
              ? error.message
              : "Não foi possível salvar a trilha.",
        });
      }
    }
  });

  return (
    <form
      className="max-w-2xl space-y-5"
      noValidate
      onSubmit={(event) => void onSubmit(event)}
    >
      {form.formState.errors.root ? (
        <Alert variant="destructive">
          <AlertDescription>
            {form.formState.errors.root.message}
          </AlertDescription>
        </Alert>
      ) : null}
      <Field
        id="title"
        label="Título"
        error={form.formState.errors.title?.message}
      >
        <input
          aria-invalid={Boolean(form.formState.errors.title)}
          className="h-9 w-full rounded-md border border-input bg-background px-3 text-sm"
          {...form.register("title")}
        />
      </Field>
      <Field
        id="description"
        label="Descrição"
        error={form.formState.errors.description?.message}
      >
        <textarea
          className="min-h-24 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
          {...form.register("description")}
        />
      </Field>
      <Field
        id="goal"
        label="Objetivo"
        error={form.formState.errors.goal?.message}
      >
        <textarea
          className="min-h-20 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
          {...form.register("goal")}
        />
      </Field>
      <Button disabled={mutation.isPending} type="submit">
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
  error: string | undefined;
  id: string;
  label: string;
}) {
  const errorId = `${id}-error`;
  return (
    <div className="space-y-2">
      <label className="text-sm font-medium" htmlFor={id}>
        {label}
      </label>
      {isValidElement(children)
        ? cloneElement(
            children as ReactElement<{
              id?: string;
              "aria-describedby"?: string;
            }>,
            {
              id,
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
