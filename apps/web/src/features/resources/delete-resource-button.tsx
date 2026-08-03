"use client";
import { useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  AlertDialog,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogPortal,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { trailKeys } from "@/features/trails/queries";
import { deleteResource } from "./api";
import { resourceKeys } from "./queries";
export function DeleteResourceButton({
  resource,
}: {
  resource: { id: string; trailId: string; title: string; category: string };
}) {
  const [open, setOpen] = useState(false);
  const [pending, setPending] = useState(false);
  const [error, setError] = useState(false);
  const router = useRouter();
  const client = useQueryClient();
  const handleDelete = async () => {
    setPending(true);
    setError(false);
    try {
      await deleteResource(resource.id);
      client.removeQueries({
        queryKey: resourceKeys.detail(resource.id),
        exact: true,
      });
      await Promise.all([
        client.invalidateQueries({
          queryKey: trailKeys.detail(resource.trailId),
        }),
        client.invalidateQueries({ queryKey: trailKeys.all, exact: true }),
      ]);
      setOpen(false);
      router.push(`/trilhas/${resource.trailId}`);
    } catch {
      setError(true);
    } finally {
      setPending(false);
    }
  };
  return (
    <AlertDialog
      onOpenChange={(nextOpen) => {
        if (pending) return;
        setOpen(nextOpen);
        if (nextOpen) setError(false);
      }}
      open={open}
    >
      <Button
        aria-label="Excluir recurso"
        onClick={() => setOpen(true)}
        type="button"
        variant="destructive"
      >
        Excluir
      </Button>
      <AlertDialogPortal>
        <AlertDialogContent>
          <AlertDialogTitle>Excluir {resource.title}?</AlertDialogTitle>
          <AlertDialogDescription>
            {resource.category === "PRACTICE"
              ? "Esta exclusão também removerá dados de prática dependentes."
              : "Esta exclusão é permanente."}
          </AlertDialogDescription>
          {error ? (
            <p className="text-sm text-destructive" role="alert">
              Não foi possível excluir o recurso.
            </p>
          ) : null}
          <div className="mt-5 flex justify-end gap-2">
            <AlertDialogCancel
              render={
                <Button disabled={pending} type="button" variant="outline" />
              }
            >
              Cancelar
            </AlertDialogCancel>
            <Button
              disabled={pending}
              onClick={() => void handleDelete()}
              type="button"
              variant="destructive"
            >
              {pending ? "Excluindo..." : "Excluir"}
            </Button>
          </div>
        </AlertDialogContent>
      </AlertDialogPortal>
    </AlertDialog>
  );
}
