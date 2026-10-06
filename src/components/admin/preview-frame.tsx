"use client";

import { useEffect, useLayoutEffect, useRef, useState, type ReactNode } from "react";
import { createPortal } from "react-dom";
import { Monitor, Smartphone, Tablet } from "lucide-react";
import type { ThemeTokens } from "@/features/theme/schema";
import { themeDataAttributes, themeToCss } from "@/features/theme/css";
import { cn } from "@/lib/utils";

export type Device = "desktop" | "tablet" | "mobile";
export const DEVICE_WIDTH: Record<Device, number> = { desktop: 1280, tablet: 820, mobile: 390 };

export function DeviceSwitch({ value, onChange }: { value: Device; onChange: (d: Device) => void }) {
  const opts: { key: Device; label: string; icon: typeof Monitor }[] = [
    { key: "desktop", label: "Ordenador", icon: Monitor },
    { key: "tablet", label: "Tableta", icon: Tablet },
    { key: "mobile", label: "Móvil", icon: Smartphone },
  ];
  return (
    <div className="flex rounded-lg bg-stone-100 p-0.5" role="group" aria-label="Tamaño de la vista previa">
      {opts.map(({ key, label, icon: I }) => (
        <button
          key={key}
          type="button"
          onClick={() => onChange(key)}
          aria-pressed={value === key}
          title={label}
          aria-label={label}
          className={cn("rounded-md p-1.5 text-stone-600", value === key && "bg-white text-stone-900 shadow-sm")}
        >
          <I className="h-4 w-4" aria-hidden="true" />
        </button>
      ))}
    </div>
  );
}

/**
 * Vista previa aislada en un iframe: los estilos de la web pública se copian
 * dentro y los contenidos se pintan con un portal de React. Así las reglas
 * responsive (móvil/tableta) funcionan con el ancho real del dispositivo y los
 * cambios se ven al instante, sin guardar.
 */
export function PreviewFrame({ device, theme, children, minHeight = 600 }: { device: Device; theme: ThemeTokens; children: ReactNode; minHeight?: number }) {
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const outerRef = useRef<HTMLDivElement>(null);
  const [mount, setMount] = useState<HTMLElement | null>(null);
  const [scale, setScale] = useState(1);
  const [height, setHeight] = useState(minHeight);
  const width = DEVICE_WIDTH[device];

  // Prepara el documento del iframe (estilos, fuentes y clase raíz).
  useEffect(() => {
    const iframe = iframeRef.current;
    if (!iframe) return;
    const setup = () => {
      const doc = iframe.contentDocument;
      if (!doc) return;
      doc.documentElement.lang = "es";
      doc.documentElement.className = document.documentElement.className.replace(/\bjs\b/, "");
      doc.head.innerHTML = '<meta charset="utf-8"><base target="_blank">';
      document.querySelectorAll('link[rel="stylesheet"], style').forEach((node) => doc.head.appendChild(node.cloneNode(true)));
      doc.body.style.margin = "0";
      let root = doc.getElementById("preview-root");
      if (!root) {
        root = doc.createElement("div");
        root.id = "preview-root";
        doc.body.appendChild(root);
      }
      // Ningún enlace navega desde la vista previa.
      doc.addEventListener("click", (e) => {
        const a = (e.target as HTMLElement | null)?.closest("a, button[type=submit]");
        if (a) e.preventDefault();
      }, true);
      setMount(root);
    };
    if (iframe.contentDocument?.readyState === "complete") setup();
    iframe.addEventListener("load", setup);
    return () => iframe.removeEventListener("load", setup);
  }, []);

  // Escala para que el ancho del dispositivo quepa en el panel.
  useLayoutEffect(() => {
    const el = outerRef.current;
    if (!el) return;
    const ro = new ResizeObserver(() => setScale(Math.min(1, el.clientWidth / width)));
    ro.observe(el);
    return () => ro.disconnect();
  }, [width]);

  // Altura del contenido.
  useEffect(() => {
    if (!mount) return;
    const ro = new ResizeObserver(() => setHeight(Math.max(minHeight, mount.scrollHeight)));
    ro.observe(mount);
    return () => ro.disconnect();
  }, [mount, minHeight]);

  return (
    <div ref={outerRef} className="w-full overflow-hidden">
      <div style={{ height: height * scale, width: width * scale }} className="mx-auto overflow-hidden rounded-xl border border-stone-200 bg-white shadow-sm">
        <iframe
          ref={iframeRef}
          title="Vista previa"
          srcDoc="<!doctype html><html><head></head><body></body></html>"
          style={{ width, height, transform: `scale(${scale})`, transformOrigin: "0 0", border: 0, display: "block" }}
        />
      </div>
      {mount
        ? createPortal(
            <div {...themeDataAttributes(theme)} className="flex min-h-full flex-col bg-background text-ink">
              <style dangerouslySetInnerHTML={{ __html: themeToCss(theme, ":root") }} />
              {children}
            </div>,
            mount,
          )
        : null}
    </div>
  );
}
