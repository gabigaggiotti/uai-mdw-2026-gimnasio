import { Badge } from "@/components/ui/badge";

// Duplica el enum EstadoReserva de prisma/schema.prisma a propósito: este
// componente no importa Prisma.
export type EstadoReserva = "CONFIRMADA" | "CANCELADA" | "ASISTIO";

/**
 * Traduce el estado de una reserva a lo que ve la persona. Vive en
 * components/ y no en components/ui/ porque sabe qué es una reserva.
 * El estado siempre va con su palabra: nunca se comunica solo con color.
 */
const PRESENTACION: Record<EstadoReserva, { texto: string; variante: "success" | "secondary" | "outline" }> = {
  CONFIRMADA: { texto: "Confirmada", variante: "success" },
  CANCELADA: { texto: "Cancelada", variante: "secondary" },
  ASISTIO: { texto: "Asistió", variante: "outline" },
};

export function EstadoDeReserva({ estado }: { estado: EstadoReserva }) {
  const { texto, variante } = PRESENTACION[estado];
  return <Badge variant={variante}>{texto}</Badge>;
}
