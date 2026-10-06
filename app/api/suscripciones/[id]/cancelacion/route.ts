import { NextResponse } from "next/server";
import { cancelarSuscripcion, obtenerSuscripcion } from "@/lib/db/suscripciones";
import { manejarHandler } from "@/lib/http";
import { requerirUsuario } from "@/lib/auth";

type Params = { params: Promise<{ id: string }> };

export const POST = manejarHandler("POST /api/suscripciones/:id/cancelacion", async (_request: Request, { params }: Params) => {
  const usuario = await requerirUsuario(["CLIENTE", "ADMINISTRADOR"]);
  const { id } = await params;
  const clienteId = usuario.rol === "CLIENTE" ? usuario.id : undefined;
  const suscripcion = await obtenerSuscripcion(id, clienteId);

  if (!suscripcion) {
    return NextResponse.json({ error: "No encontrado" }, { status: 404 });
  }

  if (suscripcion.estado === "CANCELADA") {
    return NextResponse.json({ error: "La suscripción ya está cancelada" }, { status: 409 });
  }

  const suscripcionCancelada = await cancelarSuscripcion(id, clienteId);
  if (!suscripcionCancelada) {
    return NextResponse.json({ error: "No encontrado" }, { status: 404 });
  }
  return NextResponse.json(suscripcionCancelada);
});
