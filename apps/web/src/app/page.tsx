"use client";

import { healthResponseSchema } from "@my-learning/contracts";
import { useQuery } from "@tanstack/react-query";

import { Alert } from "@/components/ui/alert";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { apiRequest } from "@/lib/api/client";

export default function Page() {
  const health = useQuery({
    queryKey: ["health"],
    queryFn: () => apiRequest("/api/v1/health", healthResponseSchema),
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold">Dashboard</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Visão geral dos seus estudos.
        </p>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>Serviço local</CardTitle>
        </CardHeader>
        <CardContent>
          {health.isPending ? (
            <p className="text-sm text-muted-foreground">
              Verificando conexão...
            </p>
          ) : null}
          {health.isError ? (
            <Alert>O serviço local não está disponível.</Alert>
          ) : null}
          {health.data ? (
            <p className="text-sm">Conectado. Versão {health.data.version}.</p>
          ) : null}
        </CardContent>
      </Card>
      <Card>
        <CardHeader>
          <CardTitle>Atividade recente</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            Nenhuma atividade registrada.
          </p>
        </CardContent>
      </Card>
      <Card>
        <CardHeader>
          <CardTitle>Próximos estudos</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            Nenhum estudo planejado.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
