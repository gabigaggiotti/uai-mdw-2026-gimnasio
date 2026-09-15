import { NextResponse } from "next/server";
import { crearLesionSchema } from "@/lib/schemas/lesion";
import { crearLesion, listarLesionesDeCliente } from "@/lib/db/lesiones";

export async function GET(request: Request) {
  // TODO (clase 6): requerirUsuario(["CLIENTE", "PROFESOR", "ADMINISTRADOR"]) +
  // si es CLIENTE, forzar clienteId = usuario.id (ignorar el query param).
  const { searchParams } = new URL(request.url);
  const clienteId = searchParams.get("clienteId") ?? "usuario-de-ejemplo";

  const lesiones = await listarLesionesDeCliente(clienteId);
  return NextResponse.json(lesiones);
}

export async function POST(request: Request) {
  const body: unknown = await request.json();
  const resultado = crearLesionSchema.safeParse(body);

  if (!resultado.success) {
    return NextResponse.json(
      { error: "Datos inválidos", detalles: resultado.error.flatten() },
      { status: 400 },
    );
  }

  // TODO (clase 6): requerirUsuario(["CLIENTE", "PROFESOR", "ADMINISTRADOR"]).
  const lesion = await crearLesion(resultado.data);
  return NextResponse.json(lesion, { status: 201 });
}
