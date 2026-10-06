import { NextResponse, type NextRequest } from "next/server";
import { randomUUID } from "node:crypto";
import { requireStaffAction, AuthorizationError } from "@/features/auth/session";
import { ALLOWED_TYPES, MAX_UPLOAD_BYTES, safeBaseName, sniffImageType, titleFromFileName } from "@/features/media/validation";
import { MEDIA_LITE_COLUMNS } from "@/features/media/url";
import { env } from "@/lib/env";

/**
 * Subida de imágenes al almacenamiento de Supabase.
 * Seguridad: sesión + rol en servidor, comprobación de origen (CSRF),
 * tamaño máximo, tipo real por firma de bytes y nombre generado en servidor.
 * La política RLS del bucket vuelve a exigir rol de administración.
 */
export async function POST(request: NextRequest) {
  const origin = request.headers.get("origin");
  const host = request.headers.get("host");
  const allowedOrigins = new Set([env.siteUrl, host ? `${request.nextUrl.protocol}//${host}` : ""]);
  if (!origin || !allowedOrigins.has(origin)) {
    return NextResponse.json({ error: "Origen no permitido." }, { status: 403 });
  }

  let ctx;
  try {
    ctx = await requireStaffAction();
  } catch (e) {
    const message = e instanceof AuthorizationError ? e.message : "No autorizado.";
    return NextResponse.json({ error: message }, { status: 401 });
  }

  const length = Number(request.headers.get("content-length") ?? 0);
  if (length > MAX_UPLOAD_BYTES + 1024 * 64) {
    return NextResponse.json({ error: "La imagen supera el tamaño máximo de 8 MB." }, { status: 413 });
  }

  let form: FormData;
  try {
    form = await request.formData();
  } catch {
    return NextResponse.json({ error: "Envío no válido." }, { status: 400 });
  }
  const file = form.get("file");
  if (!(file instanceof File)) return NextResponse.json({ error: "No se ha recibido ningún archivo." }, { status: 400 });
  if (file.size === 0 || file.size > MAX_UPLOAD_BYTES) {
    return NextResponse.json({ error: "La imagen supera el tamaño máximo de 8 MB." }, { status: 413 });
  }

  const bytes = new Uint8Array(await file.arrayBuffer());
  const mime = sniffImageType(bytes);
  if (!mime) {
    return NextResponse.json({ error: "Formato no admitido. Usa JPG, PNG, WebP o AVIF." }, { status: 415 });
  }

  const width = Number(form.get("width"));
  const height = Number(form.get("height"));
  const dim = (n: number) => (Number.isInteger(n) && n > 0 && n <= 20000 ? n : null);
  const alt = String(form.get("alt") ?? "").slice(0, 300);

  const now = new Date();
  const path = `uploads/${now.getUTCFullYear()}/${String(now.getUTCMonth() + 1).padStart(2, "0")}/${randomUUID()}-${safeBaseName(file.name)}.${ALLOWED_TYPES[mime]}`;

  const { error: uploadError } = await ctx.supabase.storage.from("media").upload(path, bytes, {
    contentType: mime,
    cacheControl: "31536000",
    upsert: false,
  });
  if (uploadError) {
    console.error("[media] upload", uploadError.message);
    return NextResponse.json({ error: "No se ha podido guardar la imagen." }, { status: 500 });
  }

  const { data, error } = await ctx.supabase
    .from("media")
    .insert({
      storage_path: path,
      file_name: file.name.slice(0, 200),
      title: titleFromFileName(file.name),
      alt_text: alt,
      mime_type: mime,
      size_bytes: bytes.byteLength,
      width: dim(width),
      height: dim(height),
      created_by: ctx.user.id,
    })
    .select(MEDIA_LITE_COLUMNS)
    .single();
  if (error) {
    await ctx.supabase.storage.from("media").remove([path]);
    console.error("[media] insert", error.code);
    return NextResponse.json({ error: "No se ha podido registrar la imagen." }, { status: 500 });
  }
  return NextResponse.json({ media: data });
}
