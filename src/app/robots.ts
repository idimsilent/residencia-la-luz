import type { MetadataRoute } from "next";
import { env } from "@/lib/env";

// La ruta del panel NO se menciona aquí a propósito: robots.txt es público y
// revelaría su dirección. El panel envía "noindex" en sus propias cabeceras.
export default function robots(): MetadataRoute.Robots {
  return {
    rules: [{ userAgent: "*", allow: "/", disallow: ["/api/"] }],
    sitemap: `${env.siteUrl}/sitemap.xml`,
    host: env.siteUrl,
  };
}
