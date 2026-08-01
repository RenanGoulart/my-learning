"use client";

import { NavigationLinks } from "@/components/layout/sidebar";
import { Sheet } from "@/components/ui/sheet";

export function MobileNavigation() {
  return <Sheet>{(close) => <NavigationLinks onNavigate={close} />}</Sheet>;
}
