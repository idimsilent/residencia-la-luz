import type { NextConfig } from "next";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL ?? "";
let supabaseHost: URL | null = null;
try {
  supabaseHost = supabaseUrl ? new URL(supabaseUrl) : null;
} catch {
  supabaseHost = null;
}
const isLocalSupabase = Boolean(supabaseHost && ["127.0.0.1", "localhost"].includes(supabaseHost.hostname));

/**
 * Cabeceras de seguridad. La CSP permite solo recursos propios, Supabase
 * (API e imágenes) y los reproductores de vídeo sin cookies.
 */
const csp = [
  "default-src 'self'",
  // Next.js necesita scripts inline para la hidratación.
  "script-src 'self' 'unsafe-inline'" + (process.env.NODE_ENV === "development" ? " 'unsafe-eval'" : ""),
  "style-src 'self' 'unsafe-inline'",
  `img-src 'self' data: blob: ${supabaseHost ? supabaseHost.origin : ""} https://i.ytimg.com https://i.vimeocdn.com`,
  "font-src 'self' data:",
  `connect-src 'self' ${supabaseHost ? supabaseHost.origin : ""}`,
  "frame-src https://www.youtube-nocookie.com https://player.vimeo.com https://www.openstreetmap.org https://www.google.com",
  "frame-ancestors 'none'",
  "form-action 'self'",
  "base-uri 'self'",
  "object-src 'none'",
].join("; ");

const nextConfig: NextConfig = {
  poweredByHeader: false,
  turbopack: {
    rules: {
      "*.css": {
        loaders: ["@tailwindcss/turbopack"],
        as: "*.css",
      },
    },
  },
  images: {
    qualities: [70, 80],
    formats: ["image/avif", "image/webp"],
    remotePatterns: supabaseHost
      ? [
          {
            protocol: supabaseHost.protocol.replace(":", "") as "http" | "https",
            hostname: supabaseHost.hostname,
            port: supabaseHost.port,
            pathname: "/storage/v1/object/public/**",
          },
        ]
      : [],
    // Solo para desarrollo con Supabase local (127.0.0.1).
    dangerouslyAllowLocalIP: isLocalSupabase,
  },
  experimental: {
    serverActions: {
      bodySizeLimit: "2mb",
    },
  },
  async headers() {
    return [
      {
        source: "/:path*",
        headers: [
          { key: "Content-Security-Policy", value: csp },
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
          { key: "X-Frame-Options", value: "DENY" },
          { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=(), interest-cohort=()" },
          { key: "Strict-Transport-Security", value: "max-age=63072000; includeSubDomains; preload" },
        ],
      },
    ];
  },
};

export default nextConfig;
