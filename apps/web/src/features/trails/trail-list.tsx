"use client";

import Link from "next/link";
import { Map } from "lucide-react";

import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/shared/empty-state";
import { StatusBadge } from "@/components/shared/status-badge";
import { Progress } from "@/components/ui/progress";
import { Skeleton } from "@/components/ui/skeleton";

import { useTrails } from "./queries";

export function TrailList() {
  const trails = useTrails();
  if (trails.isPending)
    return (
      <ul className="grid gap-3" aria-label="Carregando trilhas">
        {Array.from({ length: 3 }, (_, index) => (
          <li key={index}>
            <Skeleton className="h-28 w-full" />
          </li>
        ))}
      </ul>
    );
  if (trails.isError)
    return (
      <Alert variant="destructive">
        <AlertDescription>
          Não foi possível carregar as trilhas.
        </AlertDescription>
      </Alert>
    );
  if (trails.data.length === 0)
    return (
      <EmptyState
        action={
          <Link
            className="inline-flex h-8 items-center justify-center rounded-lg bg-primary px-2.5 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/80 focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-ring/50"
            href="/trilhas/nova"
          >
            Criar trilha
          </Link>
        }
        description="Crie uma trilha para organizar seus estudos e acompanhar seu progresso."
        icon={Map}
        title="Nenhuma trilha cadastrada"
      />
    );
  return (
    <ul className="grid gap-3">
      {trails.data.map((trail) => {
        const status = trail.isComplete
          ? "COMPLETED"
          : trail.isActive
            ? "IN_PROGRESS"
            : "NOT_STARTED";

        return (
          <li
            className="rounded-xl border bg-card p-4 shadow-xs transition hover:border-primary/25 hover:shadow-sm"
            key={trail.id}
          >
            <Link
              className="block focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-ring/30"
              href={`/trilhas/${trail.id}`}
            >
              <div className="flex min-w-0 items-start justify-between gap-4">
                <div className="min-w-0 flex-1">
                  <h2 className="[overflow-wrap:anywhere] font-semibold">
                    {trail.title}
                  </h2>
                  <p className="mt-1 [overflow-wrap:anywhere] text-sm text-muted-foreground">
                    {trail.goal ?? "Sem objetivo"}
                  </p>
                </div>
                <StatusBadge status={status} />
              </div>
              <Progress
                className="mt-4"
                label={`Progresso de ${trail.title}`}
                value={trail.progress.percentage}
              />
            </Link>
          </li>
        );
      })}
    </ul>
  );
}

export function NewTrailButton() {
  return (
    <Button nativeButton={false} render={<Link href="/trilhas/nova" />}>
      Nova trilha
    </Button>
  );
}
