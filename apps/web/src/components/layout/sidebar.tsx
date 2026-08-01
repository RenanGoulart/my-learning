import Link from "next/link";

const destinations = [
  { href: "/", label: "Dashboard" },
  { href: "/trilhas", label: "Trilhas" },
  { href: "/historico", label: "Historico" },
  { href: "/configuracoes", label: "Configuracoes" },
];

export function NavigationLinks({ onNavigate }: { onNavigate?: () => void }) {
  return (
    <nav aria-label="Navegacao principal" className="flex flex-col gap-1">
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
      <p className="mb-6 text-sm font-semibold">My Learning</p>
      <NavigationLinks />
    </aside>
  );
}
