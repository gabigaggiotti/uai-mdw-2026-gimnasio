import { NextResponse } from "next/server";
import { crearProfesorSchema } from "@/lib/schemas/profesor";
import { crearProfesor, listarProfesores } from "@/lib/db/profesores";
import { manejarError } from "@/lib/http";

export async function GET() {
  // TODO (clase 6): requerirUsuario(["ADMINISTRADOR"]).
  const profesores = await listarProfesores();
  return NextResponse.json(profesores);
}

export async function POST(request: Request) {
  const body: unknown = await request.json();
  const resultado = crearProfesorSchema.safeParse(body);

  if (!resultado.success) {
    return NextResponse.json(
      { error: "Datos inválidos", detalles: resultado.error.flatten() },
      { status: 400 },
    );
  }

  // TODO (clase 6): requerirUsuario(["ADMINISTRADOR"]).
  try {
    const profesor = await crearProfesor(resultado.data);
    return NextResponse.json(profesor, { status: 201 });
  } catch (error) {
    return manejarError(error);
  }
}
