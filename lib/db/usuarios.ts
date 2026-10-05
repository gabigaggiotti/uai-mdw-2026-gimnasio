import { prisma } from "@/lib/db/client";
import type { Rol } from "@prisma/client";

export async function obtenerOCrearUsuarioDeProveedor(email: string, nombre: string) {
  return prisma.usuario.upsert({
    where: { email },
    update: {},
    create: { email, nombre, rol: "CLIENTE" satisfies Rol },
    select: { id: true, email: true, nombre: true, rol: true },
  });
}