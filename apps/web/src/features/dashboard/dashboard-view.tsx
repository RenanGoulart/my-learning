import Link from "next/link";
import type { DashboardResponse } from "@my-learning/contracts";
import { BookOpen, Flame, Map, Sparkles, Trophy } from "lucide-react";

import { EmptyState } from "@/components/shared/empty-state";
import { PageHeader } from "@/components/shared/page-header";
import { StatCard } from "@/components/shared/stat-card";
import { StatusBadge } from "@/components/shared/status-badge";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { CheckInForm } from "@/features/check-ins/check-in-form";
import { ResourceIcon } from "@/features/resources/resource-icon";
import { NewTrailButton } from "@/features/trails/trail-list";

export function DashboardView({ dashboard }: { dashboard: DashboardResponse }) {
  return (
    <div className="space-y-8">
      <PageHeader
        actions={<NewTrailButton />}
        description="Acompanhe sua consistência e retome o próximo conteúdo."
        eyebrow="Visão geral"
        icon={Sparkles}
        title="Seu aprendizado, em movimento."
      />
      <section aria-label="Resumo" className="grid gap-3 md:grid-cols-3">
        <StatCard
          icon={Flame}
          label="Streak atual"
          value={`${dashboard.currentStreak} dias`}
        />
        <StatCard
          icon={Trophy}
          label="Melhor streak"
          tone="info"
          value={`${dashboard.bestStreak} dias`}
        />
        <StatCard
          icon={Map}
          label="Trilhas ativas"
          tone="success"
          value={String(dashboard.activeTrails.length)}
        />
      </section>
      <div className="grid gap-4 xl:grid-cols-[minmax(0,1.5fr)_minmax(20rem,.8fr)]">
        <ContinueStudyingCard items={dashboard.continueStudying} />
        <CheckInForm
          currentLocalDate={dashboard.currentLocalDate}
          checkIn={dashboard.checkIn}
        />
      </div>
      <ActiveTrailsCard trails={dashboard.activeTrails} />
    </div>
  );
}

function ContinueStudyingCard({
  items,
}: {
  items: DashboardResponse["continueStudying"];
}) {
  return (
    <Card>
      <CardHeader>
        <h2 className="font-heading text-lg font-semibold">
          Continuar estudando
        </h2>
      </CardHeader>
      <CardContent>
        {items.length === 0 ? (
          <EmptyState
            description="Adicione recursos às suas trilhas para retomar o próximo conteúdo por aqui."
            icon={BookOpen}
            title="Nada para continuar agora"
          />
        ) : (
          <ul className="space-y-2">
            {items.map((item) => (
              <li key={item.resourceId}>
                <Link
                  className="flex items-center gap-3 rounded-lg p-2 transition-colors hover:bg-muted"
                  href={`/recursos/${item.resourceId}`}
                >
                  <ResourceIcon format={item.format} />
                  <div className="min-w-0 flex-1">
                    <p className="truncate font-medium">{item.resourceTitle}</p>
                    <p className="text-sm text-muted-foreground">
                      {item.trailTitle}
                    </p>
                  </div>
                  <StatusBadge status={item.status} />
                </Link>
              </li>
            ))}
          </ul>
        )}
      </CardContent>
    </Card>
  );
}

function ActiveTrailsCard({
  trails,
}: {
  trails: DashboardResponse["activeTrails"];
}) {
  return (
    <Card>
      <CardHeader>
        <h2 className="font-heading text-lg font-semibold">Trilhas ativas</h2>
      </CardHeader>
      <CardContent>
        {trails.length === 0 ? (
          <EmptyState
            description="Crie uma trilha para organizar seus estudos e acompanhar o progresso."
            icon={Map}
            title="Nenhuma trilha ativa"
          />
        ) : (
          <ul className="grid gap-3 md:grid-cols-2">
            {trails.map((trail) => (
              <li key={trail.id}>
                <Link
                  className="block rounded-lg border border-border p-4 transition-colors hover:bg-muted"
                  href={`/trilhas/${trail.id}`}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="font-medium">{trail.title}</p>
                      <div className="mt-2">
                        <StatusBadge
                          status={
                            trail.isComplete
                              ? "COMPLETED"
                              : trail.isActive
                                ? "IN_PROGRESS"
                                : "NOT_STARTED"
                          }
                        />
                      </div>
                    </div>
                    <span className="text-sm font-medium tabular-nums">
                      {trail.progress.percentage}%
                    </span>
                  </div>
                  <Progress
                    className="mt-3"
                    label={`Progresso de ${trail.title}`}
                    value={trail.progress.percentage}
                  />
                </Link>
              </li>
            ))}
          </ul>
        )}
      </CardContent>
    </Card>
  );
}
