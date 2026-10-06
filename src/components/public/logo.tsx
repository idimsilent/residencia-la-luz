import Image from "next/image";
import Link from "next/link";
import { mediaPublicUrl, type MediaLite } from "@/features/media/url";

/** Logotipo: imagen subida desde el panel o, si no hay, marca tipográfica. */
export function Logo({ name, logo, light = false }: { name: string; logo: MediaLite | null; light?: boolean }) {
  return (
    <Link href="/" className="group inline-flex items-center gap-3" aria-label={`${name}, ir al inicio`}>
      {logo ? (
        <Image
          src={mediaPublicUrl(logo.storage_path)}
          alt=""
          width={logo.width ?? 160}
          height={logo.height ?? 48}
          className="h-11 w-auto"
          unoptimized={logo.mime_type === "image/svg+xml"}
          priority
        />
      ) : (
        <span
          aria-hidden="true"
          className="relative flex h-11 w-11 items-center justify-center rounded-full bg-primary/12 text-primary transition-transform duration-500 group-hover:rotate-12"
        >
          <svg viewBox="0 0 40 40" className="h-7 w-7" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round">
            <circle cx="20" cy="17" r="6" />
            <path d="M20 5v3M20 26v0M9.5 9.5l2 2M30.5 9.5l-2 2M6 17h3M31 17h3" />
            <path d="M8 31c4-4 8-5 12-5s8 1 12 5" />
          </svg>
        </span>
      )}
      <span className={`font-heading text-xl leading-tight ${light ? "text-white" : "text-header-ink"}`}>{name}</span>
    </Link>
  );
}
