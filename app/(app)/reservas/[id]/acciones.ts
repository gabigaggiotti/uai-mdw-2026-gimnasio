"use server";

/**
 * Server Action de cancelar: un endpoint público con otra sintaxis. Verifica
 * sesión y rol en la primera línea y usa el mismo caso de uso que
 * POST /api/reservas/:id/cancelacion. El id de la reserva llega por .bind
 * (sale de la URL), nunca de un campo del formulario.
 */
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { requerirUsuario } from "@/lib/auth";
import { cancelarReservaDe, MENSAJE_RECHAZO_CANCELACION } from "@/lib/casos/cancelar-reserva";
import type { EstadoFormulario } from "@/lib/formularios";

// No recibe el estado anterior ni el FormData: el formulario es solo un
// botón y todo lo que necesita sale de la URL (.bind) y de la sesión.
export async function cancelarAction(reservaId: string): Promise<EstadoFormulario> {
  const usuario = await requerirUsuario(["CLIENTE", "ADMINISTRADOR"]);
  const clienteId = usuario.rol === "CLIENTE" ? usuario.id : undefined;

  const resultado = await cancelarReservaDe(reservaId, clienteId);
  if (!resultado.ok) {
    return { mensaje: MENSAJE_RECHAZO_CANCELACION[resultado.motivo] };
  }

  // Quedaron viejas: esta reserva, el listado y el cupo de la clase.
  revalidatePath(`/reservas/${reservaId}`);
  revalidatePath("/reservas");
  revalidatePath(`/clases/${resultado.reserva.claseId}`);

  redirect(`/reservas/${reservaId}`);
}
