"use client";

import { Alert } from "@/components/ui/alert";
import { Skeleton } from "@/components/ui/skeleton";
import { DashboardView } from "@/features/dashboard/dashboard-view";
import { useDashboard } from "@/features/dashboard/queries";

export default function Page() {
  const dashboard = useDashboard();
  if (dashboard.isPending)
    return (
      <div
        aria-label="Carregando Dashboard"
        className="grid gap-3 md:grid-cols-3"
      >
        <Skeleton className="h-28" />
        <Skeleton className="h-28" />
        <Skeleton className="h-28" />
      </div>
    );
  if (dashboard.isError) {
    return <Alert>Não foi possível carregar o Dashboard.</Alert>;
  }
  return <DashboardView dashboard={dashboard.data} />;
}
