import { NextResponse } from "next/server";
import { crearRutinaSchema } from "@/lib/schemas/rutina";
import { crearRutina, listarRutinasDeCliente } from "@/lib/db/rutinas";

export async function GET(request: Request) {
  // TODO (clase 6): requerirUsuario(["CLIENTE", "PROFESOR", "ADMINISTRADOR"]) +
  // si es CLIENTE, forzar clienteId = usuario.id.
  const { searchParams } = new URL(request.url);
  const clienteId = searchParams.get("clienteId") ?? "usuario-de-ejemplo";

  const rutinas = await listarRutinasDeCliente(clienteId);
  return NextResponse.json(rutinas);
}

export async function POST(request: Request) {
  const body: unknown = await request.json();
  const resultado = crearRutinaSchema.safeParse(body);

  if (!resultado.success) {
    return NextResponse.json(
      { error: "Datos inválidos", detalles: resultado.error.flatten() },
      { status: 400 },
    );
  }

  // TODO (clase 6): requerirUsuario(["PROFESOR", "ADMINISTRADOR"]).
  const rutina = await crearRutina(resultado.data);
  return NextResponse.json(rutina, { status: 201 });
}
