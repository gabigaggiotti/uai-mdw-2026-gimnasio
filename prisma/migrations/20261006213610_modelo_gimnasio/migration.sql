/*
  Warnings:

  - The values [ADMIN,USUARIO] on the enum `Rol` will be removed. If these variants are still used in the database, this will fail.
  - You are about to drop the `Nota` table. If the table is not empty, all the data it contains will be lost.

*/
-- CreateEnum
CREATE TYPE "DiaSemana" AS ENUM ('LUNES', 'MARTES', 'MIERCOLES', 'JUEVES', 'VIERNES', 'SABADO', 'DOMINGO');

-- CreateEnum
CREATE TYPE "EstadoReserva" AS ENUM ('CONFIRMADA', 'CANCELADA', 'ASISTIO');

-- CreateEnum
CREATE TYPE "EstadoSuscripcion" AS ENUM ('ACTIVA', 'VENCIDA', 'CANCELADA');

-- CreateEnum
CREATE TYPE "ModoPago" AS ENUM ('EFECTIVO', 'TARJETA', 'TRANSFERENCIA');

-- CreateEnum
CREATE TYPE "EstadoRutina" AS ENUM ('ACTIVA', 'INACTIVA');

-- CreateEnum
CREATE TYPE "Gravedad" AS ENUM ('LEVE', 'MODERADA', 'GRAVE');

-- CreateEnum
CREATE TYPE "EstadoLesion" AS ENUM ('ACTIVA', 'RECUPERADA');

-- AlterEnum
BEGIN;
CREATE TYPE "Rol_new" AS ENUM ('CLIENTE', 'PROFESOR', 'ADMINISTRADOR');
ALTER TABLE "public"."Usuario" ALTER COLUMN "rol" DROP DEFAULT;
ALTER TABLE "Usuario" ALTER COLUMN "rol" TYPE "Rol_new" USING ("rol"::text::"Rol_new");
ALTER TYPE "Rol" RENAME TO "Rol_old";
ALTER TYPE "Rol_new" RENAME TO "Rol";
DROP TYPE "public"."Rol_old";
ALTER TABLE "Usuario" ALTER COLUMN "rol" SET DEFAULT 'CLIENTE';
COMMIT;

-- DropForeignKey
ALTER TABLE "Nota" DROP CONSTRAINT "Nota_autorId_fkey";

-- AlterTable
ALTER TABLE "Usuario" ALTER COLUMN "rol" SET DEFAULT 'CLIENTE';

-- DropTable
DROP TABLE "Nota";

