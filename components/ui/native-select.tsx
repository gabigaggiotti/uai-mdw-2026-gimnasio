import * as React from "react";

import { cn } from "@/lib/utils";

// Un <select> nativo y no un desplegable propio: en el teléfono abre el
// selector del sistema operativo, que ya es accesible (clase 11).
function NativeSelect({ className, ...props }: React.ComponentProps<"select">) {
  return (
    <select
      data-slot="native-select"
      className={cn(
        "flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-base disabled:cursor-not-allowed disabled:opacity-60 aria-invalid:border-destructive",
        className,
      )}
      {...props}
    />
  );
}

export { NativeSelect };
