"use client";

import { useState } from "react";
import { Play } from "lucide-react";

/**
 * Vídeo con carga diferida: no se conecta con YouTube/Vimeo hasta que la
 * persona pulsa reproducir (sin cookies ni peticiones previas). Solo se
 * acepta el identificador del vídeo, nunca código de inserción.
 */
export function VideoEmbed({ provider, videoId, title }: { provider: "youtube" | "vimeo"; videoId: string; title: string }) {
  const [active, setActive] = useState(false);
  const src =
    provider === "youtube"
      ? `https://www.youtube-nocookie.com/embed/${encodeURIComponent(videoId)}?autoplay=1&rel=0`
      : `https://player.vimeo.com/video/${encodeURIComponent(videoId)}?autoplay=1&dnt=1`;
  return (
    <div className="relative aspect-video overflow-hidden rounded-theme bg-[#1f2420]">
      {active ? (
        <iframe
          src={src}
          title={title}
          className="absolute inset-0 h-full w-full"
          allow="autoplay; encrypted-media; picture-in-picture; fullscreen"
          referrerPolicy="strict-origin-when-cross-origin"
          loading="lazy"
        />
      ) : (
        <button
          type="button"
          onClick={() => setActive(true)}
          className="group absolute inset-0 flex flex-col items-center justify-center gap-4 text-white"
        >
          <span className="inline-flex h-20 w-20 items-center justify-center rounded-full bg-white/15 backdrop-blur transition group-hover:scale-105 group-hover:bg-white/25">
            <Play className="h-9 w-9 translate-x-0.5" aria-hidden="true" />
          </span>
          <span className="font-semibold">Reproducir vídeo: {title}</span>
          <span className="max-w-sm px-4 text-center text-xs opacity-75">
            Al reproducirlo se cargará contenido de {provider === "youtube" ? "YouTube" : "Vimeo"}.
          </span>
        </button>
      )}
    </div>
  );
}
