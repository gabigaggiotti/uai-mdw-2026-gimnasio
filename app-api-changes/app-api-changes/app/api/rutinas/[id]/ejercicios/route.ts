import { NextResponse } from "next/server";
import { agregarEjercicioARutinaSchema } from "@/lib/schemas/rutinaEjercicio";
import { obtenerRutinaConEjercicios, agregarEjercicioARutina } from "@/lib/db/rutinas";
import { manejarError } from "@/lib/http";

type Params = { params: Promise<{ id: string }> };

export async function GET(_request: Request, { params }: Params) {
  const { id } = await params;
  // TODO (clase 6): requerirUsuario(["CLIENTE", "PROFESOR", "ADMINISTRADOR"]).
  const rutina = await obtenerRutinaConEjercicios(id);

  if (!rutina) {
    return NextResponse.json({ error: "No encontrado" }, { status: 404 });
  }

  return NextResponse.json(rutina.ejercicios);
}

export async function POST(request: Request, { params }: Params) {
  const { id } = await params;
  const body: unknown = await request.json();
  const resultado = agregarEjercicioARutinaSchema.safeParse(body);

  if (!resultado.success) {
    return NextResponse.json(
      { error: "Datos inválidos", detalles: resultado.error.flatten() },
      { status: 400 },
    );
  }

  // TODO (clase 6): requerirUsuario(["PROFESOR", "ADMINISTRADOR"]).
  try {
    const itemDeRutina = await agregarEjercicioARutina(id, resultado.data);
    return NextResponse.json(itemDeRutina, { status: 201 });
  } catch (error) {
    return manejarError(error);
  }
}
