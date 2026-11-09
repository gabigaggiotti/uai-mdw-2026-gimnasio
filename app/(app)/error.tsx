"use client";

/**
 * El estado de ERROR de toda la parte con sesión. Es de cliente porque
 * ofrece "Reintentar": reset() vuelve a intentar el render sin recargar,
 * y para eso tiene que haber JavaScript corriendo (clase 10).
 *
 * Nunca muestra el mensaje de la excepción: el detalle va a la consola
 * (en Vercel, a los logs) y la persona ve que el problema es del sistema,
 * que no se perdió nada y qué apretar.
 */
import { useEffect } from "react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";

export default function ErrorDeLaSeccion({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="flex flex-col gap-4">
      <Alert variant="destructive">
        <AlertTitle>No pudimos cargar esta pantalla</AlertTitle>
        <AlertDescription>
          Es un problema del sistema, no de algo que hayas hecho. Tus reservas no se perdieron. Probá de nuevo en unos
          segundos.
        </AlertDescription>
      </Alert>
      <div>
        <Button onClick={reset} className="w-full sm:w-auto">
          Reintentar
        </Button>
      </div>
    </div>
  );
}
