import { cn } from "@/lib/utils";

function Progress({
  value,
  label,
  className,
}: {
  value: number;
  label: string;
  className?: string;
}) {
  const normalized = Math.min(100, Math.max(0, value));

  return (
    <div
      aria-label={label}
      aria-valuemax={100}
      aria-valuemin={0}
      aria-valuenow={normalized}
      className={cn("h-2 overflow-hidden rounded-full bg-primary/10", className)}
      role="progressbar"
    >
      <div
        className="h-full rounded-full bg-primary transition-[width]"
        style={{ width: `${normalized}%` }}
      />
    </div>
  );
}

export { Progress };
