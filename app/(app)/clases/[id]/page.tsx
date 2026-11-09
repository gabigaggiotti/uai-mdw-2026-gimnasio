import { notFound } from "next/navigation";
import { requerirUsuario } from "@/lib/auth";
import { contarReservasConfirmadas, obtenerClase } from "@/lib/db/clases";
import { NOMBRE_DIA, proximasFechas } from "@/lib/clases";
import { hayCupoDisponible } from "@/lib/reservas";
import { aIsoDia, formatearDia } from "@/lib/utils";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { FormularioReserva, type OpcionDeFecha } from "./reservar";

type Props = { params: Promise<{ id: string }> };

/**
 * Detalle de una clase (pasos 2 y 3 del flujo). La página PREPARA: verifica
 * quién mira, trae la clase y calcula las próximas fechas con su cupo, y se
 * lo pasa al formulario. La acción (acciones.ts) es la que DECIDE.
 */
export default async function DetalleDeClase({ params }: Props) {
  const usuario = await requerirUsuario();
  const { id } = await params;

  const clase = await obtenerClase(id);
  // Una clase dada de baja no se muestra en la grilla, y tampoco acá.
  if (!clase || !clase.activa) notFound();

  let opciones: OpcionDeFecha[] = [];
  if (usuario.rol === "CLIENTE") {
    const fechas = proximasFechas(clase.diaSemana, new Date());
    // Las consultas no dependen una de la otra: en paralelo, no en serie.
    const confirmadas = await Promise.all(fechas.map((fecha) => contarReservasConfirmadas(clase.id, fecha)));

    opciones = fechas.map((fecha, i) => {
      const ocupados = confirmadas[i] ?? 0;
      const libres = Math.max(clase.cupoMaximo - ocupados, 0);
      return {
        valor: aIsoDia(fecha),
        etiqueta: `${formatearDia(fecha)} — ${libres === 1 ? "1 lugar libre" : `${libres} lugares libres`}`,
        agotada: !hayCupoDisponible(clase.cupoMaximo, ocupados),
      };
    });
  }

  return (
    <article className="flex flex-col gap-4">
      <Card>
        <CardHeader>
          <h1 className="break-words text-2xl font-bold">{clase.nombre}</h1>
          <CardDescription>
            {NOMBRE_DIA[clase.diaSemana]} de {clase.horaInicio} a {clase.horaFin}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <dl className="grid gap-x-6 gap-y-2 text-sm sm:grid-cols-2">
            <div>
              <dt className="text-muted-foreground">Disciplina</dt>
              <dd className="break-words">{clase.disciplina}</dd>
            </div>
            <div>
              <dt className="text-muted-foreground">Profesor</dt>
              <dd className="break-words">{clase.profesor.usuario.nombre}</dd>
            </div>
            <div>
              <dt className="text-muted-foreground">Cupo por clase</dt>
              <dd>{clase.cupoMaximo} personas</dd>
            </div>
            {clase.salon ? (
              <div>
                <dt className="text-muted-foreground">Salón</dt>
                <dd className="break-words">{clase.salon}</dd>
              </div>
            ) : null}
          </dl>
        </CardContent>
      </Card>

      {usuario.rol === "CLIENTE" ? (
        <Card>
          <CardHeader>
            <CardTitle>Reservar un lugar</CardTitle>
            <CardDescription>
              Necesitás una suscripción vigente. Podés cancelar hasta 2 horas antes del inicio.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <FormularioReserva claseId={clase.id} opciones={opciones} />
          </CardContent>
        </Card>
      ) : null}
    </article>
  );
}
