import { NextResponse } from "next/server";
import { obtenerRutinaConEjercicios, activarRutina } from "@/lib/db/rutinas";

type Params = { params: Promise<{ id: string }> };

/**
 * POST y no PATCH { estado: "ACTIVA" }: activar tiene una regla propia
 * (desactiva automáticamente la rutina que estaba activa para ese
 * cliente), y esa regla no puede quedar en manos de lo que mande el
 * cliente HTTP.
 */
export async function POST(_request: Request, { params }: Params) {
  const { id } = await params;

  // TODO (clase 6): requerirUsuario(["CLIENTE", "ADMINISTRADOR"]) +
  // si es CLIENTE, verificar que la rutina sea la suya.
  const rutina = await obtenerRutinaConEjercicios(id);

  if (!rutina) {
    return NextResponse.json({ error: "No encontrado" }, { status: 404 });
  }

  const rutinaActivada = await activarRutina(id, rutina.clienteId);
  return NextResponse.json(rutinaActivada);
}
