import Link from "next/link";
import { ThemeToggle } from "./theme-toggle";

const destinations = [
  { href: "/", label: "Dashboard" },
  { href: "/trilhas", label: "Trilhas" },
  { href: "/historico", label: "Histórico" },
  { href: "/configuracoes", label: "Configurações" },
];

export function NavigationLinks({ onNavigate }: { onNavigate?: () => void }) {
  return (
    <nav aria-label="Navegação principal" className="flex flex-col gap-1">
      {destinations.map((destination) => (
        <Link
          className="rounded-md px-3 py-2 text-sm font-medium hover:bg-muted"
          href={destination.href}
          key={destination.href}
          {...(onNavigate ? { onClick: onNavigate } : {})}
        >
          {destination.label}
        </Link>
      ))}
    </nav>
  );
}

export function Sidebar() {
  return (
    <aside className="fixed inset-y-0 left-0 hidden w-60 border-r border-border bg-card p-4 lg:block">
      <div className="mb-6 flex items-center justify-between">
        <p className="text-sm font-semibold">My Learning</p>
        <ThemeToggle />
      </div>
      <NavigationLinks />
    </aside>
  );
}
