"use client";
import { useState } from "react";
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
  return (
    <fieldset>
      <legend className="text-sm font-medium">Status</legend>
      <div className="mt-2 flex flex-wrap gap-3">
        {options
          .filter(([value]) =>
            (transitions[current] as readonly string[]).includes(value),
          )
          .map(([value, label]) => (
            <label key={value} className="flex items-center gap-1 text-sm">
              <input
                type="radio"
                name={`status-${resourceId}`}
                checked={current === value}
                onChange={() => {
                  const previous = current;
                  setCurrent(value);
                  setError(false);
                  mutation.mutate(value, {
                    onError: () => {
                      setCurrent(previous);
                      setError(true);
                    },
                  });
                }}
              />
              {label}
            </label>
          ))}
      </div>
      {error ? (
        <p role="alert" className="mt-2 text-sm text-destructive">
          Não foi possível alterar o status.
        </p>
      ) : null}
    </fieldset>
  );
}
