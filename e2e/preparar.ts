/**
 * globalSetup de Playwright: deja la base LOCAL de pruebas en un estado
 * conocido antes de correr. Aplica las migraciones, borra todo y carga los
 * datos de e2e/datos.ts.
 *
 * Usa PrismaClient directo, igual que prisma/seed.ts: es una herramienta
 * de desarrollo, no código de la app (la regla de lib/db/client.ts es para
 * app/ y components/). playwright.config.ts ya verificó que la base sea
 * local antes de llegar acá.
 */
import { execSync } from "node:child_process";
import { PrismaClient } from "@prisma/client";
import { IDS, USUARIOS } from "./datos";

const UN_DIA = 24 * 60 * 60 * 1000;

export default async function preparar() {
  execSync("npx prisma migrate deploy", { stdio: "inherit", env: process.env });

  const prisma = new PrismaClient();
  try {
    await prisma.$executeRawUnsafe(
      `TRUNCATE "RutinaEjercicio", "Rutina", "Ejercicio", "Lesion", "Cuota", "Suscripcion", "Reserva", "Clase", "Plan", "Profesor", "Usuario" CASCADE`,
    );

    for (const usuario of Object.values(USUARIOS)) {
      await prisma.usuario.create({ data: usuario });
    }

    await prisma.profesor.create({
      data: { id: IDS.perfilProfesor, usuarioId: USUARIOS.profesor.id, especialidad: "Spinning" },
    });

    await prisma.plan.create({
      data: { id: IDS.plan, nombre: "Plan Mensual", descripcion: "Plan de prueba", precio: 15000, duracionDias: 30 },
    });

    const hoy = Date.now();
    await prisma.suscripcion.create({
      data: {
        id: IDS.suscripcionCliente,
        clienteId: USUARIOS.cliente.id,
        planId: IDS.plan,
        fechaInicio: new Date(hoy - UN_DIA),
        fechaFin: new Date(hoy + 30 * UN_DIA),
      },
    });
    await prisma.suscripcion.create({
      data: {
        id: IDS.suscripcionOtroCliente,
        clienteId: USUARIOS.otroCliente.id,
        planId: IDS.plan,
        fechaInicio: new Date(hoy - 10 * UN_DIA),
        fechaFin: new Date(hoy + 20 * UN_DIA),
        estado: "CANCELADA",
      },
    });

    await prisma.clase.create({
      data: {
        id: IDS.clase,
        nombre: "Spinning de prueba",
        disciplina: "Cardio",
        profesorId: IDS.perfilProfesor,
        diaSemana: "LUNES",
        horaInicio: "18:00",
        horaFin: "19:00",
        cupoMaximo: 10,
      },
    });

    // Recursos del otro cliente: son los "ajenos" de e2e/permisos.spec.ts.
    const enUnaSemana = new Date(hoy + 7 * UN_DIA);
    enUnaSemana.setUTCHours(0, 0, 0, 0);
    await prisma.reserva.create({
      data: { id: IDS.reservaOtroCliente, clienteId: USUARIOS.otroCliente.id, claseId: IDS.clase, fecha: enUnaSemana },
    });
    await prisma.lesion.create({
      data: {
        id: IDS.lesionOtroCliente,
        clienteId: USUARIOS.otroCliente.id,
        descripcion: "Esguince de tobillo",
        zonaAfectada: "Tobillo",
        gravedad: "LEVE",
      },
    });
    await prisma.rutina.create({
      data: { id: IDS.rutinaOtroCliente, clienteId: USUARIOS.otroCliente.id, nombre: "Rutina de prueba" },
    });
  } finally {
    await prisma.$disconnect();
  }
}
