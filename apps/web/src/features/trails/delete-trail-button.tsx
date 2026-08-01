"use client";

import { Dialog } from "@base-ui/react/dialog";
import { useRouter } from "next/navigation";
import { useState } from "react";

import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";

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
    <Dialog.Root open={open} onOpenChange={setOpen}>
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
      <Dialog.Portal>
        <Dialog.Backdrop className="fixed inset-0 bg-black/20" />
        <Dialog.Popup className="fixed top-1/2 left-1/2 z-50 w-[calc(100%-2rem)] max-w-md -translate-x-1/2 -translate-y-1/2 rounded-lg bg-background p-6 shadow-lg">
          <Dialog.Title className="text-base font-medium">
            Excluir {trail?.title}?
          </Dialog.Title>
          <Dialog.Description className="mt-2 text-sm text-muted-foreground">
            Esta ação excluirá permanentemente {trail?.resources.length ?? 0}{" "}
            {trail?.resources.length === 1 ? "recurso" : "recursos"}.
          </Dialog.Description>
          <div className="mt-5 flex justify-end gap-2">
            <Dialog.Close render={<Button type="button" variant="outline" />}>
              Cancelar
            </Dialog.Close>
            <Button
              disabled={remove.isPending}
              onClick={() => void confirmDelete()}
              type="button"
              variant="destructive"
            >
              Excluir
            </Button>
          </div>
        </Dialog.Popup>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
