"use client";

import type { ReactNode } from "react";
import { useState } from "react";

export function Sheet({
  children,
}: {
  children: (close: () => void) => ReactNode;
}) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <button
        aria-label="Abrir navegacao"
        className="rounded-md border border-border p-2 lg:hidden"
        onClick={() => setOpen(true)}
        type="button"
      >
        Menu
      </button>
      {open ? (
        <div
          aria-label="Navegacao"
          className="fixed inset-0 z-50 bg-background p-4 lg:hidden"
          role="dialog"
        >
          <button
            aria-label="Fechar navegacao"
            className="mb-6 rounded-md border border-border p-2"
            onClick={() => setOpen(false)}
            type="button"
          >
            Fechar
          </button>
          {children(() => setOpen(false))}
        </div>
      ) : null}
    </>
  );
}
