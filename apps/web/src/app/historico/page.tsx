"use client";
import { CheckInHistory } from "@/features/check-ins/check-in-history";
import { useCheckInHistory } from "@/features/check-ins/queries";

export default function HistoryPage() {
  const history = useCheckInHistory();
  if (history.isPending) return <p>Carregando...</p>;
  if (history.isError)
    return <p role="alert">Não foi possível carregar o histórico.</p>;
  return <CheckInHistory checkIns={history.data} />;
}
