import Link from "next/link";
import { notFound } from "next/navigation";
import { requerirUsuario } from "@/lib/auth";
import { obtenerReserva } from "@/lib/db/reservas";
import { formatearDia } from "@/lib/utils";
import { EstadoDeReserva } from "@/components/estado-reserva";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader } from "@/components/ui/card";
import { CancelarReserva } from "./cancelar";

type Props = {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ mail?: string }>;
};

/**
 * Detalle de una reserva: la confirmación (paso 5) y la cancelación (paso 6).
 *
 * Usa la MISMA función de autorización que GET /api/reservas/:id: para un
 * CLIENTE la consulta filtra por su id, y una reserva ajena devuelve null
 * igual que una inexistente → notFound(), el mismo 404 sin contar de más.
 */
export default async function DetalleDeReserva({ params, searchParams }: Props) {
  const usuario = await requerirUsuario();
  if (usuario.rol !== "CLIENTE" && usuario.rol !== "ADMINISTRADOR") notFound();

  const { id } = await params;
  const { mail } = await searchParams;

  const reserva = await obtenerReserva(id, usuario.rol === "CLIENTE" ? usuario.id : undefined);
  if (!reserva) notFound();

  const confirmada = reserva.estado === "CONFIRMADA";

  return (
    <article className="flex flex-col gap-4">
      {confirmada && mail === "enviado" ? (
        <Alert variant="success">
          <AlertTitle>Tu reserva está confirmada</AlertTitle>
          <AlertDescription>Te mandamos la confirmación por mail.</AlertDescription>
        </Alert>
      ) : null}
      {confirmada && mail === "pendiente" ? (
        <Alert variant="success">
          <AlertTitle>Tu reserva está confirmada</AlertTitle>
          <AlertDescription>
            No pudimos mandarte el mail de confirmación, pero la reserva está guardada: la vas a ver siempre en Mis
            reservas.
          </AlertDescription>
        </Alert>
      ) : null}

      <Card>
        <CardHeader>
          <div className="flex flex-wrap items-start justify-between gap-2">
            <h1 className="break-words text-2xl font-bold">{reserva.clase.nombre}</h1>
            <EstadoDeReserva estado={reserva.estado} />
          </div>
          <CardDescription>
            {formatearDia(reserva.fecha)} · {reserva.clase.horaInicio} a {reserva.clase.horaFin}
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-4">
          {confirmada ? (
            <>
              <p className="text-sm text-muted-foreground">
                Podés cancelar hasta 2 horas antes del inicio de la clase. Al cancelar, el lugar queda libre para otra
                persona.
              </p>
              <CancelarReserva reservaId={reserva.id} />
            </>
          ) : null}
          <div className="flex flex-col gap-2 sm:flex-row">
            <Button asChild variant="outline" className="w-full sm:w-auto">
              <Link href={`/clases/${reserva.clase.id}`}>Ver la clase</Link>
            </Button>
            {usuario.rol === "CLIENTE" ? (
              <Button asChild variant="outline" className="w-full sm:w-auto">
                <Link href="/reservas">Mis reservas</Link>
              </Button>
            ) : null}
          </div>
        </CardContent>
      </Card>
    </article>
  );
}
