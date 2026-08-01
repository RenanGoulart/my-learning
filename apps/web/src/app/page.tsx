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
          Visao geral dos seus estudos.
        </p>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>Servico local</CardTitle>
        </CardHeader>
        <CardContent>
          {health.isPending ? (
            <p className="text-sm text-muted-foreground">
              Verificando conexao...
            </p>
          ) : null}
          {health.isError ? (
            <Alert>O servico local nao esta disponivel.</Alert>
          ) : null}
          {health.data ? (
            <p className="text-sm">Conectado. Versao {health.data.version}.</p>
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
          <CardTitle>Proximos estudos</CardTitle>
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
