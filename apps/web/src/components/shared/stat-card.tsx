import type { LucideIcon } from "lucide-react";
import type * as React from "react";

import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";

type StatCardProps = {
  icon: LucideIcon;
  label: React.ReactNode;
  value: React.ReactNode;
  tone?: "primary" | "info" | "success";
};

export function StatCard({
  icon: Icon,
  label,
  value,
  tone = "primary",
}: StatCardProps) {
  const tones = {
    primary: "bg-primary/10 text-primary",
    info: "bg-sky-100 text-sky-700 dark:bg-sky-950 dark:text-sky-300",
    success:
      "bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300",
  };

  return (
    <Card>
      <CardContent className="flex items-center gap-3 p-4">
        <span
          className={cn(
            "grid size-10 place-items-center rounded-xl",
            tones[tone],
          )}
        >
          <Icon aria-hidden className="size-5" />
        </span>
        <div>
          <p className="text-xs text-muted-foreground">{label}</p>
          <p className="mt-1 text-xl font-semibold tracking-tight">{value}</p>
        </div>
      </CardContent>
    </Card>
  );
}
