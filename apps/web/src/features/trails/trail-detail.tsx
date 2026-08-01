"use client";

import Link from "next/link";

import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";

import { DeleteTrailButton } from "./delete-trail-button";
import { useTrail } from "./queries";

export function TrailDetail({ trailId }: { trailId: string }) {
  const trail = useTrail(trailId);
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
    <div className="space-y-8">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold">{trail.data.title}</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            {trail.data.description ?? "Sem descrição"}
          </p>
        </div>
        <div className="flex gap-2">
          <Button
            render={<Link href={`/trilhas/${trailId}/editar`} />}
            variant="outline"
          >
            Editar
          </Button>
          <DeleteTrailButton trailId={trailId} />
        </div>
      </div>
      <dl className="grid gap-4 sm:grid-cols-3">
        <div>
          <dt className="text-sm text-muted-foreground">Objetivo</dt>
          <dd>{trail.data.goal ?? "Sem objetivo"}</dd>
        </div>
        <div>
          <dt className="text-sm text-muted-foreground">Progresso</dt>
          <dd>{trail.data.progress.percentage}%</dd>
        </div>
        <div>
          <dt className="text-sm text-muted-foreground">Recursos</dt>
          <dd>{trail.data.resources.length}</dd>
        </div>
      </dl>
      <section>
        <h2 className="text-lg font-medium">Recursos</h2>
        {trail.data.resources.length === 0 ? (
          <p className="mt-2 text-sm text-muted-foreground">
            Nenhum recurso cadastrado.
          </p>
        ) : (
          <ol className="mt-3 divide-y divide-border border-y border-border">
            {trail.data.resources.map((resource) => (
              <li className="py-3" key={resource.id}>
                {resource.title}
              </li>
            ))}
          </ol>
        )}
      </section>
    </div>
  );
}
