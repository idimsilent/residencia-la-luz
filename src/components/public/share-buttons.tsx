"use client";

import { useState, useSyncExternalStore } from "react";
import { Check, Link2, Mail, Share2 } from "lucide-react";
import { SocialIcon } from "./social-icon";

/** Compartir sin scripts de terceros: enlaces directos y API nativa del móvil. */
export function ShareButtons({ url, title }: { url: string; title: string }) {
  const [copied, setCopied] = useState(false);
  const enc = encodeURIComponent;
  const canShare = useSyncExternalStore(
    () => () => undefined,
    () => "share" in navigator,
    () => false,
  );
  return (
    <div className="flex flex-wrap items-center gap-2">
      <span className="mr-1 text-sm font-semibold text-muted">Compartir:</span>
      {canShare ? (
        <button type="button" className="btn btn-secondary min-h-10 px-4 text-sm" onClick={() => navigator.share({ title, url }).catch(() => undefined)}>
          <Share2 className="h-4 w-4" aria-hidden="true" /> Compartir
        </button>
      ) : null}
      <a className="btn btn-secondary min-h-10 px-3" href={`https://wa.me/?text=${enc(`${title} ${url}`)}`} target="_blank" rel="noopener noreferrer">
        <svg viewBox="0 0 24 24" className="h-4 w-4" fill="currentColor" aria-hidden="true">
          <path d="M12 2a10 10 0 0 0-8.6 15.1L2 22l5-1.3A10 10 0 1 0 12 2zm0 18.2a8.2 8.2 0 0 1-4.2-1.2l-.3-.2-3 .8.8-2.9-.2-.3A8.2 8.2 0 1 1 12 20.2zm4.5-6.1c-.2-.1-1.5-.7-1.7-.8s-.4-.1-.6.1-.7.8-.8 1-.3.2-.5.1a6.7 6.7 0 0 1-3.3-2.9c-.3-.4.3-.4.7-1.3.1-.2 0-.3 0-.4l-.8-1.8c-.2-.5-.4-.4-.6-.4h-.5a1 1 0 0 0-.7.3 3 3 0 0 0-.9 2.2 5.2 5.2 0 0 0 1.1 2.7 11.8 11.8 0 0 0 4.5 4c1.7.7 2.3.8 3.2.6a2.7 2.7 0 0 0 1.8-1.3 2.2 2.2 0 0 0 .2-1.3c-.1-.1-.3-.2-.5-.3z" />
        </svg>
        <span className="sr-only">WhatsApp</span>
      </a>
      <a className="btn btn-secondary min-h-10 px-3" href={`https://www.facebook.com/sharer/sharer.php?u=${enc(url)}`} target="_blank" rel="noopener noreferrer">
        <SocialIcon network="facebook" className="h-4 w-4" />
        <span className="sr-only">Facebook</span>
      </a>
      <a className="btn btn-secondary min-h-10 px-3" href={`mailto:?subject=${enc(title)}&body=${enc(url)}`}>
        <Mail className="h-4 w-4" aria-hidden="true" />
        <span className="sr-only">Correo electrónico</span>
      </a>
      <button
        type="button"
        className="btn btn-secondary min-h-10 px-4 text-sm"
        onClick={async () => {
          try {
            await navigator.clipboard.writeText(url);
            setCopied(true);
            setTimeout(() => setCopied(false), 2500);
          } catch {
            setCopied(false);
          }
        }}
      >
        {copied ? <Check className="h-4 w-4" aria-hidden="true" /> : <Link2 className="h-4 w-4" aria-hidden="true" />}
        <span aria-live="polite">{copied ? "Enlace copiado" : "Copiar enlace"}</span>
      </button>
    </div>
  );
}
