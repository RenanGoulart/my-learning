import type { Metadata } from "next";
import type { ReactNode } from "react";

import { AppShell } from "@/components/layout/app-shell";
import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryProvider } from "@/lib/query/provider";

import "./globals.css";
import { Geist } from "next/font/google";
import { cn } from "@/lib/utils";

const geist = Geist({ subsets: ["latin"], variable: "--font-sans" });

export const metadata: Metadata = {
  title: "My Learning",
  description: "Gestão pessoal de estudos.",
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html
      lang="pt-BR"
      suppressHydrationWarning
      className={cn("font-sans", geist.variable)}
    >
      <body>
        <TooltipProvider>
          <QueryProvider>
            <AppShell>{children}</AppShell>
            <Toaster theme="system" />
          </QueryProvider>
        </TooltipProvider>
      </body>
    </html>
  );
}
