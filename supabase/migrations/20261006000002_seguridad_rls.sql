-- =============================================================================
-- Residencia la Luz · Migración 2: seguridad (RLS), funciones y almacenamiento
-- -----------------------------------------------------------------------------
-- Principios:
--   * Visitantes (anon) solo LEEN contenido publicado y datos públicos.
--   * Solo perfiles con rol 'admin' o 'editor' pueden escribir contenido.
--   * Configuración global, temas, menús, usuarios y registro: solo 'admin'.
--   * Registro de acciones mediante triggers (no se puede omitir desde la app).
-- =============================================================================

-- -----------------------------------------------------------------------------
-- Privilegios base: el rol anónimo nunca escribe.
-- -----------------------------------------------------------------------------
revoke insert, update, delete, truncate on all tables in schema public from anon;
alter default privileges in schema public revoke insert, update, delete, truncate on tables from anon;

-- Los perfiles solo se modifican mediante funciones controladas.
revoke insert, update, delete on public.profiles from authenticated;

-- Tablas internas sin acceso desde la API pública.
revoke all on public.rate_limit_hits from anon, authenticated;
revoke insert, update, delete on public.audit_log from authenticated;
revoke all on public.contact_messages from anon;
revoke insert on public.contact_messages from authenticated;

-- -----------------------------------------------------------------------------
-- Activar RLS en todas las tablas
-- -----------------------------------------------------------------------------
alter table public.profiles enable row level security;
alter table public.media enable row level security;
alter table public.gallery_categories enable row level security;
alter table public.gallery_items enable row level security;
alter table public.news_categories enable row level security;
alter table public.news_posts enable row level security;
alter table public.news_post_media enable row level security;
alter table public.event_categories enable row level security;
alter table public.events enable row level security;
alter table public.services enable row level security;
alter table public.testimonials enable row level security;
alter table public.pages enable row level security;
alter table public.page_revisions enable row level security;
alter table public.page_blocks enable row level security;
alter table public.themes enable row level security;
alter table public.site_settings enable row level security;
alter table public.menu_items enable row level security;
alter table public.contact_messages enable row level security;
alter table public.rate_limit_hits enable row level security;
alter table public.audit_log enable row level security;

-- -----------------------------------------------------------------------------
-- Perfiles
-- -----------------------------------------------------------------------------
create policy "perfil propio o admin" on public.profiles
  for select to authenticated
  using (id = (select auth.uid()) or (select public.is_admin()));

-- -----------------------------------------------------------------------------
-- Contenido con lectura pública condicionada
-- -----------------------------------------------------------------------------
-- Biblioteca multimedia: los metadatos (título, texto alternativo) son
-- necesarios para mostrar imágenes publicadas, y los ficheros ya son públicos.
create policy "lectura pública media" on public.media
  for select to anon, authenticated using (true);
create policy "staff gestiona media" on public.media
  for all to authenticated
  using ((select public.is_staff())) with check ((select public.is_staff()));

-- Categorías (públicas)
create policy "lectura pública categorías galería" on public.gallery_categories
  for select to anon, authenticated using (true);
create policy "staff gestiona categorías galería" on public.gallery_categories
  for all to authenticated
  using ((select public.is_staff())) with check ((select public.is_staff()));

create policy "lectura pública categorías noticias" on public.news_categories
  for select to anon, authenticated using (true);
create policy "staff gestiona categorías noticias" on public.news_categories
  for all to authenticated
  using ((select public.is_staff())) with check ((select public.is_staff()));

create policy "lectura pública categorías eventos" on public.event_categories
  for select to anon, authenticated using (true);
create policy "staff gestiona categorías eventos" on public.event_categories
  for all to authenticated
  using ((select public.is_staff())) with check ((select public.is_staff()));

-- Galería: solo elementos visibles
create policy "lectura pública galería visible" on public.gallery_items
  for select to anon, authenticated
  using (is_visible or (select public.is_staff()));
