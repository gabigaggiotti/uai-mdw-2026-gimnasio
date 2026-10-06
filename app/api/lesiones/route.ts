import { NextResponse } from "next/server";
import { crearLesionSchema } from "@/lib/schemas/lesion";
import { crearLesion, listarLesionesDeCliente } from "@/lib/db/lesiones";
import { NoAutorizado, requerirUsuario } from "@/lib/auth";
import { manejarHandler } from "@/lib/http";

export const GET = manejarHandler("GET /api/lesiones", async (request: Request) => {
  const usuario = await requerirUsuario(["CLIENTE", "PROFESOR", "ADMINISTRADOR"]);
  const { searchParams } = new URL(request.url);
  const clienteId = usuario.rol === "CLIENTE"
    ? usuario.id
    : searchParams.get("clienteId") ?? undefined;

  const lesiones = await listarLesionesDeCliente(clienteId);
  return NextResponse.json(lesiones);
});

export const POST = manejarHandler("POST /api/lesiones", async (request: Request) => {
  const usuario = await requerirUsuario(["CLIENTE", "PROFESOR", "ADMINISTRADOR"]);
  const body: unknown = await request.json();
  const resultado = crearLesionSchema.safeParse(body);

  if (!resultado.success) {
    return NextResponse.json(
      { error: "Datos inválidos", detalles: resultado.error.flatten() },
      { status: 400 },
    );
  }

  if (usuario.rol === "CLIENTE" && resultado.data.clienteId !== usuario.id) {
    throw new NoAutorizado();
  }

  const lesion = await crearLesion(resultado.data);
  return NextResponse.json(lesion, { status: 201 });
});
