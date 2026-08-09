import { Map } from "lucide-react";

import { PageHeader } from "@/components/shared/page-header";
import { Card, CardContent } from "@/components/ui/card";
import { TrailForm } from "@/features/trails/trail-form";

export default function NewTrailPage() {
  return (
    <div className="space-y-6">
      <PageHeader
        description="Defina o foco do seu estudo."
        eyebrow="Trilhas"
        icon={Map}
        title="Nova trilha"
      />
      <Card>
        <CardContent className="p-5 sm:p-6">
          <TrailForm mode="create" />
        </CardContent>
      </Card>
    </div>
  );
}
