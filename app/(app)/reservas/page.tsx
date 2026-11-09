import Link from "next/link";
import { notFound } from "next/navigation";
import { requerirUsuario } from "@/lib/auth";
import { listarReservasDeCliente } from "@/lib/db/reservas";
import { formatearDia } from "@/lib/utils";
import { EstadoDeReserva } from "@/components/estado-reserva";
import { SinDatos } from "@/components/sin-datos";
import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export const metadata = { title: "Mis reservas — Gimnasio" };

/**
 * Mis reservas (paso 6 del flujo). La consulta lleva el id de la sesión
 * adentro, igual que GET /api/reservas: un cliente nunca ve las de otro.
 */
export default async function MisReservas() {
  const usuario = await requerirUsuario();
  // Solo un CLIENTE tiene reservas propias. Para otro rol la pantalla no
  // existe: mismo 404 que cualquier dirección que no le corresponde.
  if (usuario.rol !== "CLIENTE") notFound();

  const reservas = await listarReservasDeCliente(usuario.id);

  return (
    <section className="flex flex-col gap-4">
      <h1 className="text-2xl font-bold">Mis reservas</h1>

      {reservas.length === 0 ? (
        <SinDatos
          titulo="Todavía no reservaste ninguna clase"
          descripcion="Cuando reserves un lugar en una clase, lo vas a ver acá y lo vas a poder cancelar."
          accion={{ href: "/", texto: "Ver la grilla" }}
        />
      ) : (
        <ul className="flex flex-col gap-3">
          {reservas.map((reserva) => (
            <li key={reserva.id}>
              <Link href={`/reservas/${reserva.id}`} className="block rounded-lg">
                <Card className="transition-colors hover:bg-accent">
                  <CardHeader className="flex-row flex-wrap items-start justify-between gap-2">
                    <div className="flex flex-col gap-1">
                      <CardTitle className="break-words">{reserva.clase.nombre}</CardTitle>
                      <CardDescription>
                        {formatearDia(reserva.fecha)} · {reserva.clase.horaInicio} a {reserva.clase.horaFin}
                      </CardDescription>
                    </div>
                    <EstadoDeReserva estado={reserva.estado} />
                  </CardHeader>
                </Card>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
