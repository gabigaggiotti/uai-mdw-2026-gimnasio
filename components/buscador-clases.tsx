"use client";

/**
 * El único componente de la grilla que corre en el navegador. Es de
 * cliente porque tiene que acordarse de lo que se escribió entre una
 * tecla y la otra (estado). Filtra sin pedirle nada al servidor: las
 * clases ya llegaron con el HTML, y son pocas (lib/db/ trae como mucho 100).
 *
 * Resuelve el estado SIN RESULTADOS, que el servidor no puede saber porque
 * no sabe qué se escribió. El estado VACÍO lo resuelve la página.
 */
import Link from "next/link";
import { useState } from "react";
import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

// Texto ya formateado en el servidor: al navegador no le queda ninguna
// cuenta que rehacer y no puede dar distinto (clase 8).
export type FilaClase = {
  id: string;
  nombre: string;
  disciplina: string;
  profesor: string;
  dia: string;
  horario: string;
  cupo: string;
};

export function BuscadorClases({ clases }: { clases: FilaClase[] }) {
  const [texto, setTexto] = useState("");

  const termino = texto.trim().toLowerCase();
  const visibles = termino
    ? clases.filter((c) =>
        [c.nombre, c.disciplina, c.profesor, c.dia].some((campo) => campo.toLowerCase().includes(termino)),
      )
    : clases;

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-col gap-1.5">
        <Label htmlFor="buscar-clase">Buscar clase</Label>
        <Input
          id="buscar-clase"
          type="search"
          placeholder="Nombre, disciplina, profesor o día"
          value={texto}
          onChange={(evento) => setTexto(evento.target.value)}
        />
      </div>

      {visibles.length === 0 ? (
        <p role="status" className="rounded-lg border border-dashed p-5 text-sm text-muted-foreground">
          Ninguna clase coincide con &ldquo;{texto.trim()}&rdquo;. Probá con otra palabra o borrá la búsqueda para ver
          la grilla completa.
        </p>
      ) : (
        <ul className="grid gap-3 sm:grid-cols-2">
          {visibles.map((clase) => (
            <li key={clase.id}>
              <Link href={`/clases/${clase.id}`} className="block rounded-lg">
                <Card className="h-full transition-colors hover:bg-accent">
                  <CardHeader>
                    <CardTitle className="break-words">{clase.nombre}</CardTitle>
                    <CardDescription>
                      {clase.dia} · {clase.horario}
                    </CardDescription>
                    <CardDescription className="break-words">
                      {clase.disciplina} · {clase.profesor} · {clase.cupo}
                    </CardDescription>
                  </CardHeader>
                </Card>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
