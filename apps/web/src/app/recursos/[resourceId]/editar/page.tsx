"use client";

import { BookOpen } from "lucide-react";
import { use } from "react";

import { PageHeader } from "@/components/shared/page-header";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { ResourceForm } from "@/features/resources/resource-form";
import { useResource } from "@/features/resources/queries";

export default function EditResourcePage({
  params,
}: {
  params: Promise<{ resourceId: string }>;
}) {
  const { resourceId } = use(params);
  const resource = useResource(resourceId);
  if (resource.isPending)
    return (
      <div aria-label="Carregando recurso" className="space-y-4">
        <Skeleton className="h-36 w-full" />
        <Skeleton className="h-72 w-full" />
      </div>
    );
  if (resource.isError)
    return (
      <Alert variant="destructive">
        <AlertDescription>
          Não foi possível carregar o recurso.
        </AlertDescription>
      </Alert>
    );
  return (
    <div className="space-y-6">
      <PageHeader
        description="Atualize as informações do recurso."
        eyebrow="Recursos"
        icon={BookOpen}
        title="Editar recurso"
      />
      <Card>
        <CardContent className="p-5 sm:p-6">
          <ResourceForm
            mode="edit"
            resource={resource.data}
            trailId={resource.data.trailId}
          />
        </CardContent>
      </Card>
    </div>
  );
}
