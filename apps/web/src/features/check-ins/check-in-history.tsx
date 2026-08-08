"use client";

import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { CalendarDays, Clock, History } from "lucide-react";
import type { StudyCheckIn } from "@my-learning/contracts";

import { EmptyState } from "@/components/shared/empty-state";
import { PageHeader } from "@/components/shared/page-header";
import { Card, CardContent } from "@/components/ui/card";

function formatDuration(minutes: number | null) {
  if (minutes === null) return "Sem duração";
  const hours = Math.floor(minutes / 60);
  const remainder = minutes % 60;
  return hours === 0
    ? `${remainder}min`
    : remainder === 0
      ? `${hours}h`
      : `${hours}h ${remainder}min`;
}

function formatLocalDate(localDate: string) {
  return format(`${localDate}T12:00:00`, "dd/MM/yyyy", { locale: ptBR });
}

export function CheckInHistory({ checkIns }: { checkIns: StudyCheckIn[] }) {
  return (
    <section className="space-y-6">
      <PageHeader
        description="Revise sua consistência diária de estudos."
        eyebrow="Atividade"
        icon={History}
        title="Histórico"
      />
      {checkIns.length === 0 ? (
        <EmptyState
          description="Seus registros diários aparecerão aqui."
          icon={CalendarDays}
          title="Nenhum check-in registrado"
        />
      ) : (
        <ol className="space-y-3">
          {checkIns.map((checkIn) => (
            <li key={checkIn.id}>
              <Card>
                <CardContent className="flex gap-3 p-4">
                  <CalendarDays aria-hidden className="size-5 text-primary" />
                  <div>
                    <p className="font-medium">
                      {formatLocalDate(checkIn.localDate)}
                    </p>
                    <p className="flex items-center gap-1 text-sm text-muted-foreground">
                      <Clock aria-hidden className="size-4" />
                      {formatDuration(checkIn.durationMinutes)}
                    </p>
                    {checkIn.note ? (
                      <p className="mt-2 text-sm">{checkIn.note}</p>
                    ) : null}
                  </div>
                </CardContent>
              </Card>
            </li>
          ))}
        </ol>
      )}
    </section>
  );
}
