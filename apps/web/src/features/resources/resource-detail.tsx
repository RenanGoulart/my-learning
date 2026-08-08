"use client";

import Link from "next/link";
import { BookOpen } from "lucide-react";

import { PageHeader } from "@/components/shared/page-header";
import { StatusBadge } from "@/components/shared/status-badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { PracticeAnswer } from "@/features/practices/practice-answer";

import { DeleteResourceButton } from "./delete-resource-button";
import { ResourceConversion } from "./resource-conversion";
import { ResourceIcon } from "./resource-icon";
import { useResource } from "./queries";
import { ResourceStatus } from "./resource-status";

const formatLabels = {
  COURSE: "Curso",
  DOCUMENTATION: "Documentação",
  ARTICLE: "Artigo",
  VIDEO: "Vídeo",
  BOOK: "Livro",
  OTHER: "Outro",
  QUESTION: "Questão",
  PROBLEM: "Problema",
  PROJECT: "Projeto",
  FLASHCARD: "Flashcard",
} as const;

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
    <div className="space-y-6">
      <PageHeader
        actions={
          <>
            <Button
              nativeButton={false}
              render={<Link href={`/recursos/${item.id}/editar`} />}
              variant="outline"
            >
              Editar
            </Button>
            <DeleteResourceButton resource={item} />
          </>
        }
        description={item.description ?? "Sem descrição"}
        eyebrow={
          <span className="inline-flex items-center gap-2">
            <ResourceIcon className="size-5 rounded-md" format={item.format} />
            {item.category === "MATERIAL" ? "Material" : "Prática"} ·{" "}
            {formatLabels[item.format]}
          </span>
        }
        icon={BookOpen}
        status={<StatusBadge status={item.status} />}
        title={item.title}
      />

      <Card>
        <CardHeader>
          <CardTitle>Status</CardTitle>
        </CardHeader>
        <CardContent>
          <ResourceStatus
            resourceId={item.id}
            status={item.status}
            trailId={item.trailId}
          />
        </CardContent>
      </Card>

      {item.url ? (
        <Card>
          <CardHeader>
            <CardTitle>Link</CardTitle>
          </CardHeader>
          <CardContent>
            <a
              className="text-primary underline underline-offset-4"
              href={item.url}
              rel="noopener noreferrer"
              target="_blank"
            >
              Abrir material
            </a>
          </CardContent>
        </Card>
      ) : null}

      {item.prompt ? (
        <Card>
          <CardHeader>
            <CardTitle>Enunciado</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="whitespace-pre-wrap">{item.prompt}</p>
          </CardContent>
        </Card>
      ) : null}

      {item.format === "QUESTION" || item.format === "PROBLEM" ? (
        <Card>
          <CardContent className="p-5 sm:p-6">
            <PracticeAnswer resource={item} />
          </CardContent>
        </Card>
      ) : null}

      {item.format === "PROJECT" ? (
        <Card>
          <CardHeader>
            <CardTitle>Requisitos</CardTitle>
          </CardHeader>
          <CardContent>
            <ol className="list-decimal space-y-1 pl-5">
              {item.projectRequirements.map((requirement) => (
                <li key={requirement.id}>{requirement.text}</li>
              ))}
            </ol>
          </CardContent>
        </Card>
      ) : null}

      {item.format === "FLASHCARD" ? (
        <Card>
          <CardHeader>
            <CardTitle>Flashcard</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <p>
              <strong>Frente:</strong> {item.flashcardFront}
            </p>
            <p>
              <strong>Verso:</strong> {item.flashcardBack}
            </p>
          </CardContent>
        </Card>
      ) : null}

      <Card>
        <CardContent className="p-5 sm:p-6">
          <ResourceConversion resourceId={item.id} />
        </CardContent>
      </Card>
    </div>
  );
}
