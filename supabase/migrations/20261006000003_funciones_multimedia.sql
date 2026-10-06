-- =============================================================================
-- Residencia la Luz · Migración 3: sustitución segura de imágenes en uso
-- =============================================================================

-- Sustituye todas las referencias a una imagen por otra (noticias, eventos,
-- servicios, galería, bloques de página y configuración). Security invoker:
-- las políticas RLS exigen rol de administración para cada actualización.
create or replace function public.replace_media(p_from uuid, p_to uuid)
returns void
language plpgsql
security invoker
set search_path = ''
as $$
declare
  v_from_path text;
  v_to_path text;
begin
  if not public.is_staff() then
    raise exception 'permiso denegado' using errcode = '42501';
  end if;
  if p_from = p_to then
    return;
  end if;
  select storage_path into v_from_path from public.media where id = p_from;
  select storage_path into v_to_path from public.media where id = p_to;
  if v_from_path is null or v_to_path is null then
    raise exception 'imagen no encontrada' using errcode = 'P0002';
  end if;

  update public.news_posts set featured_media_id = p_to where featured_media_id = p_from;
  update public.news_posts set content_html = replace(content_html, v_from_path, v_to_path)
    where content_html like '%' || v_from_path || '%';
  -- Evita duplicados en la tabla de fotos de noticias.
  delete from public.news_post_media a
    where a.media_id = p_from
      and exists (select 1 from public.news_post_media b where b.post_id = a.post_id and b.media_id = p_to);
  update public.news_post_media set media_id = p_to where media_id = p_from;

  update public.events set media_id = p_to where media_id = p_from;
  update public.events set description_html = replace(description_html, v_from_path, v_to_path)
    where description_html like '%' || v_from_path || '%';
  update public.services set media_id = p_to where media_id = p_from;
  update public.services set content_html = replace(content_html, v_from_path, v_to_path)
    where content_html like '%' || v_from_path || '%';
  update public.gallery_items set media_id = p_to where media_id = p_from;
  update public.pages set og_media_id = p_to where og_media_id = p_from;

  -- Bloques en borrador y publicados (el id aparece dentro de props).
  update public.page_blocks
     set props = replace(props::text, p_from::text, p_to::text)::jsonb
   where props::text like '%' || p_from::text || '%';

  update public.site_settings set logo_media_id = p_to where logo_media_id = p_from;
  update public.site_settings set favicon_media_id = p_to where favicon_media_id = p_from;
  update public.site_settings set og_media_id = p_to where og_media_id = p_from;
end;
$$;

revoke execute on function public.replace_media(uuid, uuid) from public, anon;
grant execute on function public.replace_media(uuid, uuid) to authenticated;

-- page_blocks solo admite insert/delete del borrador por RLS; para sustituir
-- imágenes también en bloques publicados se permite UPDATE al personal.
create policy "staff actualiza props de bloques" on public.page_blocks
  for update to authenticated
  using ((select public.is_staff()))
  with check ((select public.is_staff()));
