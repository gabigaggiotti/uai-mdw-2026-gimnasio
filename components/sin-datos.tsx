import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

/**
 * El estado VACÍO de una pantalla: la consulta trajo 0 filas (lo sabe el
 * servidor). No confundir con "sin resultados" de una búsqueda, que lo
 * resuelve el componente que tiene el filtro (clase 10).
 *
 * Dice qué pasa, por qué, y —si hay— qué hacer.
 */
export function SinDatos({
  titulo,
  descripcion,
  accion,
}: {
  titulo: string;
  descripcion: string;
  accion?: { href: string; texto: string };
}) {
  return (
    <Card className="border-dashed">
      <CardHeader>
        <CardTitle>{titulo}</CardTitle>
        <CardDescription>{descripcion}</CardDescription>
      </CardHeader>
      {accion ? (
        <CardContent>
          <Button asChild className="w-full sm:w-auto">
            <Link href={accion.href}>{accion.texto}</Link>
          </Button>
        </CardContent>
      ) : null}
    </Card>
  );
}
