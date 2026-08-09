import { Map } from "lucide-react";

import { PageHeader } from "@/components/shared/page-header";
import { NewTrailButton, TrailList } from "@/features/trails/trail-list";

export default function TrailsPage() {
  return (
    <div className="space-y-8">
      <PageHeader
        actions={<NewTrailButton />}
        description="Organize seus estudos por objetivo."
        eyebrow="Planejamento"
        icon={Map}
        title="Trilhas"
      />
      <TrailList />
    </div>
  );
}
