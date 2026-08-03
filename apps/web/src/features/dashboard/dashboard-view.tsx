import Link from "next/link";
import type { DashboardResponse } from "@my-learning/contracts";
import { CheckInForm } from "@/features/check-ins/check-in-form";

export function DashboardView({ dashboard }: { dashboard: DashboardResponse }) {
  return (
    <div className="space-y-8">
      <CheckInForm
        currentLocalDate={dashboard.currentLocalDate}
        checkIn={dashboard.checkIn}
      />
      <section>
        <h1 className="text-2xl font-semibold">Dashboard</h1>
        <p className="text-sm text-muted-foreground">
          Streak atual: {dashboard.currentStreak} dias · Melhor streak:{" "}
          {dashboard.bestStreak} dias
        </p>
      </section>
      <section>
        <h2 className="text-xl font-semibold">Trilhas ativas</h2>
        {dashboard.activeTrails.map((trail) => (
          <Link
            className="block py-2"
            href={`/trilhas/${trail.id}`}
            key={trail.id}
          >
            {trail.title} · {trail.progress.percentage}%
          </Link>
        ))}
      </section>
      <section>
        <h2 className="text-xl font-semibold">Continuar estudando</h2>
        {dashboard.continueStudying.map((item) => (
          <Link
            className="block py-2"
            href={`/recursos/${item.resourceId}`}
            key={item.resourceId}
          >
            {item.resourceTitle}
          </Link>
        ))}
      </section>
    </div>
  );
}
