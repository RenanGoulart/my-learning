"use client";

import { Alert, AlertDescription } from "@/components/ui/alert";
import { TrailForm } from "@/features/trails/trail-form";
import { useTrail } from "@/features/trails/queries";

export default function EditTrailPage({
  params,
}: {
  params: { trailId: string };
}) {
  const trail = useTrail(params.trailId);
  if (trail.isPending)
    return (
      <p className="text-sm text-muted-foreground">Carregando trilha...</p>
    );
  if (trail.isError)
    return (
      <Alert variant="destructive">
        <AlertDescription>Não foi possível carregar a trilha.</AlertDescription>
      </Alert>
    );
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold">Editar trilha</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Atualize as informações da trilha.
        </p>
      </div>
      <TrailForm mode="edit" trail={trail.data} />
    </div>
  );
}
