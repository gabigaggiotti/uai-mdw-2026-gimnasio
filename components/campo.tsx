"use client";

/**
 * Un campo de formulario, conectado una sola vez y bien (clase 12):
 *
 *   label  ──htmlFor/id──────────>  control
 *   control ──aria-describedby──>  la ayuda y el error
 *   control ──aria-invalid──────>  "este campo está mal"
 *
 * Es de cliente por useId(): los ids salen de React y no del nombre del
 * campo, para que dos formularios en la misma página no repitan ids.
 */
import { useId, type ReactNode } from "react";
import { Label } from "@/components/ui/label";

export type PropsDeControl = {
  id: string;
  "aria-describedby"?: string;
  "aria-invalid"?: true;
};

export function Campo({
  etiqueta,
  ayuda,
  errores,
  children,
}: {
  etiqueta: string;
  ayuda?: string;
  errores?: string[];
  children: (control: PropsDeControl) => ReactNode;
}) {
  const id = useId();
  const idAyuda = `${id}-ayuda`;
  const idError = `${id}-error`;
  const hayError = Boolean(errores && errores.length > 0);

  const describedBy = [ayuda ? idAyuda : null, hayError ? idError : null].filter(Boolean).join(" ");

  return (
    <div className="flex flex-col gap-1.5">
      <Label htmlFor={id}>{etiqueta}</Label>
      {children({
        id,
        "aria-describedby": describedBy || undefined,
        "aria-invalid": hayError ? true : undefined,
      })}
      {ayuda ? (
        <p id={idAyuda} className="text-sm text-muted-foreground">
          {ayuda}
        </p>
      ) : null}
      {hayError ? (
        <p id={idError} className="text-sm font-medium text-destructive">
          {errores?.join(". ")}
        </p>
      ) : null}
    </div>
  );
}
