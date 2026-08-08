import { BookOpen } from "lucide-react";

import { PageHeader } from "@/components/shared/page-header";
import { Card, CardContent } from "@/components/ui/card";
import { ResourceForm } from "@/features/resources/resource-form";

export default async function NewResourcePage({
  params,
}: {
  params: Promise<{ trailId: string }>;
}) {
  const { trailId } = await params;
  return (
    <div className="space-y-6">
      <PageHeader
        description="Adicione um recurso à sua trilha de estudos."
        eyebrow="Recursos"
        icon={BookOpen}
        title="Novo recurso"
      />
      <Card>
        <CardContent className="p-5 sm:p-6">
          <ResourceForm mode="create" trailId={trailId} />
        </CardContent>
      </Card>
    </div>
  );
}
