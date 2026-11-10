import { redirect } from "next/navigation";
import { obtenerUsuario, signIn } from "@/lib/auth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader } from "@/components/ui/card";

export const metadata = { title: "Ingresar — Gimnasio" };

export default async function Ingresar() {
  // Quien ya tiene sesión no tiene nada que hacer acá.
  if (await obtenerUsuario()) redirect("/");

  async function ingresarConGoogle() {
    "use server";
    await signIn("google", { redirectTo: "/" });
  }

  return (
    <Card className="mx-auto max-w-md">
      <CardHeader>
        <h1 className="text-2xl font-semibold leading-tight">Reservá tu lugar en las clases</h1>
        <CardDescription>
          Consultá la grilla semanal, reservá un lugar en la clase que quieras y cancelalo si no podés ir.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form action={ingresarConGoogle}>
          <Button type="submit" size="lg" className="w-full">
            Ingresar con Google
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