create policy "staff gestiona galería" on public.gallery_items
  for all to authenticated
  using ((select public.is_staff())) with check ((select public.is_staff()));

-- Noticias: publicadas y con fecha alcanzada (las programadas no se ven)
create policy "lectura pública noticias publicadas" on public.news_posts
  for select to anon, authenticated
  using (
    (status = 'published' and published_at <= now())
    or (select public.is_staff())
  );
create policy "staff gestiona noticias" on public.news_posts
  for all to authenticated
  using ((select public.is_staff())) with check ((select public.is_staff()));

create policy "lectura pública fotos de noticias" on public.news_post_media
  for select to anon, authenticated
  using (
    exists (
      select 1 from public.news_posts p
      where p.id = post_id and p.status = 'published' and p.published_at <= now()
    )
    or (select public.is_staff())
  );
create policy "staff gestiona fotos de noticias" on public.news_post_media
  for all to authenticated
  using ((select public.is_staff())) with check ((select public.is_staff()));

-- Eventos: solo publicados
create policy "lectura pública eventos publicados" on public.events
  for select to anon, authenticated
  using (status = 'published' or (select public.is_staff()));
create policy "staff gestiona eventos" on public.events
  for all to authenticated
  using ((select public.is_staff())) with check ((select public.is_staff()));

-- Servicios
create policy "lectura pública servicios publicados" on public.services
  for select to anon, authenticated
  using (status = 'published' or (select public.is_staff()));
create policy "staff gestiona servicios" on public.services
  for all to authenticated
  using ((select public.is_staff())) with check ((select public.is_staff()));

-- Testimonios: publicados Y con consentimiento confirmado
create policy "lectura pública testimonios autorizados" on public.testimonials
  for select to anon, authenticated
  using ((status = 'published' and consent_confirmed) or (select public.is_staff()));
create policy "staff gestiona testimonios" on public.testimonials
  for all to authenticated
  using ((select public.is_staff())) with check ((select public.is_staff()));

-- Páginas
create policy "lectura pública páginas publicadas" on public.pages
  for select to anon, authenticated
  using (status = 'published' or (select public.is_staff()));
create policy "staff edita páginas" on public.pages
  for update to authenticated
  using ((select public.is_staff())) with check ((select public.is_staff()));
create policy "staff crea páginas" on public.pages
  for insert to authenticated
  with check ((select public.is_staff()) and not is_system);
-- Las páginas de sistema no se pueden borrar.
create policy "admin borra páginas no sistema" on public.pages
  for delete to authenticated
  using ((select public.is_admin()) and not is_system);

create policy "lectura pública revisión publicada" on public.page_revisions
  for select to anon, authenticated
  using (
    exists (
      select 1 from public.pages p
      where p.published_revision_id = page_revisions.id and p.status = 'published'
    )
    or (select public.is_staff())
  );
-- Las revisiones se crean solo mediante publish_page().

create policy "lectura pública bloques publicados" on public.page_blocks
  for select to anon, authenticated
  using (
    (
      revision_id is not null
      and not is_hidden
      and exists (
        select 1 from public.pages p
        where p.id = page_blocks.page_id
          and p.published_revision_id = page_blocks.revision_id
          and p.status = 'published'
      )
    )
    or (select public.is_staff())
  );
-- Los bloques se escriben solo mediante save_page_draft()/publish_page().

-- Temas: el público solo lee el tema activo
create policy "lectura pública tema activo" on public.themes
  for select to anon, authenticated
  using (is_active or (select public.is_staff()));
create policy "admin gestiona temas" on public.themes
  for all to authenticated
  using ((select public.is_admin())) with check ((select public.is_admin()));

-- Configuración general
create policy "lectura pública configuración" on public.site_settings
  for select to anon, authenticated using (true);
create policy "admin edita configuración" on public.site_settings
  for update to authenticated
  using ((select public.is_admin())) with check ((select public.is_admin()));

