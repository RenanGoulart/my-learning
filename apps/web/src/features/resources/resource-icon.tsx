import type { ResourceSummary } from "@my-learning/contracts";
import type { LucideIcon } from "lucide-react";
import {
  BookOpen,
  BookOpenCheck,
  CircleHelp,
  File,
  GalleryHorizontal,
  GraduationCap,
  ListChecks,
  Newspaper,
  Puzzle,
  Video,
} from "lucide-react";

import { cn } from "@/lib/utils";

const formatIcons = {
  COURSE: GraduationCap,
  DOCUMENTATION: BookOpenCheck,
  ARTICLE: Newspaper,
  VIDEO: Video,
  BOOK: BookOpen,
  OTHER: File,
  QUESTION: CircleHelp,
  PROBLEM: Puzzle,
  PROJECT: ListChecks,
  FLASHCARD: GalleryHorizontal,
} satisfies Record<ResourceSummary["format"], LucideIcon>;

export function ResourceIcon({
  format,
  className,
}: {
  format: ResourceSummary["format"];
  className?: string;
}) {
  const Icon = formatIcons[format];

  return (
    <span
      className={cn(
        "grid size-10 place-items-center rounded-xl bg-primary/10 text-primary",
        className,
      )}
    >
      <Icon aria-hidden className="size-5" />
    </span>
  );
}
