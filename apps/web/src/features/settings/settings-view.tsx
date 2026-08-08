"use client";

import type { ChangeEvent } from "react";
import { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Database, Download, Settings, Upload } from "lucide-react";
import { toast } from "sonner";

import { PageHeader } from "@/components/shared/page-header";
import {
  AlertDialog,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogPortal,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { confirmImport, previewImport } from "@/features/import-export/api";

import { getSystemInfo } from "./api";

const countLabels = {
  trails: "trilhas",
  resources: "recursos",
  practiceAnswers: "respostas",
  projectRequirements: "requisitos de projeto",
  studyCheckIns: "check-ins",
} as const;

type BackupPreviewProps = {
  preview: Awaited<ReturnType<typeof previewImport>>;
  onConfirm: () => void;
};

function BackupPreview({ preview, onConfirm }: BackupPreviewProps) {
  return (
    <div className="space-y-3 rounded-lg border p-4">
      <p className="font-medium">Resumo do backup</p>
      <ul className="grid gap-1 text-sm sm:grid-cols-2">
        {Object.entries(preview.counts).map(([key, count]) => (
          <li key={key}>
            {count} {countLabels[key as keyof typeof countLabels]}
          </li>
        ))}
      </ul>
      <p className="text-sm text-destructive">
        Todos os dados atuais serão substituídos.
      </p>
      <Button onClick={onConfirm} type="button" variant="destructive">
        Importar e substituir
      </Button>
    </div>
  );
}

export function SettingsView() {
  const queryClient = useQueryClient();
  const system = useQuery({ queryKey: ["system"], queryFn: getSystemInfo });
  const [file, setFile] = useState<File>();
  const [preview, setPreview] =
    useState<Awaited<ReturnType<typeof previewImport>>>();
  const [error, setError] = useState<string>();
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [isPreviewing, setIsPreviewing] = useState(false);
  const [isImporting, setIsImporting] = useState(false);

  const selectFile = (event: ChangeEvent<HTMLInputElement>) => {
    setFile(event.target.files?.[0]);
    setPreview(undefined);
    setError(undefined);
  };
  const validate = async () => {
    if (!file) {
      setError("Selecione um arquivo JSON para validar.");
      return;
    }
    setError(undefined);
    setIsPreviewing(true);
    try {
      setPreview(await previewImport(file));
    } catch (cause) {
      setError(
        cause instanceof Error
          ? cause.message
          : "Não foi possível validar o arquivo.",
      );
    } finally {
      setIsPreviewing(false);
    }
  };
  const restore = async () => {
    if (!file) return;
    setError(undefined);
    setIsImporting(true);
    try {
      await confirmImport(file);
      await queryClient.invalidateQueries();
      setConfirmOpen(false);
      setFile(undefined);
      setPreview(undefined);
      toast.success("Backup restaurado.");
    } catch (cause) {
      setError(
        cause instanceof Error
          ? cause.message
          : "Não foi possível restaurar o backup.",
      );
    } finally {
      setIsImporting(false);
    }
  };
  const download = () => {
    window.location.assign(
      `${process.env["NEXT_PUBLIC_API_URL"]}/api/v1/import-export/export`,
    );
  };

  return (
    <div className="space-y-6">
      <PageHeader
        description="Dados e backup da instalação local."
        eyebrow="Preferências"
        icon={Settings}
        title="Configurações"
      />
      {error ? (
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      ) : null}
      <div className="grid gap-4 xl:grid-cols-2">
        <Card aria-labelledby="storage-title">
          <CardHeader>
            <Database aria-hidden className="size-5 text-primary" />
            <CardTitle id="storage-title">Armazenamento local</CardTitle>
            <CardDescription>
              Informações da instância em execução.
            </CardDescription>
          </CardHeader>
          <CardContent>
            {system.isPending ? <Skeleton className="h-20" /> : null}
            {system.isError ? (
              <Alert variant="destructive">
                <AlertDescription>
                  Não foi possível carregar as configurações locais.
                </AlertDescription>
              </Alert>
            ) : null}
            {system.data ? (
              <dl className="grid gap-2 text-sm sm:grid-cols-[10rem_1fr]">
                <dt className="text-muted-foreground">Banco SQLite</dt>
                <dd className="break-all font-mono">
                  {system.data.databasePath}
                </dd>
                <dt className="text-muted-foreground">Fuso horário</dt>
                <dd>{system.data.timeZone}</dd>
                <dt className="text-muted-foreground">Formato do backup</dt>
                <dd>{system.data.snapshotFormatVersion}</dd>
              </dl>
            ) : null}
          </CardContent>
        </Card>
        <Card aria-labelledby="export-title">
          <CardHeader>
            <Download aria-hidden className="size-5 text-primary" />
            <CardTitle id="export-title">Exportar backup</CardTitle>
            <CardDescription>
              Exporte todos os dados em um arquivo JSON legível.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button onClick={download} type="button">
              <Download aria-hidden data-icon="inline-start" />
              Exportar JSON
            </Button>
          </CardContent>
        </Card>
        <Card className="xl:col-span-2" aria-labelledby="restore-title">
          <CardHeader>
            <Upload aria-hidden className="size-5 text-primary" />
            <CardTitle id="restore-title">Restaurar backup</CardTitle>
            <CardDescription>
              Valide o arquivo antes de substituir os dados locais.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <label className="block text-sm font-medium" htmlFor="backup-file">
              Arquivo JSON
            </label>
            <Input
              accept="application/json,.json"
              id="backup-file"
              onChange={selectFile}
              type="file"
            />
            <Button
              disabled={!file || isPreviewing}
              onClick={() => void validate()}
              type="button"
              variant="outline"
            >
              <Upload aria-hidden data-icon="inline-start" />
              {isPreviewing ? "Validando..." : "Validar arquivo"}
            </Button>
            {preview ? (
              <BackupPreview
                onConfirm={() => setConfirmOpen(true)}
                preview={preview}
              />
            ) : null}
          </CardContent>
        </Card>
      </div>
      <AlertDialog onOpenChange={setConfirmOpen} open={confirmOpen}>
        <AlertDialogPortal>
          <AlertDialogContent>
            <AlertDialogTitle>Substituir os dados locais?</AlertDialogTitle>
            <AlertDialogDescription>
              Trilhas, recursos, respostas, requisitos e check-ins atuais serão
              substituídos pelo backup validado.
            </AlertDialogDescription>
            <div className="mt-5 flex justify-end gap-2">
              <AlertDialogCancel
                render={<Button type="button" variant="outline" />}
              >
                Cancelar
              </AlertDialogCancel>
              <Button
                disabled={isImporting}
                onClick={() => void restore()}
                type="button"
                variant="destructive"
              >
                {isImporting ? "Importando..." : "Importar e substituir"}
              </Button>
            </div>
          </AlertDialogContent>
        </AlertDialogPortal>
      </AlertDialog>
    </div>
  );
}
