"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogPortal,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { deleteResource } from "./api";
export function DeleteResourceButton({
  resource,
}: {
  resource: { id: string; trailId: string; title: string; category: string };
}) {
  const [open, setOpen] = useState(false);
  const router = useRouter();
  return (
    <AlertDialog onOpenChange={setOpen} open={open}>
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
          <div className="mt-5 flex justify-end gap-2">
            <AlertDialogCancel
              render={<Button type="button" variant="outline" />}
            >
              Cancelar
            </AlertDialogCancel>
            <AlertDialogAction
              render={
                <Button
                  type="button"
                  variant="destructive"
                  onClick={() =>
                    void deleteResource(resource.id).then(() =>
                      router.push(`/trilhas/${resource.trailId}`),
                    )
                  }
                />
              }
            >
              Excluir
            </AlertDialogAction>
          </div>
        </AlertDialogContent>
      </AlertDialogPortal>
    </AlertDialog>
  );
}
