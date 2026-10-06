/**
 * Pruebas de seguridad contra una base de datos Supabase LOCAL (npx supabase start).
 * Se omiten si no hay variables de entorno. Nunca ejecutar contra producción:
 * crea y borra un usuario temporal.
 *
 *   TEST_SUPABASE_URL=http://127.0.0.1:54321 \
 *   TEST_SUPABASE_PUBLISHABLE_KEY=sb_publishable_... \
 *   TEST_SUPABASE_SECRET_KEY=sb_secret_... \
 *   TEST_EDITOR_EMAIL=editor@example.com TEST_EDITOR_PASSWORD=... npm run test:integration
 */
import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/types/database";

const URL_ = process.env.TEST_SUPABASE_URL;
const ANON = process.env.TEST_SUPABASE_PUBLISHABLE_KEY;
const SECRET = process.env.TEST_SUPABASE_SECRET_KEY;
const enabled = Boolean(URL_ && ANON && SECRET);
const isLocal = URL_ ? /127\.0\.0\.1|localhost/.test(URL_) : false;

const opts = { auth: { persistSession: false, autoRefreshToken: false } };

describe.skipIf(!enabled || !isLocal)("RLS y permisos (Supabase local)", () => {
  let anon: SupabaseClient<Database>;
  let service: SupabaseClient<Database>;
  let noRole: SupabaseClient<Database>;
  let editor: SupabaseClient<Database> | null = null;
  let tempUserId = "";
  const tempEmail = `sin-rol-${Date.now()}@example.com`;
  const tempPassword = `Temp-${crypto.randomUUID()}-Aa1`;

  beforeAll(async () => {
    anon = createClient<Database>(URL_!, ANON!, opts);
    service = createClient<Database>(URL_!, SECRET!, opts);
    const { data, error } = await service.auth.admin.createUser({ email: tempEmail, password: tempPassword, email_confirm: true });
    if (error) throw error;
    tempUserId = data.user.id;
    noRole = createClient<Database>(URL_!, ANON!, opts);
    const { error: e2 } = await noRole.auth.signInWithPassword({ email: tempEmail, password: tempPassword });
    if (e2) throw e2;
    if (process.env.TEST_EDITOR_EMAIL && process.env.TEST_EDITOR_PASSWORD) {
      editor = createClient<Database>(URL_!, ANON!, opts);
      const { error: e3 } = await editor.auth.signInWithPassword({ email: process.env.TEST_EDITOR_EMAIL, password: process.env.TEST_EDITOR_PASSWORD });
      if (e3) editor = null;
    }
  });

  afterAll(async () => {
    if (tempUserId) await service.auth.admin.deleteUser(tempUserId);
  });

  it("el registro público está desactivado", async () => {
    const { error } = await anon.auth.signUp({ email: `intruso-${Date.now()}@example.com`, password: "Intruso-12345" });
    expect(error).not.toBeNull();
  });

  it("los visitantes no ven borradores ni noticias programadas", async () => {
    const { data } = await anon.from("news_posts").select("status, published_at");
    expect(data?.length).toBeGreaterThan(0);
    for (const n of data ?? []) {
      expect(n.status).toBe("published");
      expect(new Date(n.published_at!).getTime()).toBeLessThanOrEqual(Date.now());
    }
    const { data: events } = await anon.from("events").select("status");
    for (const e of events ?? []) expect(e.status).toBe("published");
  });

  it("los visitantes solo leen bloques publicados", async () => {
    const { data } = await anon.from("page_blocks").select("revision_id").is("revision_id", null).limit(1);
    expect(data ?? []).toHaveLength(0);
  });

  it("los visitantes no pueden escribir contenido", async () => {
    const { error } = await anon.from("news_posts").insert({ title: "Hack", slug: `hack-${Date.now()}` });
    expect(error).not.toBeNull();
    const { error: e2 } = await anon.from("site_settings").update({ site_name: "Hack" }).eq("id", 1);
    const { data: s } = await service.from("site_settings").select("site_name").eq("id", 1).single();
    expect(e2 !== null || s?.site_name !== "Hack").toBe(true);
  });

  it("los visitantes no leen mensajes ni el registro de actividad", async () => {
    const { data: m } = await anon.from("contact_messages").select("id");
    expect(m ?? []).toHaveLength(0);
    const { data: a } = await anon.from("audit_log").select("id");
    expect(a ?? []).toHaveLength(0);
  });

  it("los visitantes no pueden insertar mensajes directamente (solo a través del servidor)", async () => {
    const { error } = await anon.from("contact_messages").insert({ name: "x", email: "x@x.es", message: "hola", privacy_accepted: true, privacy_version: "x" });
    expect(error).not.toBeNull();
  });

  it("la limitación de intentos no se puede usar desde el navegador", async () => {
    const { error } = await anon.rpc("check_rate_limit", { p_bucket: "x", p_key_hash: "x", p_max: 1, p_window_seconds: 60 });
    expect(error).not.toBeNull();
  });

  it("los visitantes no pueden subir archivos", async () => {
    const { error } = await anon.storage.from("media").upload(`uploads/test-${Date.now()}.png`, new Blob([new Uint8Array([137, 80, 78, 71])], { type: "image/png" }));
    expect(error).not.toBeNull();
  });

  it("una cuenta sin rol no puede modificar nada", async () => {
    const { error } = await noRole.from("news_posts").insert({ title: "Sin rol", slug: `sin-rol-${Date.now()}` });
    expect(error).not.toBeNull();
    const { data } = await noRole.from("news_posts").select("id").eq("status", "draft");
    expect(data ?? []).toHaveLength(0);
  });

  it("nadie puede darse un rol a sí mismo", async () => {
    await noRole.from("profiles").update({ role: "admin" }).eq("id", tempUserId);
    const { error } = await noRole.rpc("set_user_role", { p_user_id: tempUserId, p_role: "admin" });
    expect(error).not.toBeNull();
    const { data } = await service.from("profiles").select("role").eq("id", tempUserId).single();
    expect(data?.role).toBeNull();
  });

  it.skipIf(!process.env.TEST_EDITOR_EMAIL)("el rol de edición no cambia la apariencia ni la configuración", async () => {
    expect(editor).not.toBeNull();
    const { data: before } = await service.from("site_settings").select("site_name").eq("id", 1).single();
    await editor!.from("site_settings").update({ site_name: "Cambio no autorizado" }).eq("id", 1);
    const { data: after } = await service.from("site_settings").select("site_name").eq("id", 1).single();
    expect(after?.site_name).toBe(before?.site_name);
    const { data: theme } = await service.from("themes").select("id").eq("is_active", false).limit(1).single();
    const { error } = await editor!.rpc("activate_theme", { p_theme_id: theme!.id });
    expect(error).not.toBeNull();
  });

  it.skipIf(!process.env.TEST_EDITOR_EMAIL)("las páginas principales no se pueden renombrar ni borrar", async () => {
    const { data: home } = await service.from("pages").select("id").eq("slug", "inicio").single();
    const { error } = await editor!.from("pages").update({ slug: "otra" }).eq("id", home!.id);
    expect(error).not.toBeNull();
    await editor!.from("pages").delete().eq("id", home!.id);
    const { data } = await service.from("pages").select("id").eq("id", home!.id);
    expect(data).toHaveLength(1);
  });
});
