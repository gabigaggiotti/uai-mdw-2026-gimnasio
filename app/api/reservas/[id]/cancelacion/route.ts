import { NextResponse } from "next/server";
import { manejarHandler } from "@/lib/http";
import { requerirUsuario } from "@/lib/auth";
import {
  cancelarReservaDe,
  MENSAJE_RECHAZO_CANCELACION,
  type MotivoRechazoCancelacion,
} from "@/lib/casos/cancelar-reserva";

type Params = { params: Promise<{ id: string }> };

const STATUS_RECHAZO: Record<MotivoRechazoCancelacion, number> = {
  NO_ENCONTRADA: 404,
  YA_CANCELADA: 409,
  FUERA_DE_TIEMPO: 409,
};

/**
 * POST y no PATCH { estado: "CANCELADA" }: cancelar es una transición
 * con su propio permiso (el dueño de la reserva o un Administrador,
 * nunca cualquier autenticado) y su propia regla (no se cancela con
 * menos de 2 horas de anticipación). Las reglas viven en
 * lib/casos/cancelar-reserva.ts, compartidas con la Server Action.
 */
export const POST = manejarHandler("POST /api/reservas/:id/cancelacion", async (_request: Request, { params }: Params) => {
  const usuario = await requerirUsuario(["CLIENTE", "ADMINISTRADOR"]);
  const { id } = await params;
  const clienteId = usuario.rol === "CLIENTE" ? usuario.id : undefined;

  const resultado = await cancelarReservaDe(id, clienteId);

  if (!resultado.ok) {
    return NextResponse.json(
      { error: MENSAJE_RECHAZO_CANCELACION[resultado.motivo] },
      { status: STATUS_RECHAZO[resultado.motivo] },
    );
  }

  return NextResponse.json(resultado.reserva);
});
