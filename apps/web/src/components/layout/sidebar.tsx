"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { History, LayoutDashboard, Map, Settings } from "lucide-react";

import { ContinueStudyingShortcut } from "@/features/dashboard/sidebar-shortcut";

import { ThemeToggle } from "./theme-toggle";

const destinations = [
  { href: "/", label: "Dashboard", icon: LayoutDashboard },
  { href: "/trilhas", label: "Trilhas", icon: Map },
  { href: "/historico", label: "Histórico", icon: History },
  { href: "/configuracoes", label: "Configurações", icon: Settings },
] as const;

const isActive = (pathname: string, href: string) =>
  href === "/" ? pathname === "/" : pathname === href || pathname.startsWith(`${href}/`);

export function NavigationLinks({ onNavigate }: { onNavigate?: () => void }) {
  const pathname = usePathname();

  return (
    <nav aria-label="Navegação principal" className="flex flex-col gap-1">
      {destinations.map((destination) => {
        const active = isActive(pathname, destination.href);
        const Icon = destination.icon;

        return (
          <Link
            aria-current={active ? "page" : undefined}
            className={`flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium hover:bg-muted ${
              active
                ? "bg-sidebar-accent text-sidebar-accent-foreground"
                : ""
            }`}
            href={destination.href}
            key={destination.href}
            {...(onNavigate ? { onClick: onNavigate } : {})}
          >
            <Icon aria-hidden />
            {destination.label}
          </Link>
        );
      })}
    </nav>
  );
}

export function Sidebar() {
  return (
    <aside className="fixed inset-y-0 left-0 hidden w-64 flex-col border-r border-border bg-card p-4 lg:flex">
      <div className="mb-6 flex items-center justify-between">
        <p className="text-sm font-semibold">My Learning</p>
        <ThemeToggle />
      </div>
      <NavigationLinks />
      <div className="mt-auto">
        <ContinueStudyingShortcut />
      </div>
    </aside>
  );
}
