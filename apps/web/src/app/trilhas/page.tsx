import { NewTrailButton, TrailList } from "@/features/trails/trail-list";

export default function TrailsPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold">Trilhas</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Organize seus estudos por objetivo.
          </p>
        </div>
        <NewTrailButton />
      </div>
      <TrailList />
    </div>
  );
}
