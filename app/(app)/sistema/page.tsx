import { requerirUsuario } from "@/lib/auth";
import { EstadoDeReserva, type EstadoReserva } from "@/components/estado-reserva";
import { SinDatos } from "@/components/sin-datos";
import { BuscadorClases } from "@/components/buscador-clases";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { EjemploDeCampos } from "./ejemplo-campos";

export const metadata = { title: "Sistema visual — Gimnasio" };

const ESTADOS: EstadoReserva[] = ["CONFIRMADA", "CANCELADA", "ASISTIO"];

const TEXTO_LARGUISIMO =
  "Entrenamiento funcional de alta intensidad con circuitos combinados de fuerza, movilidad y resistencia cardiovascular para todos los niveles";

/**
 * La galería del sistema visual (clase 10): cada componente con todos sus
 * estados, con datos fijos y sin tocar la base. Sirve para iterar un
 * componente antes de usarlo y para revisar contraste, foco y "ningún
 * estado solo con color" en una sola pantalla.
 */
export default async function Sistema() {
  await requerirUsuario();

  return (
    <div className="flex flex-col gap-8">
      <div>
        <h1 className="text-2xl font-bold">Sistema visual</h1>
        <p className="text-muted-foreground">Los componentes del proyecto, en todos sus estados.</p>
      </div>

      <section className="flex flex-col gap-3">
        <h2 className="text-lg font-semibold">Botones</h2>
        <div className="flex flex-wrap gap-2">
          <Button>Principal</Button>
          <Button variant="secondary">Secundario</Button>
          <Button variant="outline">Contorno</Button>
          <Button variant="ghost">Fantasma</Button>
          <Button variant="link">Link</Button>
          <Button variant="destructive">Cancelar reserva</Button>
          <Button disabled>Reservando…</Button>
        </div>
      </section>

      <section className="flex flex-col gap-3">
        <h2 className="text-lg font-semibold">Estado de una reserva</h2>
        <div className="flex flex-wrap gap-2">
          {ESTADOS.map((estado) => (
            <EstadoDeReserva key={estado} estado={estado} />
          ))}
          <Badge variant="outline">Administrador</Badge>
        </div>
      </section>

      <section className="flex flex-col gap-3">
        <h2 className="text-lg font-semibold">Tarjeta con texto larguísimo</h2>
        <Card>
          <CardHeader>
            <CardTitle className="break-words">{TEXTO_LARGUISIMO}</CardTitle>
            <CardDescription>Martes · 07:00 a 08:00</CardDescription>
          </CardHeader>
          <CardContent className="break-words text-sm">{TEXTO_LARGUISIMO}</CardContent>
        </Card>
      </section>

      <section className="flex flex-col gap-3">
        <h2 className="text-lg font-semibold">Avisos</h2>
        <Alert variant="success">
          <AlertTitle>Tu reserva está confirmada</AlertTitle>
          <AlertDescription>Te mandamos la confirmación por mail.</AlertDescription>
        </Alert>
        <Alert variant="destructive">
          <AlertTitle>No pudimos reservar</AlertTitle>
          <AlertDescription>No hay cupo disponible para esta clase</AlertDescription>
        </Alert>
        <Alert>
          <AlertTitle>Aviso neutro</AlertTitle>
          <AlertDescription>Un mensaje informativo.</AlertDescription>
        </Alert>
      </section>

      <section className="flex flex-col gap-3">
        <h2 className="text-lg font-semibold">Cargando (esqueleto)</h2>
        <div className="flex flex-col gap-2">
          <Skeleton className="h-8 w-48" />
          <Skeleton className="h-10 w-full" />
          <Skeleton className="h-24 w-full" />
        </div>
      </section>

      <section className="flex flex-col gap-3">
        <h2 className="text-lg font-semibold">Vacío</h2>
        <SinDatos
          titulo="Todavía no reservaste ninguna clase"
          descripcion="Cuando reserves un lugar en una clase, lo vas a ver acá y lo vas a poder cancelar."
          accion={{ href: "/", texto: "Ver la grilla" }}
        />
      </section>

      <section className="flex flex-col gap-3">
        <h2 className="text-lg font-semibold">Buscador (con resultados y sin resultados)</h2>
        <p className="text-sm text-muted-foreground">Escribí &ldquo;zzz&rdquo; para ver el estado sin resultados.</p>
        <BuscadorClases
          clases={[
            {
              id: "demo-1",
              nombre: "Spinning",
              disciplina: "Cardio",
              profesor: "Profesora de ejemplo",
              dia: "Lunes",
              horario: "18:00 a 19:00",
              cupo: "cupo 20",
            },
            {
              id: "demo-2",
              nombre: TEXTO_LARGUISIMO,
              disciplina: "Funcional",
              profesor: "Profesor de ejemplo",
              dia: "Martes",
              horario: "07:00 a 08:00",
              cupo: "cupo 12",
            },
          ]}
        />
      </section>

      <section className="flex flex-col gap-3">
        <h2 className="text-lg font-semibold">Campos de formulario</h2>
        <EjemploDeCampos />
      </section>
    </div>
  );
}
