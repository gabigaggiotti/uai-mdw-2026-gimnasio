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

  await prisma.usuario.upsert({
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