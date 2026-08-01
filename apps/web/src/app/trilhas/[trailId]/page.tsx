import { TrailDetail } from "@/features/trails/trail-detail";

export default async function TrailPage({
  params,
}: {
  params: Promise<{ trailId: string }>;
}) {
  const { trailId } = await params;
  return <TrailDetail trailId={trailId} />;
}
