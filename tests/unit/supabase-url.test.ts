import { describe, expect, it } from "vitest";
import { normalizeSupabaseUrl } from "@/lib/supabase-url";

describe("normalizeSupabaseUrl", () => {
  it("quita la ruta del API y la barra final", () => {
    expect(normalizeSupabaseUrl("https://abc.supabase.co/rest/v1/")).toBe("https://abc.supabase.co");
    expect(normalizeSupabaseUrl(" https://abc.supabase.co/ ")).toBe("https://abc.supabase.co");
  });
  it("conserva el puerto en local", () => {
    expect(normalizeSupabaseUrl("http://127.0.0.1:54321")).toBe("http://127.0.0.1:54321");
  });
  it("devuelve undefined si está vacía", () => {
    expect(normalizeSupabaseUrl("")).toBeUndefined();
    expect(normalizeSupabaseUrl(undefined)).toBeUndefined();
  });
});
