/**
 * Datos de ejemplo para desarrollo.
 *
 * Correr con: npm run db:seed
 *
 * Por qué existe: para que el equipo trabaje contra los mismos datos y
 * para poder mostrar el sistema sin cargar todo a mano. Debe poder
 * correrse varias veces sin romper (por eso usamos upsert).
 */
import { PrismaClient, Rol } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  await prisma.usuario.upsert({
    where: { email: "admin@ejemplo.com" },
    update: {},
    create: {
      email: "admin@ejemplo.com",
      nombre: "Admin de ejemplo",
      rol: Rol.ADMINISTRADOR,
    },
  });

  const profesor = await prisma.usuario.upsert({
    where: { email: "profesor@ejemplo.com" },
    update: {},
    create: {
      email: "profesor@ejemplo.com",
      nombre: "Profesor de ejemplo",
      rol: Rol.PROFESOR,
      profesor: {
        create: { especialidad: "Spinning" },
      },
    },
    include: { profesor: true },
  });

  const cliente = await prisma.usuario.upsert({
    where: { email: "cliente@ejemplo.com" },
    update: {},
    create: {
      email: "cliente@ejemplo.com",
      nombre: "Cliente de ejemplo",
      rol: Rol.CLIENTE,
    },
  });

  await prisma.plan.upsert({
    where: { id: "plan-mensual-ejemplo" },
    update: {},
    create: {
      id: "plan-mensual-ejemplo",
      nombre: "Plan Mensual",
      descripcion: "Acceso ilimitado a clases por 30 días.",
      precio: 15000,
      duracionDias: 30,
    },
  });

  // Sin una suscripción vigente el cliente de ejemplo no puede reservar
  // (docs/spec.md, sección 6), y el flujo principal no se podría mostrar.
  const hoy = new Date();
  const enUnAno = new Date(hoy.getTime() + 365 * 24 * 60 * 60 * 1000);
  await prisma.suscripcion.upsert({
    where: { id: "suscripcion-cliente-ejemplo" },
    update: {},
    create: {
      id: "suscripcion-cliente-ejemplo",
      clienteId: cliente.id,
      planId: "plan-mensual-ejemplo",
      fechaInicio: hoy,
      fechaFin: enUnAno,
    },
  });

  if (profesor.profesor) {
    await prisma.clase.upsert({
      where: { id: "clase-spinning-ejemplo" },
      update: {},
      create: {
        id: "clase-spinning-ejemplo",
        nombre: "Spinning",
        disciplina: "Cardio",
        profesorId: profesor.profesor.id,
        diaSemana: "LUNES",
        horaInicio: "18:00",
        horaFin: "19:00",
        cupoMaximo: 20,
      },
    });
  }

  console.log("Seed completo.");
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });