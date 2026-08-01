"use client";

import Link from "next/link";

import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";

import { useTrails } from "./queries";

export function TrailList() {
  const trails = useTrails();
  if (trails.isPending)
    return (
      <p className="text-sm text-muted-foreground">Carregando trilhas...</p>
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
      <p className="text-sm text-muted-foreground">
        Nenhuma trilha cadastrada.
      </p>
    );
  return (
    <ul className="divide-y divide-border border-y border-border">
      {trails.data.map((trail) => (
        <li
          className="flex items-center justify-between gap-4 py-4"
          key={trail.id}
        >
          <div>
            <Link
              className="font-medium hover:underline"
              href={`/trilhas/${trail.id}`}
            >
              {trail.title}
            </Link>
            <p className="text-sm text-muted-foreground">
              {trail.goal ?? "Sem objetivo"}
            </p>
          </div>
          <div className="shrink-0 text-right text-sm">
            <p className="tabular-nums">{trail.progress.percentage}%</p>
            <p className="text-muted-foreground">
              {trail.isComplete
                ? "Concluída"
                : trail.isActive
                  ? "Em andamento"
                  : "Não iniciada"}
            </p>
          </div>
        </li>
      ))}
    </ul>
  );
}

export function NewTrailButton() {
  return <Button render={<Link href="/trilhas/nova" />}>Nova trilha</Button>;
}
