"use client";

import { Map } from "lucide-react";

import { PageHeader } from "@/components/shared/page-header";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

import { TrailForm } from "./trail-form";
import { useTrail } from "./queries";

export function TrailEdit({ trailId }: { trailId: string }) {
  const trail = useTrail(trailId);
  if (trail.isPending)
    return (
      <div aria-label="Carregando trilha" className="space-y-4">
        <Skeleton className="h-36 w-full" />
        <Skeleton className="h-72 w-full" />
      </div>
    );
  if (trail.isError)
    return (
      <Alert variant="destructive">
        <AlertDescription>Não foi possível carregar a trilha.</AlertDescription>
      </Alert>
    );
  return (
    <div className="space-y-6">
      <PageHeader
        description="Atualize as informações da trilha."
        eyebrow="Trilhas"
        icon={Map}
        title="Editar trilha"
      />
      <Card>
        <CardContent className="p-5 sm:p-6">
          <TrailForm mode="edit" trail={trail.data} />
        </CardContent>
      </Card>
    </div>
  );
}
