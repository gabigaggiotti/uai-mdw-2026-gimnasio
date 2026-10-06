import { NextResponse } from "next/server";
import { obtenerSuscripcion } from "@/lib/db/suscripciones";
import { requerirUsuario } from "@/lib/auth";
import { manejarHandler } from "@/lib/http";

type Params = { params: Promise<{ id: string }> };

export const GET = manejarHandler("GET /api/suscripciones/:id", async (_request: Request, { params }: Params) => {
  const usuario = await requerirUsuario(["CLIENTE", "ADMINISTRADOR"]);
  const { id } = await params;
  const suscripcion = await obtenerSuscripcion(
    id,
    usuario.rol === "CLIENTE" ? usuario.id : undefined,
  );

  if (!suscripcion) {
    return NextResponse.json({ error: "No encontrado" }, { status: 404 });
  }

  return NextResponse.json(suscripcion);
});
