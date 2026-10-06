import { NextResponse } from "next/server";
import { crearCuotaSchema } from "@/lib/schemas/cuota";
import { registrarCuota, listarCuotasDeSuscripcion } from "@/lib/db/cuotas";
import { manejarHandler } from "@/lib/http";
import { requerirUsuario } from "@/lib/auth";

export const GET = manejarHandler("GET /api/cuotas", async (request: Request) => {
  const usuario = await requerirUsuario(["CLIENTE", "ADMINISTRADOR"]);
  const { searchParams } = new URL(request.url);
  const suscripcionId = searchParams.get("suscripcionId");

  if (!suscripcionId) {
    return NextResponse.json({ error: "Falta el parámetro 'suscripcionId'" }, { status: 400 });
  }

  const cuotas = await listarCuotasDeSuscripcion(
    suscripcionId,
    undefined,
    usuario.rol === "CLIENTE" ? usuario.id : undefined,
  );
  return NextResponse.json(cuotas);
});

export const POST = manejarHandler("POST /api/cuotas", async (request: Request) => {
  await requerirUsuario(["ADMINISTRADOR"]);
  const body: unknown = await request.json();
  const resultado = crearCuotaSchema.safeParse(body);

  if (!resultado.success) {
    return NextResponse.json(
      { error: "Datos inválidos", detalles: resultado.error.flatten() },
      { status: 400 },
    );
  }

  const cuota = await registrarCuota(resultado.data);
  return NextResponse.json(cuota, { status: 201 });
});
