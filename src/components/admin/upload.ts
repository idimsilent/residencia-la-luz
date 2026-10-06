"use client";

import type { MediaLite } from "@/features/media/url";

const MAX_DIMENSION = 2400;

async function loadImage(file: File): Promise<HTMLImageElement> {
  const url = URL.createObjectURL(file);
  try {
    const img = new Image();
    img.decoding = "async";
    img.src = url;
    await img.decode();
    return img;
  } finally {
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  }
}

/**
 * Optimiza en el navegador antes de subir: reduce fotos grandes del móvil a
 * un máximo de 2400 px (suficiente para pantallas grandes) y las recomprime.
 * El servidor vuelve a validar tipo y tamaño.
 */
export async function prepareImage(file: File): Promise<{ file: File; width: number; height: number }> {
  if (!/^image\/(jpeg|png|webp|avif)$/.test(file.type)) {
    throw new Error("Formato no admitido. Usa JPG, PNG, WebP o AVIF.");
  }
  let img: HTMLImageElement;
  try {
    img = await loadImage(file);
  } catch {
    throw new Error("No se ha podido leer la imagen.");
  }
  const { naturalWidth: w, naturalHeight: h } = img;
  const needsResize = Math.max(w, h) > MAX_DIMENSION || file.size > 3 * 1024 * 1024;
  if (!needsResize) return { file, width: w, height: h };

  const scale = Math.min(1, MAX_DIMENSION / Math.max(w, h));
  const cw = Math.round(w * scale);
  const ch = Math.round(h * scale);
  const canvas = document.createElement("canvas");
  canvas.width = cw;
  canvas.height = ch;
  const ctx = canvas.getContext("2d");
  if (!ctx) return { file, width: w, height: h };
  ctx.drawImage(img, 0, 0, cw, ch);
  const type = file.type === "image/png" ? "image/png" : "image/jpeg";
  const blob = await new Promise<Blob | null>((resolve) => canvas.toBlob(resolve, type, 0.85));
  if (!blob) return { file, width: w, height: h };
  const name = file.name.replace(/\.[^.]+$/, type === "image/png" ? ".png" : ".jpg");
  return { file: new File([blob], name, { type }), width: cw, height: ch };
}

export async function uploadImage(file: File, alt = ""): Promise<MediaLite> {
  const prepared = await prepareImage(file);
  const body = new FormData();
  body.set("file", prepared.file);
  body.set("width", String(prepared.width));
  body.set("height", String(prepared.height));
  body.set("alt", alt);
  const res = await fetch("/api/admin/media", { method: "POST", body });
  const json = (await res.json().catch(() => ({}))) as { media?: MediaLite; error?: string };
  if (!res.ok || !json.media) throw new Error(json.error ?? "No se ha podido subir la imagen.");
  return json.media;
}
