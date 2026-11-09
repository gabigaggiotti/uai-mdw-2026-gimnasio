/**
 * El flujo principal, recorrido por un navegador (docs/spec.md, sección 5).
 *
 * Una prueba larga y no seis cortas: lo que se quiere saber es si lo que
 * carga el administrador le llega al cliente, y los errores que importan
 * están en las costuras. Cada test.step es un paso de la spec.
 *
 * Busca como una persona —getByRole, getByLabel, getByText—, nunca por id
 * ni por clase de CSS. Si encuentra el campo por su etiqueta, un lector de
 * pantalla también.
 */
import { expect, test } from "@playwright/test";
import { iniciarSesion } from "./sesiones";

test("el administrador publica una clase, el cliente la reserva y la cancela", async ({ browser, baseURL }) => {
  const base = baseURL ?? "http://localhost:3100";
  const nombreDeLaClase = `Yoga E2E ${Date.now()}`;

  const contextoAdmin = await browser.newContext();
  await iniciarSesion(contextoAdmin, "administrador", base);
  const admin = await contextoAdmin.newPage();

  const contextoCliente = await browser.newContext();
  await iniciarSesion(contextoCliente, "cliente", base);
  const cliente = await contextoCliente.newPage();

  const contextoOtro = await browser.newContext();
  await iniciarSesion(contextoOtro, "otroCliente", base);
  const otroCliente = await contextoOtro.newPage();

  await test.step("1. el administrador da de alta una clase (con un error de validación en el medio)", async () => {
    await admin.goto("/admin/clases/nueva");

    // Error de validación: va DEBAJO del campo y no vacía el formulario.
    await admin.getByLabel("Nombre", { exact: true }).fill("Yo");
    await admin.getByLabel("Disciplina").fill("Yoga");
    await admin.getByRole("button", { name: "Guardar clase" }).click();
    await expect(admin.getByText("El nombre necesita al menos 3 caracteres")).toBeVisible();
    await expect(admin.getByLabel("Disciplina")).toHaveValue("Yoga");

    await admin.getByLabel("Nombre", { exact: true }).fill(nombreDeLaClase);
    await admin.getByLabel("Día de la semana").selectOption("MIERCOLES");
    await admin.getByLabel("Hora de inicio").fill("10:00");
    await admin.getByLabel("Hora de fin").fill("11:00");
    await admin.getByLabel("Cupo máximo").fill("8");
    await admin.getByRole("button", { name: "Guardar clase" }).click();

    await expect(admin.getByRole("heading", { name: nombreDeLaClase })).toBeVisible();
  });

  await test.step("2. el cliente encuentra la clase en la grilla", async () => {
    await cliente.goto("/");
    await cliente.getByLabel("Buscar clase").fill(nombreDeLaClase);
    await cliente.getByRole("link", { name: new RegExp(nombreDeLaClase) }).click();
    await expect(cliente.getByRole("heading", { name: nombreDeLaClase })).toBeVisible();
  });

  await test.step("4. caso de error: sin suscripción vigente el sistema rechaza la reserva", async () => {
    // El rechazo de una regla va ARRIBA del formulario, con el motivo.
    await otroCliente.goto(cliente.url());
    await otroCliente.getByRole("button", { name: "Reservar" }).click();
    await expect(otroCliente.getByText("No pudimos reservar")).toBeVisible();
    await expect(otroCliente.getByText("Necesitás una suscripción o cuota activa para reservar")).toBeVisible();
  });

  await test.step("3, 4 y 5. el cliente reserva y ve la confirmación", async () => {
    await expect(cliente.getByLabel("Fecha")).toBeVisible();
    await cliente.getByRole("button", { name: "Reservar" }).click();

    await expect(cliente.getByText("Tu reserva está confirmada")).toBeVisible();
    // En las pruebas no hay RESEND_API_KEY: el mail es accesorio y la
    // reserva se confirma igual (docs/spec.md, sección 8).
    await expect(cliente.getByText("No pudimos mandarte el mail de confirmación")).toBeVisible();
  });

  await test.step("6. el cliente la ve en Mis reservas y la cancela", async () => {
    await cliente.getByRole("navigation").getByRole("link", { name: "Mis reservas" }).click();
    const fila = cliente.getByRole("link", { name: new RegExp(nombreDeLaClase) });
    await expect(fila).toBeVisible();
    await expect(fila.getByText("Confirmada")).toBeVisible();

    await fila.click();
    await cliente.getByRole("button", { name: "Cancelar reserva" }).click();
    await expect(cliente.getByText("Cancelada", { exact: true })).toBeVisible();
    await expect(cliente.getByRole("button", { name: "Cancelar reserva" })).toHaveCount(0);
  });

  await Promise.all([contextoAdmin.close(), contextoCliente.close(), contextoOtro.close()]);
});

test("sin sesión, una pantalla privada manda a ingresar", async ({ page }) => {
  await page.goto("/reservas");
  await expect(page).toHaveURL(/\/ingresar$/);
  await expect(page.getByRole("button", { name: "Ingresar con Google" })).toBeVisible();
});

test("la reserva de otro cliente se ve igual que una que no existe", async ({ browser, baseURL }) => {
  const contexto = await browser.newContext();
  await iniciarSesion(contexto, "cliente", baseURL ?? "http://localhost:3100");
  const pagina = await contexto.newPage();

  await pagina.goto("/reservas/ce2ereservaotro0001");
  await expect(pagina.getByRole("heading", { name: "No encontramos lo que buscabas" })).toBeVisible();

  await pagina.goto("/reservas/ce2enoexiste0000001");
  await expect(pagina.getByRole("heading", { name: "No encontramos lo que buscabas" })).toBeVisible();

  await contexto.close();
});
