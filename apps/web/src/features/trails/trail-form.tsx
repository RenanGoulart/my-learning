"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import {
  createTrailInputSchema,
  type TrailDetail,
} from "@my-learning/contracts";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";

import { FormField } from "@/components/shared/form-field";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
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
      <FormField
        description="Use um nome curto e fácil de reconhecer."
        error={form.formState.errors.title?.message}
        id="title"
        label="Título"
      >
        <Input {...form.register("title")} />
      </FormField>
      <FormField
        error={form.formState.errors.description?.message}
        id="description"
        label="Descrição"
      >
        <Textarea {...form.register("description")} />
      </FormField>
      <FormField
        error={form.formState.errors.goal?.message}
        id="goal"
        label="Objetivo"
      >
        <Textarea {...form.register("goal")} />
      </FormField>
      <Button disabled={mutation.isPending} type="submit">
        {mutation.isPending ? "Salvando..." : "Salvar"}
      </Button>
    </form>
  );
}
