import { TrailForm } from "@/features/trails/trail-form";

export default function NewTrailPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold">Nova trilha</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Defina o foco do seu estudo.
        </p>
      </div>
      <TrailForm mode="create" />
    </div>
  );
}
