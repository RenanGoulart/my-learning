"use client";

import { useState } from "react";

import { NavigationLinks } from "@/components/layout/sidebar";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { MenuIcon } from "lucide-react";

export function MobileNavigation() {
  const [open, setOpen] = useState(false);

  return (
    <Sheet modal onOpenChange={setOpen} open={open}>
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger
            render={
              <SheetTrigger
                render={
                  <Button
                    aria-label="Abrir navegação"
                    size="icon"
                    variant="outline"
                  >
                    <MenuIcon />
                  </Button>
                }
              />
            }
          />
          <TooltipContent>Abrir navega&#231;&#227;o</TooltipContent>
        </Tooltip>
      </TooltipProvider>
      <SheetContent aria-modal="true" side="left">
        <SheetHeader>
          <SheetTitle>Navegação</SheetTitle>
        </SheetHeader>
        <NavigationLinks onNavigate={() => setOpen(false)} />
      </SheetContent>
    </Sheet>
  );
}
