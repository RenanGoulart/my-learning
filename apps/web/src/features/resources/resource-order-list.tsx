"use client";
import { ArrowDown, ArrowUp } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { useResourceOrder } from "./queries";
type Item = { id: string; title: string; position: number };
export function ResourceOrderList({
  trailId,
  resources,
}: {
  trailId: string;
  resources: Item[];
}) {
  const mutation = useResourceOrder(trailId);
  const move = (index: number, direction: -1 | 1) => {
    const next = [...resources];
    const target = index + direction;
    if (!next[index] || !next[target]) return;
    [next[index], next[target]] = [next[target], next[index]];
    mutation.mutate(next.map((resource) => resource.id));
  };
  return (
    <TooltipProvider>
      <ol className="divide-y divide-border border-y border-border">
        {resources.map((resource, index) => (
          <li
            className="flex min-h-12 items-center justify-between gap-3 py-2"
            key={resource.id}
          >
            <span>{resource.title}</span>
            <span className="flex gap-1">
              <MoveButton
                disabled={index === 0}
                label={`Mover ${resource.title} para cima`}
                onClick={() => move(index, -1)}
              >
                <ArrowUp />
              </MoveButton>
              <MoveButton
                disabled={index === resources.length - 1}
                label={`Mover ${resource.title} para baixo`}
                onClick={() => move(index, 1)}
              >
                <ArrowDown />
              </MoveButton>
            </span>
          </li>
        ))}
      </ol>
    </TooltipProvider>
  );
}
function MoveButton({
  children,
  disabled,
  label,
  onClick,
}: {
  children: React.ReactNode;
  disabled: boolean;
  label: string;
  onClick: () => void;
}) {
  return (
    <Tooltip>
      <TooltipTrigger
        render={
          <Button
            aria-label={label}
            disabled={disabled}
            onClick={onClick}
            size="icon-xs"
            type="button"
            variant="ghost"
          />
        }
      >
        {children}
      </TooltipTrigger>
      <TooltipContent>{label}</TooltipContent>
    </Tooltip>
  );
}
