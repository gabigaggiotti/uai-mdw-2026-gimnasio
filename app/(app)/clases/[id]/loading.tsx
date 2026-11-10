import { Skeleton } from "@/components/ui/skeleton";

export default function CargandoClase() {
  return (
    <div className="flex flex-col gap-4" aria-busy="true" aria-label="Cargando">
      <Skeleton className="h-44 w-full" />
      <Skeleton className="h-52 w-full" />
    </div>
  );
}
