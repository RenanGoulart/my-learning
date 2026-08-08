import type { ResourceSummary } from "@my-learning/contracts";

import { cn } from "@/lib/utils";

const presentations = {
  NOT_STARTED: {
    label: "Não iniciado",
    className:
      "border-status-not-started-border bg-status-not-started text-status-not-started-foreground",
  },
  IN_PROGRESS: {
    label: "Em andamento",
    className:
      "border-status-in-progress-border bg-status-in-progress text-status-in-progress-foreground",
  },
  COMPLETED: {
    label: "Concluído",
    className:
      "border-status-completed-border bg-status-completed text-status-completed-foreground",
  },
} satisfies Record<
  ResourceSummary["status"],
  { label: string; className: string }
>;

export function StatusBadge({ status }: { status: ResourceSummary["status"] }) {
  const item = getStatusPresentation(status);

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-semibold",
        item.className,
      )}
    >
      <span aria-hidden className="size-1.5 rounded-full bg-current" />
      {item.label}
    </span>
  );
}

export function getStatusPresentation(status: ResourceSummary["status"]) {
  return presentations[status];
}
