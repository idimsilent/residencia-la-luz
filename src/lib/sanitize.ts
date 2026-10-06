import sanitizeHtml from "sanitize-html";

/**
 * Saneado de HTML enriquecido (noticias, servicios, bloques de texto).
 * Lista blanca estricta: sin scripts, estilos, iframes ni atributos de evento.
 * Se aplica al guardar y de nuevo al mostrar (defensa en profundidad).
 */
const ALLOWED_IMG_HOSTS = (): string[] => {
  const hosts: string[] = [];
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  if (url) {
    try {
      hosts.push(new URL(url).hostname);
    } catch {
      // ignorar
    }
  }
  return hosts;
};

export function sanitizeRichText(dirty: string): string {
  const imgHosts = ALLOWED_IMG_HOSTS();
  return sanitizeHtml(dirty, {
    allowedTags: [
      "p", "br", "h2", "h3", "h4", "strong", "b", "em", "i", "u", "s",
      "a", "ul", "ol", "li", "blockquote", "hr", "img", "figure", "figcaption",
    ],
    allowedAttributes: {
      a: ["href", "target", "rel"],
      img: ["src", "alt", "width", "height", "loading"],
      p: ["style"],
      h2: ["style"],
      h3: ["style"],
      h4: ["style"],
    },
    allowedStyles: {
      "*": { "text-align": [/^(left|right|center|justify)$/] },
    },
    allowedSchemes: ["https", "mailto", "tel"],
    allowedSchemesByTag: { img: ["https", "http"] },
    allowProtocolRelative: false,
    transformTags: {
      a: (tagName, attribs) => {
        const href = attribs.href ?? "";
        const isExternal = /^https?:\/\//i.test(href);
        return {
          tagName,
          attribs: {
            href,
            ...(isExternal ? { target: "_blank", rel: "noopener noreferrer nofollow" } : {}),
          },
        };
      },
      img: (tagName, attribs) => ({
        tagName,
        attribs: { ...attribs, loading: "lazy" },
      }),
    },
    exclusiveFilter: (frame) => {
      if (frame.tag !== "img") return false;
      const src = frame.attribs.src ?? "";
      if (src.startsWith("/demo/")) return false;
      try {
        const host = new URL(src).hostname;
        return !imgHosts.includes(host);
      } catch {
        return true;
      }
    },
  });
}

/** Texto plano: elimina cualquier etiqueta. */
export function sanitizePlain(dirty: string): string {
  return sanitizeHtml(dirty, { allowedTags: [], allowedAttributes: {} }).trim();
}
