import { TrailEdit } from "@/features/trails/trail-edit";

export default async function EditTrailPage({
  params,
}: {
  params: Promise<{ trailId: string }>;
}) {
  const { trailId } = await params;
  return <TrailEdit trailId={trailId} />;
}
