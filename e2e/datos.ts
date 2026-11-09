/**
 * Los datos fijos de las pruebas e2e. Los carga e2e/preparar.ts en una
 * base local vacía y los usan las pruebas. Los ids tienen forma de cuid
 * porque los schemas de Zod de la API los validan así.
 */

export const USUARIOS = {
  administrador: { id: "ce2eadministrador01", email: "admin@ejemplo.com", nombre: "Admin E2E", rol: "ADMINISTRADOR" },
  profesor: { id: "ce2eprofesor000001", email: "profesor@ejemplo.com", nombre: "Profesora E2E", rol: "PROFESOR" },
  // Tiene una suscripción vigente: puede reservar.
  cliente: { id: "ce2ecliente0000001", email: "cliente@ejemplo.com", nombre: "Cliente E2E", rol: "CLIENTE" },
  // Su única suscripción está CANCELADA: no puede reservar. Sus recursos
  // son los "ajenos" de las pruebas de permisos.
  otroCliente: { id: "ce2ecliente0000002", email: "otro@ejemplo.com", nombre: "Otra Clienta E2E", rol: "CLIENTE" },
} as const;

export type ClaveUsuario = keyof typeof USUARIOS;

export const IDS = {
  perfilProfesor: "ce2eperfilprofesor1",
  plan: "ce2eplanmensual0001",
  suscripcionCliente: "ce2esuscripcion0001",
  suscripcionOtroCliente: "ce2esuscripcion0002",
  clase: "ce2eclasespinning01",
  reservaOtroCliente: "ce2ereservaotro0001",
  lesionOtroCliente: "ce2elesionotro00001",
  rutinaOtroCliente: "ce2erutinaotro00001",
} as const;
