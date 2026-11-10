"use client";

/**
 * Un formulario que es solo un botón. Es de cliente igual: tiene que
 * acordarse de si está cancelando (para no mandar dos veces) y del rechazo
 * que devolvió el servidor, que se muestra arriba del botón.
 */
import { useActionState } from "react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { SIN_ENVIAR } from "@/lib/formularios";
import { cancelarAction } from "./acciones";

export function CancelarReserva({ reservaId }: { reservaId: string }) {
  const [estado, enviar, pendiente] = useActionState(cancelarAction.bind(null, reservaId), SIN_ENVIAR);

  return (
    <form action={enviar} className="flex flex-col gap-3">
      {estado.mensaje ? (
        <Alert variant="destructive">
          <AlertTitle>No pudimos cancelar</AlertTitle>
          <AlertDescription>{estado.mensaje}</AlertDescription>
        </Alert>
      ) : null}
      <div>
        <Button type="submit" variant="destructive" disabled={pendiente} className="w-full sm:w-auto">
          {pendiente ? "Cancelando…" : "Cancelar reserva"}
        </Button>
      </div>
    </form>
  );
}
