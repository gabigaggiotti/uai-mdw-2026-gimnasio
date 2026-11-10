"use client";

// De cliente solo porque Campo recibe una función como hijo, y una función
// no puede cruzar la frontera desde un Server Component.
import { Campo } from "@/components/campo";
import { Input } from "@/components/ui/input";
import { NativeSelect } from "@/components/ui/native-select";

export function EjemploDeCampos() {
  return (
    <div className="flex max-w-md flex-col gap-4">
      <Campo etiqueta="Nombre" ayuda="Al menos 3 caracteres.">
        {(control) => <Input {...control} defaultValue="Spinning" />}
      </Campo>
      <Campo etiqueta="Nombre (con error)" errores={["El nombre necesita al menos 3 caracteres"]}>
        {(control) => <Input {...control} defaultValue="Sp" />}
      </Campo>
      <Campo etiqueta="Fecha">
        {(control) => (
          <NativeSelect {...control} defaultValue="a">
            <option value="a">lunes 16 de noviembre — 5 lugares libres</option>
            <option value="b" disabled>
              lunes 23 de noviembre — 0 lugares libres (sin cupo)
            </option>
          </NativeSelect>
        )}
      </Campo>
      <Campo etiqueta="Deshabilitado">
        {(control) => <Input {...control} disabled defaultValue="No se puede editar" />}
      </Campo>
    </div>
  );
}