-- Menús
create policy "lectura pública menú visible" on public.menu_items
  for select to anon, authenticated
  using (is_visible or (select public.is_staff()));
create policy "admin gestiona menú" on public.menu_items
  for all to authenticated
  using ((select public.is_admin())) with check ((select public.is_admin()));

-- Mensajes de contacto: solo personal autorizado. La inserción se hace desde
-- el servidor con la service role tras validar y limitar envíos.
create policy "staff lee mensajes" on public.contact_messages
  for select to authenticated using ((select public.is_staff()));
create policy "staff actualiza mensajes" on public.contact_messages
  for update to authenticated
  using ((select public.is_staff())) with check ((select public.is_staff()));
create policy "admin borra mensajes" on public.contact_messages
  for delete to authenticated using ((select public.is_admin()));

-- Registro de acciones: solo lectura para administradores
create policy "admin lee registro" on public.audit_log
  for select to authenticated using ((select public.is_admin()));

-- rate_limit_hits: sin políticas => inaccesible salvo service role.

-- -----------------------------------------------------------------------------
-- Registro automático de acciones administrativas
-- -----------------------------------------------------------------------------
create or replace function public.log_admin_action()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_row jsonb;
  v_summary text;
begin
  if tg_op = 'DELETE' then
    v_row := to_jsonb(old);
  else
    v_row := to_jsonb(new);
  end if;

  v_summary := coalesce(v_row ->> 'title', v_row ->> 'name', v_row ->> 'label', v_row ->> 'file_name');

  -- Evita registrar cambios de status idénticos repetidos sin interés.
  insert into public.audit_log (actor_id, action, entity_type, entity_id, summary)
  values (
    (select auth.uid()),
    case tg_op
      when 'INSERT' then 'create'
      when 'UPDATE' then
        case
          when (to_jsonb(old) ->> 'status') is distinct from (v_row ->> 'status')
            then 'status:' || coalesce(v_row ->> 'status', '')
          else 'update'
        end
      else 'delete'
    end,
    tg_table_name,
    v_row ->> 'id',
    left(v_summary, 200)
  );
  return null;
end;
$$;

do $$
declare
  t text;
begin
  foreach t in array array[
    'news_posts', 'events', 'services', 'media', 'gallery_items', 'pages',
    'themes', 'site_settings', 'menu_items', 'testimonials',
    'news_categories', 'event_categories', 'gallery_categories', 'contact_messages'
  ]
  loop
    execute format(
      'create trigger %I after insert or update or delete on public.%I
         for each row execute function public.log_admin_action()',
      t || '_audit', t
    );
  end loop;
end;
$$;

-- -----------------------------------------------------------------------------
-- Gestión de roles (solo admins). Impide quedarse sin administradores.
-- -----------------------------------------------------------------------------
create or replace function public.set_user_role(p_user_id uuid, p_role public.app_role)
returns void
language plpgsql
security definer
set search_path = ''
as $$
begin
  if not public.is_admin() then
    raise exception 'permiso denegado' using errcode = '42501';
  end if;

  if p_role is distinct from 'admin'
     and exists (select 1 from public.profiles where id = p_user_id and role = 'admin')
     and (select count(*) from public.profiles where role = 'admin') <= 1 then
    raise exception 'debe existir al menos un administrador' using errcode = 'P0001';
  end if;

  update public.profiles set role = p_role where id = p_user_id;

  insert into public.audit_log (actor_id, action, entity_type, entity_id, summary)
  values ((select auth.uid()), 'role:' || coalesce(p_role::text, 'none'), 'profiles', p_user_id::text, null);
end;
$$;
revoke execute on function public.set_user_role(uuid, public.app_role) from public, anon;
grant execute on function public.set_user_role(uuid, public.app_role) to authenticated;

