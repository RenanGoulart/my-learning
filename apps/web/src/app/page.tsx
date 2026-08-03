"use client";

import { Alert } from "@/components/ui/alert";
import { DashboardView } from "@/features/dashboard/dashboard-view";
import { useDashboard } from "@/features/dashboard/queries";

export default function Page() {
  const dashboard = useDashboard();
  if (dashboard.isPending) return <p>Carregando...</p>;
  if (dashboard.isError) {
    return <Alert>Não foi possível carregar o Dashboard.</Alert>;
  }
  return <DashboardView dashboard={dashboard.data} />;
}
