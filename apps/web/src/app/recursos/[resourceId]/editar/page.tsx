"use client";
import { use } from "react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { ResourceForm } from "@/features/resources/resource-form";
import { useResource } from "@/features/resources/queries";
export default function EditResourcePage({
  params,
}: {
  params: Promise<{ resourceId: string }>;
}) {
  const { resourceId } = use(params);
  const resource = useResource(resourceId);
  if (resource.isPending) return <p>Carregando recurso...</p>;
  if (resource.isError)
    return (
      <Alert variant="destructive">
        <AlertDescription>
          Não foi possível carregar o recurso.
        </AlertDescription>
      </Alert>
    );
  return (
    <main>
      <h1 className="mb-6 text-2xl font-semibold">Editar recurso</h1>
      <ResourceForm
        mode="edit"
        resource={resource.data}
        trailId={resource.data.trailId}
      />
    </main>
  );
}
