import * as React from "react";

import { cn } from "@/lib/utils";

// text-base (16px) y no text-sm: Safari en iPhone agranda la página al
// enfocar un campo con letra de menos de 16px (clase 12).
function Input({ className, type, ...props }: React.ComponentProps<"input">) {
  return (
    <input
      type={type}
      data-slot="input"
      className={cn(
        "flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-base placeholder:text-muted-foreground disabled:cursor-not-allowed disabled:opacity-60 aria-invalid:border-destructive",
        className,
      )}
      {...props}
    />
  );
}

export { Input };