-- Perfil: el propio usuario puede cambiar su nombre visible.
create or replace function public.update_own_profile(p_full_name text)
returns void
language plpgsql
security definer
set search_path = ''
as $$
begin
  if (select auth.uid()) is null then
    raise exception 'permiso denegado' using errcode = '42501';
  end if;
  update public.profiles
     set full_name = left(nullif(trim(p_full_name), ''), 120)
   where id = (select auth.uid());
end;
$$;
revoke execute on function public.update_own_profile(text) from public, anon;
grant execute on function public.update_own_profile(text) to authenticated;

-- -----------------------------------------------------------------------------
-- Páginas por bloques: guardar borrador, publicar, descartar
-- -----------------------------------------------------------------------------
-- p_blocks: [{ "type": "...", "props": {...}, "isHidden": false,
--              "visibility": {...}, "schemaVersion": 1 }, ...]
-- La validación del contenido de cada bloque se hace en la app (zod) antes.
create or replace function public.save_page_draft(p_page_id uuid, p_blocks jsonb)
returns void
language plpgsql
security invoker
set search_path = ''
as $$
begin
  if not public.is_staff() then
    raise exception 'permiso denegado' using errcode = '42501';
  end if;
  if jsonb_typeof(p_blocks) <> 'array' or jsonb_array_length(p_blocks) > 60 then
    raise exception 'formato de bloques no válido' using errcode = '22023';
  end if;

  delete from public.page_blocks where page_id = p_page_id and revision_id is null;

  insert into public.page_blocks (page_id, revision_id, position, type, schema_version, props, is_hidden, visibility)
  select
    p_page_id,
    null,
    (b.ord - 1)::int,
    b.value ->> 'type',
    coalesce((b.value ->> 'schemaVersion')::int, 1),
    coalesce(b.value -> 'props', '{}'::jsonb),
    coalesce((b.value ->> 'isHidden')::boolean, false),
    coalesce(b.value -> 'visibility', '{"desktop": true, "tablet": true, "mobile": true}'::jsonb)
  from jsonb_array_elements(p_blocks) with ordinality as b(value, ord);

  update public.pages
     set has_unpublished_changes = true, draft_updated_at = now()
   where id = p_page_id;
end;
$$;

create or replace function public.publish_page(p_page_id uuid, p_note text default null)
returns uuid
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_revision_id uuid;
  v_version int;
begin
  if not public.is_staff() then
    raise exception 'permiso denegado' using errcode = '42501';
  end if;
  if not exists (select 1 from public.pages where id = p_page_id) then
    raise exception 'página no encontrada' using errcode = 'P0002';
  end if;

  select coalesce(max(version), 0) + 1 into v_version
    from public.page_revisions where page_id = p_page_id;

  insert into public.page_revisions (page_id, version, schema_version, note, created_by)
  values (p_page_id, v_version, 1, left(p_note, 200), (select auth.uid()))
  returning id into v_revision_id;

  insert into public.page_blocks (page_id, revision_id, position, type, schema_version, props, is_hidden, visibility)
  select page_id, v_revision_id, position, type, schema_version, props, is_hidden, visibility
    from public.page_blocks
   where page_id = p_page_id and revision_id is null
   order by position;

  update public.pages
     set published_revision_id = v_revision_id,
         status = 'published',
         has_unpublished_changes = false
   where id = p_page_id;

  insert into public.audit_log (actor_id, action, entity_type, entity_id, summary)
  values ((select auth.uid()), 'publish', 'pages', p_page_id::text, 'versión ' || v_version);

  return v_revision_id;
end;
$$;

create or replace function public.discard_page_draft(p_page_id uuid)
returns void
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_rev uuid;
begin
  if not public.is_staff() then
    raise exception 'permiso denegado' using errcode = '42501';
  end if;
  select published_revision_id into v_rev from public.pages where id = p_page_id;
  if v_rev is null then
    raise exception 'la página no tiene una versión publicada' using errcode = 'P0001';
  end if;

  delete from public.page_blocks where page_id = p_page_id and revision_id is null;
  insert into public.page_blocks (page_id, revision_id, position, type, schema_version, props, is_hidden, visibility)
  select page_id, null, position, type, schema_version, props, is_hidden, visibility
    from public.page_blocks where revision_id = v_rev order by position;

  update public.pages set has_unpublished_changes = false where id = p_page_id;
