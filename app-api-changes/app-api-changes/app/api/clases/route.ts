import { NextResponse } from "next/server";
import { crearClaseSchema, diaSemanaSchema } from "@/lib/schemas/clase";
import { crearClase, listarClases } from "@/lib/db/clases";

export async function GET(request: Request) {
  // TODO (clase 6): requerirUsuario().
  const { searchParams } = new URL(request.url);
  const diaSemanaParam = searchParams.get("dia");

  if (diaSemanaParam) {
    const resultado = diaSemanaSchema.safeParse(diaSemanaParam);
    if (!resultado.success) {
      return NextResponse.json({ error: "Parámetro 'dia' inválido" }, { status: 400 });
    }
    const clases = await listarClases(resultado.data);
    return NextResponse.json(clases);
  }

  const clases = await listarClases();
  return NextResponse.json(clases);
}

export async function POST(request: Request) {
  const body: unknown = await request.json();
  const resultado = crearClaseSchema.safeParse(body);

  if (!resultado.success) {
    return NextResponse.json(
      { error: "Datos inválidos", detalles: resultado.error.flatten() },
      { status: 400 },
    );
  }

  // TODO (clase 6): requerirUsuario(["ADMINISTRADOR"]).
  const clase = await crearClase(resultado.data);
  return NextResponse.json(clase, { status: 201 });
}
