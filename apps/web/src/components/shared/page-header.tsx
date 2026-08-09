import type { LucideIcon } from "lucide-react";
import type * as React from "react";

type PageHeaderProps = {
  eyebrow: React.ReactNode;
  title: React.ReactNode;
  description?: React.ReactNode;
  icon: LucideIcon;
  status?: React.ReactNode;
  actions?: React.ReactNode;
  breadcrumbs?: React.ReactNode;
};

export function PageHeader({
  eyebrow,
  title,
  description,
  icon: Icon,
  status,
  actions,
  breadcrumbs,
}: PageHeaderProps) {
  return (
    <header className="rounded-2xl border border-primary/15 bg-gradient-to-r from-primary/10 via-primary/5 to-card p-5 sm:p-6">
      {breadcrumbs ? (
        <nav
          aria-label="Breadcrumb"
          className="mb-4 min-w-0 [overflow-wrap:anywhere] text-sm text-muted-foreground"
        >
          {breadcrumbs}
        </nav>
      ) : null}
      <div className="flex min-w-0 flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="flex min-w-0 items-start gap-3">
          <span className="grid size-10 shrink-0 place-items-center rounded-xl bg-primary/10 text-primary">
            <Icon aria-hidden className="size-5" />
          </span>
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <p className="text-sm font-medium text-primary">{eyebrow}</p>
              {status}
            </div>
            <h1 className="mt-1 [overflow-wrap:anywhere] font-heading text-2xl font-semibold tracking-tight">
              {title}
            </h1>
            {description ? (
              <p className="mt-1 [overflow-wrap:anywhere] text-sm text-muted-foreground">
                {description}
              </p>
            ) : null}
          </div>
        </div>
        {actions ? (
          <div className="flex flex-wrap items-center gap-2">{actions}</div>
        ) : null}
      </div>
    </header>
  );
}
