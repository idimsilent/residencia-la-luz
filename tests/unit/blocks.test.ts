import { describe, expect, it } from "vitest";
import { BLOCK_TYPES, collectBlockMediaIds, defaultBlock, parseBlock, parseBlocks } from "@/features/blocks/schema";

describe("esquema de bloques", () => {
  it("todos los tipos tienen un bloque por defecto válido", () => {
    for (const type of BLOCK_TYPES) {
      const b = defaultBlock(type);
      expect(b.type).toBe(type);
      expect(parseBlock(b).ok).toBe(true);
    }
  });

  it("rechaza tipos desconocidos (no se puede inyectar un componente arbitrario)", () => {
    expect(parseBlock({ type: "script", props: {} }).ok).toBe(false);
    expect(parseBlock({ type: "html", props: { html: "<script>alert(1)</script>" } }).ok).toBe(false);
  });

  it("rechaza enlaces javascript: en los botones", () => {
    const r = parseBlock({ type: "cta", props: { title: "Hola", primaryCta: { label: "x", href: "javascript:alert(1)" } } });
    expect(r.ok).toBe(false);
  });

  it("acepta enlaces internos, https, tel y mailto", () => {
    for (const href of ["/contacto", "https://ejemplo.es/a", "tel:+34 900 000 000", "mailto:hola@ejemplo.es", "#seccion"]) {
      expect(parseBlock({ type: "cta", props: { title: "Hola", primaryCta: { label: "x", href } } }).ok).toBe(true);
    }
  });

  it("el vídeo solo acepta un identificador, nunca una URL ni código", () => {
    expect(parseBlock({ type: "video", props: { videoId: "dQw4w9WgXcQ" } }).ok).toBe(true);
    expect(parseBlock({ type: "video", props: { videoId: "https://evil.example/x" } }).ok).toBe(false);
    expect(parseBlock({ type: "video", props: { videoId: '"><script>' } }).ok).toBe(false);
  });

  it("rechaza versiones de formato futuras", () => {
    expect(parseBlock({ type: "spacer", props: {}, schemaVersion: 99 }).ok).toBe(false);
  });

  it("limita el número de bloques por página", () => {
    const many = Array.from({ length: 61 }, () => ({ type: "spacer", props: {} }));
    expect(parseBlocks(many).ok).toBe(false);
  });

  it("devuelve el índice del bloque con error", () => {
    const r = parseBlocks([{ type: "spacer", props: {} }, { type: "hero", props: { title: "" } }]);
    expect(r.ok).toBe(false);
    if (!r.ok) expect(r.errors[0].index).toBe(1);
  });

  it("recoge las imágenes usadas por los bloques", () => {
    const id1 = "6f1c2a3e-1b2c-4d3e-8f40-000000000001";
    const id2 = "6f1c2a3e-1b2c-4d3e-8f40-000000000002";
    const r = parseBlocks([
      { type: "hero", props: { title: "T", mediaId: id1 } },
      { type: "gallery", props: { source: "manual", mediaIds: [id1, id2] } },
    ]);
    expect(r.ok).toBe(true);
    if (r.ok) expect(collectBlockMediaIds(r.blocks).sort()).toEqual([id1, id2]);
  });
});
