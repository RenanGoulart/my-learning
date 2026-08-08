"use client";
import {
  DndContext,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from "@dnd-kit/core";
import {
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { ArrowDown, ArrowUp, GripVertical } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import type { ResourceSummary } from "@my-learning/contracts";
import { StatusBadge } from "@/components/shared/status-badge";
import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { ResourceIcon } from "./resource-icon";
import { useResourceOrder } from "./queries";

type Item = Pick<
  ResourceSummary,
  "id" | "title" | "position" | "category" | "format" | "status"
>;
export function ResourceOrderList({
  trailId,
  resources,
}: {
  trailId: string;
  resources: Item[];
}) {
  const mutation = useResourceOrder(trailId);
  const [error, setError] = useState(false);
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    }),
  );
  const move = (index: number, direction: -1 | 1) => {
    if (mutation.isPending) return;
    const next = [...resources];
    const target = index + direction;
    if (!next[index] || !next[target]) return;
    [next[index], next[target]] = [next[target], next[index]];
    setError(false);
    mutation.mutate(
      next.map((resource) => resource.id),
      {
        onError: () => setError(true),
      },
    );
  };
  const onDragEnd = (event: DragEndEvent) => {
    if (mutation.isPending) return;
    if (!event.over || event.active.id === event.over.id) return;
    const ids = resources.map((resource) => resource.id);
    const from = ids.indexOf(String(event.active.id));
    const to = ids.indexOf(String(event.over.id));
    if (from < 0 || to < 0) return;
    const [moved] = ids.splice(from, 1);
    if (!moved) return;
    ids.splice(to, 0, moved);
    setError(false);
    mutation.mutate(ids, { onError: () => setError(true) });
  };
  return (
    <TooltipProvider>
      <DndContext onDragEnd={onDragEnd} sensors={sensors}>
        <SortableContext
          items={resources.map((resource) => resource.id)}
          strategy={verticalListSortingStrategy}
        >
          <ol className="divide-y divide-border border-y border-border">
            {resources.map((resource, index) => (
              <SortableResource
                key={resource.id}
                onMove={move}
                resource={resource}
                index={index}
                isFirst={index === 0}
                isLast={index === resources.length - 1}
                disabled={mutation.isPending}
              />
            ))}
          </ol>
        </SortableContext>
      </DndContext>
      {error ? (
        <p className="mt-2 text-sm text-destructive" role="alert">
          Não foi possível alterar a ordem dos recursos.
        </p>
      ) : null}
    </TooltipProvider>
  );
}
function SortableResource({
  disabled,
  index,
  isFirst,
  isLast,
  onMove,
  resource,
}: {
  disabled: boolean;
  index: number;
  isFirst: boolean;
  isLast: boolean;
  onMove: (index: number, direction: -1 | 1) => void;
  resource: Item;
}) {
  const sortable = useSortable({ id: resource.id, disabled });
  return (
    <li
      className="flex min-h-12 items-center justify-between gap-3 py-2"
      ref={sortable.setNodeRef}
      style={{
        opacity: sortable.isDragging ? 0.5 : undefined,
        transform: CSS.Transform.toString(sortable.transform),
        transition: sortable.transition,
      }}
    >
      <div className="flex min-w-0 items-center gap-2">
        <Button
          aria-label={`Arrastar ${resource.title}`}
          disabled={disabled}
          size="icon-xs"
          type="button"
          variant="ghost"
          {...sortable.attributes}
          {...sortable.listeners}
        >
          <GripVertical />
        </Button>
        <ResourceIcon
          className="size-8 rounded-lg [&_svg]:size-4"
          format={resource.format}
        />
        <div className="min-w-0">
          <Link
            className="truncate font-medium underline-offset-4 hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            href={`/recursos/${resource.id}`}
          >
            {resource.title}
          </Link>
          <p className="text-xs text-muted-foreground">
            {resource.category === "MATERIAL" ? "Material" : "Prática"} ·{" "}
            {resource.format}
          </p>
        </div>
      </div>
      <div className="flex shrink-0 items-center gap-2">
        <StatusBadge status={resource.status} />
        <span className="flex gap-1">
          <MoveButton
            disabled={disabled || isFirst}
            label={`Mover ${resource.title} para cima`}
            onClick={() => onMove(index, -1)}
          >
            <ArrowUp />
          </MoveButton>
          <MoveButton
            disabled={disabled || isLast}
            label={`Mover ${resource.title} para baixo`}
            onClick={() => onMove(index, 1)}
          >
            <ArrowDown />
          </MoveButton>
        </span>
      </div>
    </li>
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
