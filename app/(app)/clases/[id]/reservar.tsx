"use client";

/**
 * El formulario de reserva. Es de cliente porque tiene que acordarse de lo
 * que contestó el servidor (los errores) y de si todavía está guardando:
 * eso es estado. Los valores de los campos los sigue guardando el navegador.
 */
import { useActionState } from "react";
import { Campo } from "@/components/campo";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { NativeSelect } from "@/components/ui/native-select";
import { SIN_ENVIAR, type EstadoFormulario } from "@/lib/formularios";
import { reservarAction, type CampoReserva } from "./acciones";

export type OpcionDeFecha = { valor: string; etiqueta: string; agotada: boolean };

export function FormularioReserva({ claseId, opciones }: { claseId: string; opciones: OpcionDeFecha[] }) {
  // .bind completa de antemano la clase: no hay campo oculto que editar.
  const [estado, enviar, pendiente] = useActionState(
    reservarAction.bind(null, claseId),
    SIN_ENVIAR as EstadoFormulario<CampoReserva>,
  );

  const hayLugar = opciones.some((opcion) => !opcion.agotada);
  const primeraLibre = opciones.find((opcion) => !opcion.agotada)?.valor;

  return (
    <form action={enviar} className="flex flex-col gap-4">
      {estado.mensaje ? (
        <Alert variant="destructive">
          <AlertTitle>No pudimos reservar</AlertTitle>
          <AlertDescription>{estado.mensaje}</AlertDescription>
        </Alert>
      ) : null}

      <Campo
        etiqueta="Fecha"
        ayuda={hayLugar ? "Las próximas cuatro fechas de esta clase." : "No quedan lugares en las próximas fechas."}
        errores={estado.errores?.fecha}
      >
        {(control) => (
          <NativeSelect
            {...control}
            name="fecha"
            // key: si el servidor devolvió otro valor, el select se vuelve a
            // pintar con él (el formulario no se vacía al fallar).
            key={estado.valores?.fecha ?? "inicial"}
            defaultValue={estado.valores?.fecha ?? primeraLibre ?? ""}
          >
            {opciones.map((opcion) => (
              <option key={opcion.valor} value={opcion.valor} disabled={opcion.agotada}>
                {opcion.agotada ? `${opcion.etiqueta} (sin cupo)` : opcion.etiqueta}
              </option>
            ))}
          </NativeSelect>
        )}
      </Campo>

      <div className="flex flex-col gap-2 sm:flex-row-reverse sm:justify-start">
        <Button type="submit" disabled={pendiente || !hayLugar} className="w-full sm:w-auto">
          {pendiente ? "Reservando…" : "Reservar"}
        </Button>
      </div>
    </form>
  );
}
