import type { ReactNode } from "react";

import { MobileNavigation } from "@/components/layout/mobile-navigation";
import { Sidebar } from "@/components/layout/sidebar";
import { ThemeToggle } from "@/components/layout/theme-toggle";

export function AppShell({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <Sidebar />
      <header className="flex h-14 items-center border-b border-border px-4 lg:hidden">
        <MobileNavigation />
        <span className="ml-3 text-sm font-semibold">My Learning</span>
        <div className="ml-auto">
          <ThemeToggle />
        </div>
      </header>
      <main className="mx-auto max-w-6xl p-4 lg:ml-60 lg:p-8">{children}</main>
    </div>
  );
}
