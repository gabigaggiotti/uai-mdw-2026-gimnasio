import { NextResponse } from "next/server";
import { obtenerCuota } from "@/lib/db/cuotas";
import { requerirUsuario } from "@/lib/auth";
import { manejarHandler } from "@/lib/http";

type Params = { params: Promise<{ id: string }> };

export const GET = manejarHandler("GET /api/cuotas/:id", async (_request: Request, { params }: Params) => {
  const usuario = await requerirUsuario(["CLIENTE", "ADMINISTRADOR"]);
  const { id } = await params;
  const cuota = await obtenerCuota(
    id,
    usuario.rol === "CLIENTE" ? usuario.id : undefined,
  );

  if (!cuota) {
    return NextResponse.json({ error: "No encontrado" }, { status: 404 });
  }

  return NextResponse.json(cuota);
});
