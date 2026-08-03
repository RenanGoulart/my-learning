"use client";
import type { CurrentCheckInResponse } from "@my-learning/contracts";
import { useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  AlertDialog,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogPortal,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
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
  const [fieldErrors, setFieldErrors] = useState<
    Partial<Record<"hours" | "minutes", string[]>>
  >({});
  const save = async () => {
    setError(undefined);
    setFieldErrors({});
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
      {error ? (
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      ) : null}
      <label className="block text-sm font-medium">
        Horas
        <input
          aria-invalid={Boolean(fieldErrors.hours)}
          className="mt-1 block"
          inputMode="numeric"
          onChange={(event) => setHours(event.target.value)}
          value={hours}
        />
      </label>
      {fieldErrors.hours?.map((message) => (
        <p className="text-sm text-destructive" key={message} role="alert">
          {message}
        </p>
      ))}
      <label className="block text-sm font-medium">
        Minutos
        <input
          aria-invalid={Boolean(fieldErrors.minutes)}
          className="mt-1 block"
          inputMode="numeric"
          onChange={(event) => setMinutes(event.target.value)}
          value={minutes}
        />
      </label>
      {fieldErrors.minutes?.map((message) => (
        <p className="text-sm text-destructive" key={message} role="alert">
          {message}
        </p>
      ))}
      <label className="block text-sm font-medium">
        Observação
        <textarea
          className="mt-1 block"
          onChange={(event) => setNote(event.target.value)}
          value={note}
        />
      </label>
      <div className="flex gap-2">
        <Button onClick={() => void save()} type="button">
          {checkIn ? "Salvar alterações" : "Registrar check-in"}
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
