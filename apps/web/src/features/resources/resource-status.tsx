"use client";
import { useState } from "react";

import type { ResourceSummary } from "@my-learning/contracts";

import { getStatusPresentation } from "@/components/shared/status-badge";
import { cn } from "@/lib/utils";

import { useResourceStatus } from "./queries";
const options = [
  ["NOT_STARTED", "Não iniciado"],
  ["IN_PROGRESS", "Em andamento"],
  ["COMPLETED", "Concluído"],
] as const;
const transitions = {
  NOT_STARTED: ["NOT_STARTED", "IN_PROGRESS"],
  IN_PROGRESS: ["IN_PROGRESS", "COMPLETED"],
  COMPLETED: ["COMPLETED"],
} as const;
export function ResourceStatus({
  resourceId,
  trailId = "",
  status,
}: {
  resourceId: string;
  trailId?: string;
  status: "NOT_STARTED" | "IN_PROGRESS" | "COMPLETED";
}) {
  const [current, setCurrent] = useState(status);
  const [error, setError] = useState(false);
  const mutation = useResourceStatus(resourceId, trailId);
  const selectStatus = (value: ResourceSummary["status"]) => {
    const previous = current;
    setCurrent(value);
    setError(false);
    mutation.mutate(value, {
      onError: () => {
        setCurrent(previous);
        setError(true);
      },
    });
  };

  return (
    <fieldset>
      <legend className="text-sm font-medium">Status</legend>
      <div className="mt-2 flex flex-wrap gap-3">
        {options
          .filter(([value]) =>
            (transitions[current] as readonly string[]).includes(value),
          )
          .map(([value, label]) => {
            const presentation = getStatusPresentation(value);

            return (
              <label
                key={value}
                className={cn(
                  "relative flex cursor-pointer items-center gap-2 rounded-lg border px-3 py-2 text-sm focus-within:border-ring focus-within:ring-3 focus-within:ring-ring/20",
                  current === value && presentation.className,
                )}
              >
                <input
                  checked={current === value}
                  className="absolute inset-0 z-10 size-full cursor-pointer opacity-0"
                  disabled={mutation.isPending}
                  name={`status-${resourceId}`}
                  onChange={() => selectStatus(value)}
                  type="radio"
                />
                <span
                  aria-hidden
                  className="pointer-events-none size-2 rounded-full bg-current"
                />
                {label}
              </label>
            );
          })}
      </div>
      {error ? (
        <p role="alert" className="mt-2 text-sm text-destructive">
          Não foi possível alterar o status.
        </p>
      ) : null}
    </fieldset>
  );
}
