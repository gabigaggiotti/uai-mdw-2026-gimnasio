## Qué hace este PR

<Una o dos oraciones. Si hay una historia de usuario asociada, linkeala.>

## Checklist

- [ ] Funciona en el preview deployment, no solo en local
- [ ] La validación está en el servidor
- [ ] La autorización se verifica en el servidor (no alcanza con esconder el botón)
- [ ] Estados de carga y error resueltos en la UI
- [ ] `npm run build` y `npm run typecheck` pasan
- [ ] Si se tocó el modelo de datos, hay migración y (si la decisión fue discutida) un ADR

### Servicio externo (si se tocó `lib/servicios/`)

- [ ] Ningún `await` a un tercero sin timeout
- [ ] La credencial está en `lib/servicios/` y en ningún otro lado, sin prefijo `NEXT_PUBLIC_`
- [ ] Si el servicio es accesorio, la llamada va DESPUÉS de la operación principal
- [ ] La sección 8 de la spec dice qué pasa si se cae

### Formularios y Server Actions (si se tocó alguno)

- [ ] La primera línea de cada acción verifica sesión y rol
- [ ] Ningún id que deba salir de la sesión o de la URL viaja en el formulario
- [ ] Hay `revalidatePath` después de escribir, con las pantallas que quedaron viejas

### Pruebas

- [ ] Si cambió una regla de negocio (spec, sección 6): se actualizó su prueba en `lib/*.test.ts`
- [ ] Si cambió quién puede hacer qué o hay un endpoint nuevo (`docs/api.md`): se actualizó `e2e/permisos.spec.ts`
- [ ] Si cambió el recorrido (spec, sección 5): se actualizó `e2e/flujo-principal.spec.ts`
- [ ] El valor esperado de cada prueba nueva sale de la spec o del contrato, no de correr el código
- [ ] Cada prueba nueva se vio fallar al menos una vez (contar cómo, abajo)
- [ ] `npm test`, `npm run typecheck`, `npm run lint` y el trabajo `e2e` del CI en verde

## Cómo se vio fallar

<Qué se sacó a propósito, qué prueba se puso en rojo y con qué mensaje.>
