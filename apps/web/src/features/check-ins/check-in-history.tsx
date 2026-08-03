"use client";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import type { StudyCheckIn } from "@my-learning/contracts";

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

export function CheckInHistory({ checkIns }: { checkIns: StudyCheckIn[] }) {
  return (
    <section className="space-y-4">
      <h1 className="text-2xl font-semibold">Histórico</h1>
      {checkIns.length === 0 ? (
        <p className="text-sm text-muted-foreground">
          Nenhum check-in registrado.
        </p>
      ) : (
        <ol className="space-y-3">
          {checkIns.map((checkIn) => (
            <li className="border-b pb-3" key={checkIn.id}>
              <p className="font-medium">
                {format(`${checkIn.localDate}T12:00:00`, "dd/MM/yyyy", {
                  locale: ptBR,
                })}
              </p>
              <p className="text-sm text-muted-foreground">
                {formatDuration(checkIn.durationMinutes)}
              </p>
              {checkIn.note ? (
                <p className="mt-1 text-sm">{checkIn.note}</p>
              ) : null}
            </li>
          ))}
        </ol>
      )}
    </section>
  );
}
