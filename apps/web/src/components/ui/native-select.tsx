import * as React from "react";

import { cn } from "@/lib/utils";

function NativeSelect({ className, ...props }: React.ComponentProps<"select">) {
  return (
    <select
      data-slot="native-select"
      className={cn(
        "h-9 w-full appearance-none rounded-lg border border-input bg-background px-3 pr-9 text-sm shadow-xs outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/20 disabled:opacity-50",
        className,
      )}
      {...props}
    />
  );
}

export { NativeSelect };
