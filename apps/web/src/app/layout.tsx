import type { Metadata } from "next";
import type { ReactNode } from "react";

import { AppShell } from "@/components/layout/app-shell";
import { Sonner } from "@/components/ui/sonner";
import { QueryProvider } from "@/lib/query/provider";

import "./globals.css";

export const metadata: Metadata = {
  title: "My Learning",
  description: "Gestao pessoal de estudos.",
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="pt-BR">
      <body>
        <QueryProvider>
          <AppShell>{children}</AppShell>
          <Sonner />
        </QueryProvider>
      </body>
    </html>
  );
}
