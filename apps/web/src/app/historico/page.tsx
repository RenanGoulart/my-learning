"use client";

import { Alert, AlertDescription } from "@/components/ui/alert";
import { Skeleton } from "@/components/ui/skeleton";
import { CheckInHistory } from "@/features/check-ins/check-in-history";
import { useCheckInHistory } from "@/features/check-ins/queries";

export default function HistoryPage() {
  const history = useCheckInHistory();
  if (history.isPending)
    return (
      <section aria-label="Carregando histórico" className="space-y-6">
        <Skeleton className="h-32 w-full" />
        <div className="space-y-3">
          {Array.from({ length: 3 }, (_, index) => (
            <Skeleton className="h-20 w-full" key={index} />
          ))}
        </div>
      </section>
    );
  if (history.isError)
    return (
      <Alert variant="destructive">
        <AlertDescription>
          Não foi possível carregar o histórico.
        </AlertDescription>
      </Alert>
    );
  return <CheckInHistory checkIns={history.data} />;
}
