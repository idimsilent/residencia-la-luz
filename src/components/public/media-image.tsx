import Image from "next/image";
import { mediaPublicUrl, type MediaLite } from "@/features/media/url";
import { cn } from "@/lib/utils";

type Props = {
  media: MediaLite | null | undefined;
  /** Texto alternativo si el recurso no lo tiene (se recomienda rellenarlo siempre). */
  fallbackAlt?: string;
  className?: string;
  sizes?: string;
  priority?: boolean;
  fill?: boolean;
  placeholderLabel?: string;
};

/**
 * Imagen optimizada (next/image): formatos modernos, tamaños adaptados y
 * carga diferida salvo que sea prioritaria (hero).
 */
export function MediaImage({ media, fallbackAlt = "", className, sizes = "100vw", priority, fill = true, placeholderLabel }: Props) {
  if (!media) {
    return (
      <div
        className={cn("flex h-full w-full items-center justify-center bg-surface-alt text-sm text-muted", className)}
        role="img"
        aria-label={placeholderLabel ?? "Imagen pendiente"}
      >
        <span className="px-4 text-center">{placeholderLabel ?? "Imagen pendiente"}</span>
      </div>
    );
  }
  const src = mediaPublicUrl(media.storage_path);
  const alt = media.alt_text || fallbackAlt;
  const unoptimized = media.mime_type === "image/svg+xml";
  if (fill) {
    return (
      <Image
        src={src}
        alt={alt}
        fill
        sizes={sizes}
        priority={priority}
        quality={80}
        unoptimized={unoptimized}
        className={cn("object-cover", className)}
      />
    );
  }
  return (
    <Image
      src={src}
      alt={alt}
      width={media.width ?? 1600}
      height={media.height ?? 1067}
      sizes={sizes}
      priority={priority}
      quality={80}
      unoptimized={unoptimized}
      className={className}
    />
  );
}
