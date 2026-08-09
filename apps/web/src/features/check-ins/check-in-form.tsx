"use client";

import type { CurrentCheckInResponse } from "@my-learning/contracts";
import { useQueryClient } from "@tanstack/react-query";
import { useState } from "react";

import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  AlertDialog,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogPortal,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

import { deleteCheckIn, saveCheckIn } from "./api";
import { DurationFieldsError, durationFieldsToMinutes } from "./duration";
import { checkInKeys } from "./queries";

export function CheckInForm({
  currentLocalDate,
  checkIn,
}: CurrentCheckInResponse) {
  const client = useQueryClient();
  const [note, setNote] = useState(checkIn?.note ?? "");
  const [hours, setHours] = useState(
    checkIn?.durationMinutes
      ? String(Math.floor(checkIn.durationMinutes / 60))
      : "",
  );
  const [minutes, setMinutes] = useState(
    checkIn?.durationMinutes ? String(checkIn.durationMinutes % 60) : "",
  );
  const [error, setError] = useState<string>();
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [fieldErrors, setFieldErrors] = useState<
    Partial<Record<"hours" | "minutes", string[]>>
  >({});
  const save = async () => {
    setError(undefined);
    setFieldErrors({});
    setIsSaving(true);
    try {
      const durationMinutes = durationFieldsToMinutes({ hours, minutes });
      await saveCheckIn(currentLocalDate, {
        note,
        ...(durationMinutes === undefined ? {} : { durationMinutes }),
      });
      await client.invalidateQueries({ queryKey: checkInKeys.all });
    } catch (cause) {
      if (cause instanceof DurationFieldsError)
        setFieldErrors(cause.fieldErrors);
      else
        setError(
          cause instanceof Error
            ? cause.message
            : "Não foi possível salvar o check-in.",
        );
    } finally {
      setIsSaving(false);
    }
  };
  const remove = async () => {
    try {
      await deleteCheckIn(currentLocalDate);
      await client.invalidateQueries({ queryKey: checkInKeys.all });
      setDeleteOpen(false);
    } catch {
      setError("Não foi possível excluir o check-in.");
    }
  };

  return (
    <section className="space-y-4">
      <h2 className="text-xl font-semibold">Check-in de hoje</h2>
      <Card className="border-violet-200 bg-violet-50/50 dark:border-violet-900 dark:bg-violet-950/20">
        <CardContent className="space-y-4">
          {error ? (
            <Alert variant="destructive">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          ) : null}
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label
                className="block text-sm font-medium"
                htmlFor="check-in-hours"
              >
                Horas
              </label>
              <Input
                aria-invalid={Boolean(fieldErrors.hours)}
                className="mt-1"
                id="check-in-hours"
                inputMode="numeric"
                onChange={(event) => setHours(event.target.value)}
                value={hours}
              />
              {fieldErrors.hours?.map((message) => (
                <p
                  className="mt-1 text-sm text-destructive"
                  key={message}
                  role="alert"
                >
                  {message}
                </p>
              ))}
            </div>
            <div>
              <label
                className="block text-sm font-medium"
                htmlFor="check-in-minutes"
              >
                Minutos
              </label>
              <Input
                aria-invalid={Boolean(fieldErrors.minutes)}
                className="mt-1"
                id="check-in-minutes"
                inputMode="numeric"
                onChange={(event) => setMinutes(event.target.value)}
                value={minutes}
              />
              {fieldErrors.minutes?.map((message) => (
                <p
                  className="mt-1 text-sm text-destructive"
                  key={message}
                  role="alert"
                >
                  {message}
                </p>
              ))}
            </div>
          </div>
          <div>
            <label
              className="block text-sm font-medium"
              htmlFor="check-in-note"
            >
              Observação
            </label>
            <Textarea
              className="mt-1"
              id="check-in-note"
              onChange={(event) => setNote(event.target.value)}
              value={note}
            />
          </div>
          <div className="flex flex-wrap gap-2">
            <Button
              disabled={isSaving}
              onClick={() => void save()}
              type="button"
            >
              {isSaving
                ? "Salvando..."
                : checkIn
                  ? "Salvar alterações"
                  : "Registrar check-in"}
            </Button>
            {checkIn ? (
              <Button
                onClick={() => setDeleteOpen(true)}
                type="button"
                variant="destructive"
              >
                Excluir check-in
              </Button>
            ) : null}
          </div>
        </CardContent>
      </Card>
      <AlertDialog onOpenChange={setDeleteOpen} open={deleteOpen}>
        <AlertDialogPortal>
          <AlertDialogContent>
            <AlertDialogTitle>
              Excluir check-in de {currentLocalDate}?
            </AlertDialogTitle>
            <AlertDialogDescription>
              Seu streak será recalculado após a exclusão.
            </AlertDialogDescription>
            <div className="mt-5 flex justify-end gap-2">
              <AlertDialogCancel
                render={<Button type="button" variant="outline" />}
              >
                Cancelar
              </AlertDialogCancel>
              <Button
                onClick={() => void remove()}
                type="button"
                variant="destructive"
              >
                Excluir
              </Button>
            </div>
          </AlertDialogContent>
        </AlertDialogPortal>
      </AlertDialog>
    </section>
  );
}
