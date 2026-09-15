import { NextResponse } from "next/server";
import { crearEjercicioSchema } from "@/lib/schemas/ejercicio";
import { crearEjercicio, listarEjercicios } from "@/lib/db/ejercicios";

export async function GET() {
  // TODO (clase 6): requerirUsuario().
  const ejercicios = await listarEjercicios();
  return NextResponse.json(ejercicios);
}

export async function POST(request: Request) {
  const body: unknown = await request.json();
  const resultado = crearEjercicioSchema.safeParse(body);

  if (!resultado.success) {
    return NextResponse.json(
      { error: "Datos inválidos", detalles: resultado.error.flatten() },
      { status: 400 },
    );
  }

  // TODO (clase 6): requerirUsuario(["ADMINISTRADOR"]).
  const ejercicio = await crearEjercicio(resultado.data);
  return NextResponse.json(ejercicio, { status: 201 });
}
