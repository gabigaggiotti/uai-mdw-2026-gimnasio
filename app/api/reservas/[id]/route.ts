import { NextResponse } from "next/server";
import { obtenerReserva } from "@/lib/db/reservas";
import { requerirUsuario } from "@/lib/auth";
import { manejarHandler } from "@/lib/http";

type Params = { params: Promise<{ id: string }> };

export const GET = manejarHandler("GET /api/reservas/:id", async (_request: Request, { params }: Params) => {
  const usuario = await requerirUsuario(["CLIENTE", "ADMINISTRADOR"]);
  const { id } = await params;
  const reserva = await obtenerReserva(
    id,
    usuario.rol === "CLIENTE" ? usuario.id : undefined,
  );

  if (!reserva) {
    return NextResponse.json({ error: "No encontrado" }, { status: 404 });
  }

  return NextResponse.json(reserva);
});
