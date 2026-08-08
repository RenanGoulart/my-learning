"use client";

import Link from "next/link";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useDashboard } from "@/features/dashboard/queries";

export function ContinueStudyingShortcut() {
  const dashboard = useDashboard();
  const next = dashboard.data?.continueStudying[0];

  if (!next) return null;

  return (
    <Card className="gap-0 rounded-xl border border-primary/15 bg-primary/5 p-3">
      <p className="text-sm font-semibold">Pronto para estudar?</p>
      <p className="mt-1 line-clamp-2 text-xs text-muted-foreground">
        {next.resourceTitle}
      </p>
      <Button
        className="mt-3 w-full"
        nativeButton={false}
        render={
          <Link
            aria-label={`Continuar ${next.resourceTitle}`}
            href={`/recursos/${next.resourceId}`}
          />
        }
        role="link"
        size="sm"
      >
        Continuar estudando
      </Button>
    </Card>
  );
}
