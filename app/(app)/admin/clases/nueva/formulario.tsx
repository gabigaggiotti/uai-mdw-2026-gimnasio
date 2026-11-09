"use client";

import { useActionState } from "react";
import { Campo } from "@/components/campo";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { NativeSelect } from "@/components/ui/native-select";
import { SIN_ENVIAR, type EstadoFormulario } from "@/lib/formularios";
import { crearClaseAction, type CampoClase } from "./acciones";

type Opcion = { valor: string; etiqueta: string };

export function FormularioClase({ profesores, dias }: { profesores: Opcion[]; dias: Opcion[] }) {
  const [estado, enviar, pendiente] = useActionState(
    crearClaseAction,
    SIN_ENVIAR as EstadoFormulario<CampoClase>,
  );
  const valores = estado.valores ?? {};
  const errores = estado.errores ?? {};

  return (
    // key: cuando el servidor devuelve errores, el formulario se vuelve a
    // pintar con lo que la persona había escrito (no se vacía al fallar).
    <form key={JSON.stringify(valores)} action={enviar} className="flex flex-col gap-4">
      <Campo etiqueta="Nombre" errores={errores.nombre}>
        {(control) => <Input {...control} name="nombre" defaultValue={valores.nombre} autoComplete="off" />}
      </Campo>

      <Campo etiqueta="Disciplina" ayuda="Por ejemplo: Cardio, Fuerza, Yoga." errores={errores.disciplina}>
        {(control) => <Input {...control} name="disciplina" defaultValue={valores.disciplina} autoComplete="off" />}
      </Campo>

      <Campo etiqueta="Profesor" errores={errores.profesorId}>
        {(control) => (
          <NativeSelect {...control} name="profesorId" defaultValue={valores.profesorId ?? profesores[0]?.valor}>
            {profesores.map((p) => (
              <option key={p.valor} value={p.valor}>
                {p.etiqueta}
              </option>
            ))}
          </NativeSelect>
        )}
      </Campo>

      <Campo etiqueta="Día de la semana" errores={errores.diaSemana}>
        {(control) => (
          <NativeSelect {...control} name="diaSemana" defaultValue={valores.diaSemana ?? dias[0]?.valor}>
            {dias.map((d) => (
              <option key={d.valor} value={d.valor}>
                {d.etiqueta}
              </option>
            ))}
          </NativeSelect>
        )}
      </Campo>

      <div className="grid gap-4 sm:grid-cols-2">
        <Campo etiqueta="Hora de inicio" errores={errores.horaInicio}>
          {(control) => <Input {...control} name="horaInicio" type="time" defaultValue={valores.horaInicio} />}
        </Campo>
        <Campo etiqueta="Hora de fin" errores={errores.horaFin}>
          {(control) => <Input {...control} name="horaFin" type="time" defaultValue={valores.horaFin} />}
        </Campo>
      </div>

      <Campo etiqueta="Cupo máximo" ayuda="Cuántas personas entran en cada clase." errores={errores.cupoMaximo}>
        {(control) => (
          // inputMode y no type="number": abre el teclado numérico sin
          // ponerle flechitas de incremento (clase 11).
          <Input {...control} name="cupoMaximo" inputMode="numeric" defaultValue={valores.cupoMaximo} />
        )}
      </Campo>

      <Campo etiqueta="Salón (opcional)" errores={errores.salon}>
        {(control) => <Input {...control} name="salon" defaultValue={valores.salon} autoComplete="off" />}
      </Campo>

      <div className="flex flex-col gap-2 sm:flex-row-reverse sm:justify-start">
        <Button type="submit" disabled={pendiente} className="w-full sm:w-auto">
          {pendiente ? "Guardando…" : "Guardar clase"}
        </Button>
      </div>
    </form>
  );
}
