import { ResourceForm } from "@/features/resources/resource-form";
export default async function NewResourcePage({
  params,
}: {
  params: Promise<{ trailId: string }>;
}) {
  const { trailId } = await params;
  return (
    <main>
      <h1 className="mb-6 text-2xl font-semibold">Novo recurso</h1>
      <ResourceForm mode="create" trailId={trailId} />
    </main>
  );
}
