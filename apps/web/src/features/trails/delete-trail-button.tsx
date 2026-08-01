"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  AlertDialog,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogOverlay,
  AlertDialogPortal,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

import { getTrail } from "./api";
import { useDeleteTrail } from "./queries";

export function DeleteTrailButton({ trailId }: { trailId: string }) {
  const router = useRouter();
  const [trail, setTrail] = useState<{ title: string; resources: unknown[] }>();
  const [error, setError] = useState<string>();
  const [open, setOpen] = useState(false);
  const remove = useDeleteTrail();
  async function beginDelete() {
    setError(undefined);
    try {
      const freshTrail = await getTrail(trailId);
      setTrail(freshTrail);
      setOpen(true);
    } catch {
      setError("Não foi possível preparar a exclusão da trilha.");
    }
  }
  async function confirmDelete() {
    setError(undefined);
    try {
      await remove.mutateAsync(trailId);
      router.push("/trilhas");
    } catch {
      setError("Não foi possível excluir a trilha.");
    }
  }
  return (
    <AlertDialog open={open} onOpenChange={setOpen}>
      {error ? (
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      ) : null}
      <Button
        onClick={() => void beginDelete()}
        type="button"
        variant="destructive"
      >
        Excluir trilha
      </Button>
      <AlertDialogPortal>
        <AlertDialogOverlay />
        <AlertDialogContent>
          <AlertDialogTitle className="text-base font-medium">
            Excluir {trail?.title}?
          </AlertDialogTitle>
          <AlertDialogDescription className="mt-2 text-sm text-muted-foreground">
            Esta ação excluirá permanentemente {trail?.resources.length ?? 0}{" "}
            {trail?.resources.length === 1 ? "recurso" : "recursos"}.
          </AlertDialogDescription>
          <div className="mt-5 flex justify-end gap-2">
            <AlertDialogCancel
              render={<Button type="button" variant="outline" />}
            >
              Cancelar
            </AlertDialogCancel>
            <Button
              disabled={remove.isPending}
              onClick={() => void confirmDelete()}
              type="button"
              variant="destructive"
            >
              Excluir
            </Button>
          </div>
        </AlertDialogContent>
      </AlertDialogPortal>
    </AlertDialog>
  );
}
