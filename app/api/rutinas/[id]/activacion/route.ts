import { NextResponse } from "next/server";
import { obtenerRutinaConEjercicios, activarRutina } from "@/lib/db/rutinas";
import { requerirUsuario } from "@/lib/auth";
import { manejarHandler } from "@/lib/http";

type Params = { params: Promise<{ id: string }> };

/**
 * POST y no PATCH { estado: "ACTIVA" }: activar tiene una regla propia
 * (desactiva automáticamente la rutina que estaba activa para ese
 * cliente), y esa regla no puede quedar en manos de lo que mande el
 * cliente HTTP.
 */
export const POST = manejarHandler("POST /api/rutinas/:id/activacion", async (_request: Request, { params }: Params) => {
  const usuario = await requerirUsuario(["CLIENTE", "ADMINISTRADOR"]);
  const { id } = await params;
  const rutina = await obtenerRutinaConEjercicios(
    id,
    usuario.rol === "CLIENTE" ? usuario.id : undefined,
  );

  if (!rutina) {
    return NextResponse.json({ error: "No encontrado" }, { status: 404 });
  }

  const rutinaActivada = await activarRutina(id, rutina.clienteId);
  return NextResponse.json(rutinaActivada);
});
