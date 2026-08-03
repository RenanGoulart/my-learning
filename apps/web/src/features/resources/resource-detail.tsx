"use client";
import Link from "next/link";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { DeleteResourceButton } from "./delete-resource-button";
import { ResourceConversion } from "./resource-conversion";
import { useResource } from "./queries";
import { ResourceStatus } from "./resource-status";
export function ResourceDetail({ resourceId }: { resourceId: string }) {
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
  const item = resource.data;
  return (
    <div className="space-y-8">
      <header className="flex flex-wrap justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold">{item.title}</h1>
          <p className="text-sm text-muted-foreground">
            {item.description ?? "Sem descrição"}
          </p>
        </div>
        <div className="flex gap-2">
          <Button
            nativeButton={false}
            render={<Link href={`/recursos/${item.id}/editar`} />}
            variant="outline"
          >
            Editar
          </Button>
          <DeleteResourceButton resource={item} />
        </div>
      </header>
      <ResourceStatus
        resourceId={item.id}
        status={item.status}
        trailId={item.trailId}
      />
      {item.url ? (
        <section>
          <h2 className="text-lg font-medium">Link</h2>
          <a
            className="text-primary underline"
            href={item.url}
            rel="noopener noreferrer"
            target="_blank"
          >
            Abrir material
          </a>
        </section>
      ) : null}
      {item.prompt ? (
        <section>
          <h2 className="text-lg font-medium">Enunciado</h2>
          <p className="whitespace-pre-wrap">{item.prompt}</p>
        </section>
      ) : null}
      {item.format === "PROJECT" ? (
        <section>
          <h2 className="text-lg font-medium">Requisitos</h2>
          <ol className="list-decimal pl-5">
            {item.projectRequirements.map((requirement) => (
              <li key={requirement.id}>{requirement.text}</li>
            ))}
          </ol>
        </section>
      ) : null}
      {item.format === "FLASHCARD" ? (
        <section>
          <h2 className="text-lg font-medium">Flashcard</h2>
          <p>
            <strong>Frente:</strong> {item.flashcardFront}
          </p>
          <p>
            <strong>Verso:</strong> {item.flashcardBack}
          </p>
        </section>
      ) : null}
      <ResourceConversion resourceId={item.id} />
    </div>
  );
}
