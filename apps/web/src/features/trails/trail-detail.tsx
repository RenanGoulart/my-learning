"use client";

import Link from "next/link";
import { BookOpen, Map } from "lucide-react";

import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/shared/empty-state";
import { PageHeader } from "@/components/shared/page-header";
import { StatusBadge } from "@/components/shared/status-badge";
import { Progress } from "@/components/ui/progress";
import { Skeleton } from "@/components/ui/skeleton";
import { ResourceOrderList } from "@/features/resources/resource-order-list";

import { DeleteTrailButton } from "./delete-trail-button";
import { useTrail } from "./queries";

export function TrailDetail({ trailId }: { trailId: string }) {
  const trail = useTrail(trailId);
  if (trail.isPending)
    return (
      <div className="space-y-4" aria-label="Carregando trilha">
        <Skeleton className="h-40 w-full" />
        <Skeleton className="h-36 w-full" />
        <Skeleton className="h-28 w-full" />
      </div>
    );
  if (trail.isError)
    return (
      <Alert variant="destructive">
        <AlertDescription>Não foi possível carregar a trilha.</AlertDescription>
      </Alert>
    );
  const status = trail.data.isComplete
    ? "COMPLETED"
    : trail.data.isActive
      ? "IN_PROGRESS"
      : "NOT_STARTED";

  return (
    <div className="space-y-8">
      <PageHeader
        actions={
          <>
            <Button
              nativeButton={false}
              render={<Link href={`/trilhas/${trailId}/editar`} />}
              variant="outline"
            >
              Editar
            </Button>
            <Button
              nativeButton={false}
              render={<Link href={`/trilhas/${trailId}/recursos/novo`} />}
            >
              Novo recurso
            </Button>
            <DeleteTrailButton trailId={trailId} />
          </>
        }
        breadcrumbs={
          <>
            <Link className="hover:text-foreground" href="/trilhas">
              Trilhas
            </Link>
            <span aria-hidden className="mx-2">
              /
            </span>
            <span aria-current="page">{trail.data.title}</span>
          </>
        }
        description={trail.data.description ?? "Sem descrição"}
        eyebrow="Trilha"
        icon={Map}
        status={<StatusBadge status={status} />}
        title={trail.data.title}
      />
      <div className="grid gap-4 lg:grid-cols-2">
        <section className="rounded-xl border bg-card p-5 shadow-xs">
          <h2 className="font-heading text-lg font-semibold">Progresso</h2>
          <div className="mt-4 flex items-baseline justify-between gap-4">
            <p className="text-3xl font-semibold tabular-nums">
              {trail.data.progress.percentage}%
            </p>
            <p className="text-sm text-muted-foreground">
              {trail.data.progress.completedResources} de{" "}
              {trail.data.progress.totalResources} recursos concluídos
            </p>
          </div>
          <Progress
            className="mt-4"
            label="Progresso da trilha"
            value={trail.data.progress.percentage}
          />
        </section>
        <section className="rounded-xl border bg-card p-5 shadow-xs">
          <h2 className="font-heading text-lg font-semibold">Contexto</h2>
          <dl className="mt-4 space-y-4">
            <div>
              <dt className="text-sm text-muted-foreground">Objetivo</dt>
              <dd className="mt-1">{trail.data.goal ?? "Sem objetivo"}</dd>
            </div>
            <div>
              <dt className="text-sm text-muted-foreground">Descrição</dt>
              <dd className="mt-1">
                {trail.data.description ?? "Sem descrição"}
              </dd>
            </div>
          </dl>
        </section>
      </div>
      <section>
        <div className="flex items-center justify-between gap-4">
          <h2 className="font-heading text-lg font-semibold">Recursos</h2>
          <span className="text-sm text-muted-foreground">
            {trail.data.resources.length} recursos
          </span>
        </div>
        {trail.data.resources.length === 0 ? (
          <EmptyState
            action={
              <Button
                nativeButton={false}
                render={<Link href={`/trilhas/${trailId}/recursos/novo`} />}
              >
                Novo recurso
              </Button>
            }
            description="Adicione um recurso para começar a avançar nesta trilha."
            icon={BookOpen}
            title="Nenhum recurso cadastrado"
          />
        ) : (
          <ResourceOrderList
            resources={trail.data.resources}
            trailId={trailId}
          />
        )}
      </section>
    </div>
  );
}
