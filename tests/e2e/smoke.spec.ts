import { expect, test } from "@playwright/test";

const ADMIN = process.env.E2E_ADMIN_PATH ?? "/gestion-centro";

test.describe("web pública", () => {
  for (const path of ["/", "/conocenos", "/servicios", "/instalaciones", "/noticias", "/eventos", "/contacto", "/aviso-legal", "/privacidad", "/cookies"]) {
    test(`la página ${path} carga y tiene un único h1`, async ({ page }) => {
      const res = await page.goto(path);
      expect(res?.status()).toBe(200);
      await expect(page.locator("h1")).toHaveCount(1);
      await expect(page.locator("html")).toHaveAttribute("lang", "es");
    });
  }

  test("las imágenes tienen texto alternativo", async ({ page }) => {
    await page.goto("/");
    const missing = await page.locator("img:not([alt])").count();
    expect(missing).toBe(0);
  });

  test("el formulario de contacto valida los campos", async ({ page }) => {
    await page.goto("/contacto");
    await page.getByRole("button", { name: /enviar/i }).click();
    // La validación nativa o la del servidor impide el envío vacío.
    await expect(page).toHaveURL(/\/contacto/);
  });

  test("el calendario de eventos muestra la vista mensual", async ({ page }) => {
    await page.goto("/eventos");
    await expect(page.locator("table")).toBeVisible();
  });

  test("existe sitemap y robots", async ({ request }) => {
    expect((await request.get("/sitemap.xml")).status()).toBe(200);
    const robots = await (await request.get("/robots.txt")).text();
    expect(robots).toContain("Sitemap:");
    expect(robots).not.toContain(ADMIN);
  });

  test("ninguna página pública enlaza al panel", async ({ page }) => {
    await page.goto("/");
    expect(await page.locator(`a[href^="${ADMIN}"]`).count()).toBe(0);
  });
});

test.describe("panel", () => {
  test("la ruta interna no existe desde fuera", async ({ request }) => {
    expect((await request.get("/panel-interno")).status()).toBe(404);
  });

  test("sin sesión redirige al acceso y no se indexa", async ({ page }) => {
    const res = await page.goto(`${ADMIN}/noticias`);
    await expect(page).toHaveURL(new RegExp(`${ADMIN}/acceso`));
    expect(res?.headers()["x-robots-tag"]).toContain("noindex");
  });

  test("credenciales incorrectas muestran un error genérico", async ({ page }) => {
    await page.goto(`${ADMIN}/acceso`);
    await page.fill("input[type=email]", "nadie@example.com");
    await page.fill("input[type=password]", "contraseña-incorrecta");
    await page.click("button[type=submit]");
    await expect(page.getByRole("alert")).toBeVisible();
  });

});

test.describe("panel con sesión", () => {
  test.skip(!process.env.E2E_EDITOR_EMAIL, "Define E2E_EDITOR_EMAIL y E2E_EDITOR_PASSWORD para probar el panel");
  test("una persona editora entra y ve el resumen", async ({ page }) => {
    await page.goto(`${ADMIN}/acceso`);
    await page.fill("input[type=email]", process.env.E2E_EDITOR_EMAIL!);
    await page.fill("input[type=password]", process.env.E2E_EDITOR_PASSWORD!);
    await page.click("button[type=submit]");
    await expect(page.getByRole("link", { name: "Nueva publicación" })).toBeVisible();
  });
});