end;
$$;

-- Restaurar una revisión anterior como borrador.
create or replace function public.restore_page_revision(p_revision_id uuid)
returns void
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_page uuid;
begin
  if not public.is_staff() then
    raise exception 'permiso denegado' using errcode = '42501';
  end if;
  select page_id into v_page from public.page_revisions where id = p_revision_id;
  if v_page is null then
    raise exception 'revisión no encontrada' using errcode = 'P0002';
  end if;
  delete from public.page_blocks where page_id = v_page and revision_id is null;
  insert into public.page_blocks (page_id, revision_id, position, type, schema_version, props, is_hidden, visibility)
  select page_id, null, position, type, schema_version, props, is_hidden, visibility
    from public.page_blocks where revision_id = p_revision_id order by position;
  update public.pages set has_unpublished_changes = true, draft_updated_at = now() where id = v_page;
end;
$$;

revoke execute on function public.save_page_draft(uuid, jsonb) from public, anon;
revoke execute on function public.publish_page(uuid, text) from public, anon;
revoke execute on function public.discard_page_draft(uuid) from public, anon;
revoke execute on function public.restore_page_revision(uuid) from public, anon;
grant execute on function public.save_page_draft(uuid, jsonb) to authenticated;
grant execute on function public.publish_page(uuid, text) to authenticated;
grant execute on function public.discard_page_draft(uuid) to authenticated;
grant execute on function public.restore_page_revision(uuid) to authenticated;

-- save_page_draft es security invoker: necesita permisos sobre page_blocks.
create policy "staff escribe bloques borrador" on public.page_blocks
  for insert to authenticated
  with check ((select public.is_staff()) and revision_id is null);
create policy "staff borra bloques borrador" on public.page_blocks
  for delete to authenticated
  using ((select public.is_staff()) and revision_id is null);

-- -----------------------------------------------------------------------------
-- Temas: activar y publicar de forma atómica
-- -----------------------------------------------------------------------------
create or replace function public.activate_theme(p_theme_id uuid)
returns void
language plpgsql
security definer
set search_path = ''
as $$
begin
  if not public.is_admin() then
    raise exception 'permiso denegado' using errcode = '42501';
  end if;
  if not exists (select 1 from public.themes where id = p_theme_id) then
    raise exception 'tema no encontrado' using errcode = 'P0002';
  end if;
  update public.themes set is_active = false where is_active and id <> p_theme_id;
  update public.themes set is_active = true where id = p_theme_id;
end;
$$;
revoke execute on function public.activate_theme(uuid) from public, anon;
grant execute on function public.activate_theme(uuid) to authenticated;

-- -----------------------------------------------------------------------------
-- Limitación de intentos (solo service role)
-- -----------------------------------------------------------------------------
create or replace function public.check_rate_limit(
  p_bucket text, p_key_hash text, p_max integer, p_window_seconds integer
)
returns boolean
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_count integer;
begin
  -- Limpieza oportunista de registros antiguos.
  delete from public.rate_limit_hits where created_at < now() - interval '1 day';

  select count(*) into v_count
    from public.rate_limit_hits
   where bucket = p_bucket and key_hash = p_key_hash
     and created_at > now() - make_interval(secs => p_window_seconds);

  if v_count >= p_max then
    return false;
  end if;

  insert into public.rate_limit_hits (bucket, key_hash) values (p_bucket, p_key_hash);
  return true;
end;
$$;

create or replace function public.clear_rate_limit(p_bucket text, p_key_hash text)
returns void
language sql
security definer
set search_path = ''
as $$
  delete from public.rate_limit_hits where bucket = p_bucket and key_hash = p_key_hash;