-- CreateTable
CREATE TABLE "Profesor" (
    "id" TEXT NOT NULL,
    "usuarioId" TEXT NOT NULL,
    "especialidad" TEXT NOT NULL,
    "telefono" TEXT,
    "activo" BOOLEAN NOT NULL DEFAULT true,
    "creadoEn" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Profesor_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Plan" (
    "id" TEXT NOT NULL,
    "nombre" TEXT NOT NULL,
    "descripcion" TEXT NOT NULL,
    "precio" DECIMAL(65,30) NOT NULL,
    "duracionDias" INTEGER NOT NULL,
    "clasesPorSemana" INTEGER,
    "activo" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "Plan_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Clase" (
    "id" TEXT NOT NULL,
    "nombre" TEXT NOT NULL,
    "disciplina" TEXT NOT NULL,
    "profesorId" TEXT NOT NULL,
    "diaSemana" "DiaSemana" NOT NULL,
    "horaInicio" TEXT NOT NULL,
    "horaFin" TEXT NOT NULL,
    "cupoMaximo" INTEGER NOT NULL,
    "salon" TEXT,
    "activa" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "Clase_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Reserva" (
    "id" TEXT NOT NULL,
    "clienteId" TEXT NOT NULL,
    "claseId" TEXT NOT NULL,
    "fecha" TIMESTAMP(3) NOT NULL,
    "estado" "EstadoReserva" NOT NULL DEFAULT 'CONFIRMADA',
    "creadaEn" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "canceladaEn" TIMESTAMP(3),

    CONSTRAINT "Reserva_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Suscripcion" (
    "id" TEXT NOT NULL,
    "clienteId" TEXT NOT NULL,
    "planId" TEXT NOT NULL,
    "fechaInicio" TIMESTAMP(3) NOT NULL,
    "fechaFin" TIMESTAMP(3) NOT NULL,
    "estado" "EstadoSuscripcion" NOT NULL DEFAULT 'ACTIVA',
    "creadaEn" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Suscripcion_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Cuota" (
    "id" TEXT NOT NULL,
    "suscripcionId" TEXT NOT NULL,
    "fechaPago" TIMESTAMP(3) NOT NULL,
    "modoPago" "ModoPago" NOT NULL,
    "monto" DECIMAL(65,30) NOT NULL,
    "periodoCorrespondiente" TEXT NOT NULL,

    CONSTRAINT "Cuota_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Lesion" (
    "id" TEXT NOT NULL,
    "clienteId" TEXT NOT NULL,
    "descripcion" TEXT NOT NULL,
    "zonaAfectada" TEXT NOT NULL,
    "fechaRegistro" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "gravedad" "Gravedad" NOT NULL,
    "estado" "EstadoLesion" NOT NULL DEFAULT 'ACTIVA',
    "observaciones" TEXT,

    CONSTRAINT "Lesion_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Rutina" (
    "id" TEXT NOT NULL,
    "clienteId" TEXT NOT NULL,
    "nombre" TEXT NOT NULL,
    "estado" "EstadoRutina" NOT NULL DEFAULT 'INACTIVA',
    "creadaEn" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Rutina_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Ejercicio" (
    "id" TEXT NOT NULL,
    "nombre" TEXT NOT NULL,
    "grupoMuscular" TEXT NOT NULL,
    "descripcion" TEXT,

    CONSTRAINT "Ejercicio_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "RutinaEjercicio" (
    "id" TEXT NOT NULL,
    "rutinaId" TEXT NOT NULL,
    "ejercicioId" TEXT NOT NULL,
    "series" INTEGER NOT NULL,
    "repeticiones" INTEGER NOT NULL,
    "orden" INTEGER NOT NULL,

    CONSTRAINT "RutinaEjercicio_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Profesor_usuarioId_key" ON "Profesor"("usuarioId");

-- CreateIndex
CREATE INDEX "Profesor_usuarioId_idx" ON "Profesor"("usuarioId");

-- CreateIndex
CREATE INDEX "Clase_profesorId_idx" ON "Clase"("profesorId");

-- CreateIndex
CREATE INDEX "Reserva_clienteId_idx" ON "Reserva"("clienteId");

-- CreateIndex
CREATE INDEX "Reserva_claseId_idx" ON "Reserva"("claseId");

-- CreateIndex
CREATE INDEX "Suscripcion_clienteId_idx" ON "Suscripcion"("clienteId");

-- CreateIndex
CREATE INDEX "Suscripcion_planId_idx" ON "Suscripcion"("planId");

-- CreateIndex
CREATE INDEX "Cuota_suscripcionId_idx" ON "Cuota"("suscripcionId");

-- CreateIndex
CREATE INDEX "Lesion_clienteId_idx" ON "Lesion"("clienteId");

-- CreateIndex
CREATE INDEX "Rutina_clienteId_idx" ON "Rutina"("clienteId");

-- CreateIndex
CREATE INDEX "RutinaEjercicio_rutinaId_idx" ON "RutinaEjercicio"("rutinaId");

-- CreateIndex
CREATE INDEX "RutinaEjercicio_ejercicioId_idx" ON "RutinaEjercicio"("ejercicioId");

-- AddForeignKey
ALTER TABLE "Profesor" ADD CONSTRAINT "Profesor_usuarioId_fkey" FOREIGN KEY ("usuarioId") REFERENCES "Usuario"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Clase" ADD CONSTRAINT "Clase_profesorId_fkey" FOREIGN KEY ("profesorId") REFERENCES "Profesor"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Reserva" ADD CONSTRAINT "Reserva_clienteId_fkey" FOREIGN KEY ("clienteId") REFERENCES "Usuario"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Reserva" ADD CONSTRAINT "Reserva_claseId_fkey" FOREIGN KEY ("claseId") REFERENCES "Clase"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Suscripcion" ADD CONSTRAINT "Suscripcion_clienteId_fkey" FOREIGN KEY ("clienteId") REFERENCES "Usuario"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Suscripcion" ADD CONSTRAINT "Suscripcion_planId_fkey" FOREIGN KEY ("planId") REFERENCES "Plan"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Cuota" ADD CONSTRAINT "Cuota_suscripcionId_fkey" FOREIGN KEY ("suscripcionId") REFERENCES "Suscripcion"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Lesion" ADD CONSTRAINT "Lesion_clienteId_fkey" FOREIGN KEY ("clienteId") REFERENCES "Usuario"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Rutina" ADD CONSTRAINT "Rutina_clienteId_fkey" FOREIGN KEY ("clienteId") REFERENCES "Usuario"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RutinaEjercicio" ADD CONSTRAINT "RutinaEjercicio_rutinaId_fkey" FOREIGN KEY ("rutinaId") REFERENCES "Rutina"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RutinaEjercicio" ADD CONSTRAINT "RutinaEjercicio_ejercicioId_fkey" FOREIGN KEY ("ejercicioId") REFERENCES "Ejercicio"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
