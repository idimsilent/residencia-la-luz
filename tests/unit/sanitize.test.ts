import { describe, expect, it } from "vitest";
import { sanitizePlain, sanitizeRichText } from "@/lib/sanitize";

describe("saneado de HTML", () => {
  it("elimina scripts, manejadores de eventos e iframes", () => {
    const out = sanitizeRichText('<p onclick="x()">Hola<script>alert(1)</script></p><iframe src="https://x"></iframe><img src=x onerror=alert(1)>');
    expect(out).not.toMatch(/script|onclick|onerror|iframe/i);
    expect(out).toContain("Hola");
  });

  it("elimina enlaces javascript:", () => {
    const out = sanitizeRichText('<a href="javascript:alert(1)">x</a>');
    expect(out).not.toContain("javascript:");
  });

  it("los enlaces externos se abren de forma segura", () => {
    const out = sanitizeRichText('<a href="https://ejemplo.es">x</a>');
    expect(out).toContain('rel="noopener noreferrer nofollow"');
  });

  it("conserva el formato permitido", () => {
    const html = "<h2>Título</h2><p><strong>negrita</strong> y <em>cursiva</em></p><ul><li>uno</li></ul>";
    expect(sanitizeRichText(html)).toBe(html);
  });

  it("no permite estilos arbitrarios", () => {
    const out = sanitizeRichText('<p style="background:url(javascript:x);text-align:center">a</p>');
    expect(out).not.toContain("background");
  });

  it("solo admite imágenes de la biblioteca", () => {
    expect(sanitizeRichText('<img src="https://tracker.example/pixel.gif" alt="">')).not.toContain("tracker");
    expect(sanitizeRichText('<img src="/demo/jardin.svg" alt="Jardín">')).toContain("/demo/jardin.svg");
  });

  it("el texto plano no conserva etiquetas", () => {
    expect(sanitizePlain("<b>Hola</b> <script>x</script>mundo")).toBe("Hola mundo");
  });
});
