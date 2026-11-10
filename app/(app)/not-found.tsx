import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

/**
 * El 404 que no cuenta de más: el mismo texto para "no existe" y para "no
 * es tuya". No usa la palabra "permiso" porque confirmaría que el recurso
 * existe (mismo criterio que el 404 de la API, clase 6). Va adentro de
 * (app) para dibujarse con la barra: quien llegó por un link viejo sigue
 * teniendo a dónde ir.
 */
export default function NoEncontrado() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>No encontramos lo que buscabas</CardTitle>
        <CardDescription>
          La dirección no corresponde a nada que puedas ver. Puede que el link esté mal escrito o sea viejo.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Button asChild className="w-full sm:w-auto">
          <Link href="/">Volver a la grilla</Link>
        </Button>
      </CardContent>
    </Card>
  );
}