$$;

revoke execute on function public.check_rate_limit(text, text, integer, integer) from public, anon, authenticated;
revoke execute on function public.clear_rate_limit(text, text) from public, anon, authenticated;
grant execute on function public.check_rate_limit(text, text, integer, integer) to service_role;
grant execute on function public.clear_rate_limit(text, text) to service_role;

-- Las funciones de autorización pueden llamarse por cualquiera (devuelven
-- false sin sesión), pero no exponen datos.
revoke execute on function public.handle_new_user() from public, anon, authenticated;
revoke execute on function public.log_admin_action() from public, anon, authenticated;

-- -----------------------------------------------------------------------------
-- Uso de recursos multimedia (para avisar antes de borrar)
-- -----------------------------------------------------------------------------
create or replace view public.media_usage
with (security_invoker = true)
as
  select n.featured_media_id as media_id, 'news'::text as kind, n.id as ref_id, n.title as ref_title
    from public.news_posts n where n.featured_media_id is not null
  union all
  select m.id, 'news', n.id, n.title
    from public.media m join public.news_posts n on n.content_html like '%' || m.storage_path || '%'
  union all
  select pm.media_id, 'news', pm.post_id, n.title
    from public.news_post_media pm join public.news_posts n on n.id = pm.post_id
  union all
  select e.media_id, 'event', e.id, e.title from public.events e where e.media_id is not null
  union all
  select m.id, 'event', e.id, e.title
    from public.media m join public.events e on e.description_html like '%' || m.storage_path || '%'
  union all
  select s.media_id, 'service', s.id, s.title from public.services s where s.media_id is not null
  union all
  select m.id, 'service', s.id, s.title
    from public.media m join public.services s on s.content_html like '%' || m.storage_path || '%'
  union all
  select g.media_id, 'gallery', g.id, coalesce(nullif(g.caption, ''), 'Galería') from public.gallery_items g
  union all
  select distinct m.id, 'page', p.id, p.title
    from public.media m
    join public.page_blocks b on b.props::text like '%' || m.id::text || '%'
    join public.pages p on p.id = b.page_id
   where b.revision_id is null or b.revision_id = p.published_revision_id
  union all
  select p.og_media_id, 'page', p.id, p.title from public.pages p where p.og_media_id is not null
  union all
  select ss.logo_media_id, 'settings', null::uuid, 'Logotipo' from public.site_settings ss where ss.logo_media_id is not null
  union all
  select ss.favicon_media_id, 'settings', null::uuid, 'Favicon' from public.site_settings ss where ss.favicon_media_id is not null
  union all
  select ss.og_media_id, 'settings', null::uuid, 'Imagen para redes sociales' from public.site_settings ss where ss.og_media_id is not null;

revoke all on public.media_usage from anon;
grant select on public.media_usage to authenticated;

-- -----------------------------------------------------------------------------
-- Almacenamiento: bucket público de imágenes, escritura solo staff
-- -----------------------------------------------------------------------------
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('media', 'media', true, 8388608, array['image/jpeg', 'image/png', 'image/webp', 'image/avif'])
on conflict (id) do update
  set public = excluded.public,
      file_size_limit = excluded.file_size_limit,
      allowed_mime_types = excluded.allowed_mime_types;

create policy "staff sube imágenes" on storage.objects
  for insert to authenticated
  with check (bucket_id = 'media' and (select public.is_staff()));
create policy "staff actualiza imágenes" on storage.objects
  for update to authenticated
  using (bucket_id = 'media' and (select public.is_staff()))
  with check (bucket_id = 'media' and (select public.is_staff()));
create policy "staff borra imágenes" on storage.objects
  for delete to authenticated
  using (bucket_id = 'media' and (select public.is_staff()));
create policy "staff lista imágenes" on storage.objects
  for select to authenticated
  using (bucket_id = 'media' and (select public.is_staff()));
