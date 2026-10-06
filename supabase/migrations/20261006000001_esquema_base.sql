-- =============================================================================
-- Residencia la Luz · Migración 1: esquema base
-- -----------------------------------------------------------------------------
-- Tablas principales del CMS, tipos enumerados, índices y triggers de
-- marcas de tiempo. Las políticas RLS están en la migración 2.
-- =============================================================================

create extension if not exists "pgcrypto" with schema extensions;
create extension if not exists "unaccent" with schema extensions;

-- -----------------------------------------------------------------------------
-- Tipos
-- -----------------------------------------------------------------------------
create type public.app_role as enum ('admin', 'editor');
create type public.news_status as enum ('draft', 'published', 'archived');
create type public.publish_status as enum ('draft', 'published');
create type public.menu_location as enum ('header', 'footer', 'legal');
create type public.message_status as enum ('new', 'read', 'archived');

-- -----------------------------------------------------------------------------
-- Utilidades
-- -----------------------------------------------------------------------------
create or replace function public.set_updated_at()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  new.updated_at := now();
  return new;
end;
$$;

-- Slug válido: minúsculas, números y guiones. Se valida también en la app.
create domain public.slug as text
  check (value ~ '^[a-z0-9]+(?:-[a-z0-9]+)*$' and char_length(value) <= 120);

-- Color hexadecimal #rrggbb
create domain public.hex_color as text
  check (value ~ '^#[0-9a-fA-F]{6}$');

-- -----------------------------------------------------------------------------
-- Perfiles y roles
-- -----------------------------------------------------------------------------
-- Cada usuario de Supabase Auth tiene un perfil. El rol es NULL por defecto:
-- una cuenta sin rol no tiene ningún permiso administrativo. Los roles solo
-- pueden asignarse desde SQL (service role / editor SQL) o por otro admin.
create table public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  email text not null,
  full_name text,
  role public.app_role,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
comment on table public.profiles is 'Perfil de cada cuenta de Auth. role NULL = sin permisos.';

create trigger profiles_updated_at before update on public.profiles
  for each row execute function public.set_updated_at();

-- Crea el perfil automáticamente (sin rol) al crear un usuario en Auth.
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  insert into public.profiles (id, email, full_name)
  values (new.id, coalesce(new.email, ''), new.raw_user_meta_data ->> 'full_name')
  on conflict (id) do nothing;
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- Funciones de autorización (usadas por las políticas RLS).
create or replace function public.current_role_name()
returns public.app_role
language sql
stable
security definer
set search_path = ''
as $$
  select role from public.profiles where id = (select auth.uid());
$$;

create or replace function public.is_staff()
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1 from public.profiles
    where id = (select auth.uid()) and role in ('admin', 'editor')
  );
$$;

create or replace function public.is_admin()
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1 from public.profiles
    where id = (select auth.uid()) and role = 'admin'
  );
$$;

-- -----------------------------------------------------------------------------
-- Biblioteca multimedia
-- -----------------------------------------------------------------------------
create table public.media (
  id uuid primary key default gen_random_uuid(),
  storage_path text not null unique,
  file_name text not null,
  title text not null default '',
  alt_text text not null default '',
  description text not null default '',
  mime_type text not null check (mime_type in ('image/jpeg', 'image/png', 'image/webp', 'image/avif', 'image/svg+xml')),
  size_bytes integer not null check (size_bytes > 0 and size_bytes <= 10485760),
  width integer check (width is null or width > 0),
  height integer check (height is null or height > 0),
  tags text[] not null default '{}',
  is_demo boolean not null default false,
  created_by uuid references public.profiles (id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
comment on table public.media is 'Recursos multimedia almacenados en el bucket "media".';
comment on column public.media.is_demo is 'Imagen de demostración incluida con el proyecto; sustituir por fotos reales.';
create index media_created_at_idx on public.media (created_at desc);
create index media_tags_idx on public.media using gin (tags);
create trigger media_updated_at before update on public.media
  for each row execute function public.set_updated_at();

-- -----------------------------------------------------------------------------
-- Galería de instalaciones
-- -----------------------------------------------------------------------------
create table public.gallery_categories (
  id uuid primary key default gen_random_uuid(),
  name text not null check (char_length(name) between 1 and 80),
  slug public.slug not null unique,
  sort_order integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create trigger gallery_categories_updated_at before update on public.gallery_categories
  for each row execute function public.set_updated_at();

create table public.gallery_items (
  id uuid primary key default gen_random_uuid(),
  media_id uuid not null references public.media (id) on delete restrict,
  category_id uuid references public.gallery_categories (id) on delete set null,
  caption text not null default '',
  sort_order integer not null default 0,
  is_visible boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index gallery_items_order_idx on public.gallery_items (category_id, sort_order);
create trigger gallery_items_updated_at before update on public.gallery_items
  for each row execute function public.set_updated_at();

-- -----------------------------------------------------------------------------
-- Noticias
-- -----------------------------------------------------------------------------
create table public.news_categories (
  id uuid primary key default gen_random_uuid(),
  name text not null check (char_length(name) between 1 and 80),
  slug public.slug not null unique,
  sort_order integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create trigger news_categories_updated_at before update on public.news_categories
  for each row execute function public.set_updated_at();

create table public.news_posts (
  id uuid primary key default gen_random_uuid(),
  title text not null check (char_length(title) between 1 and 200),
  slug public.slug not null unique,
  excerpt text not null default '' check (char_length(excerpt) <= 500),
  -- HTML ya saneado en servidor (lista blanca de etiquetas).
  content_html text not null default '',
  featured_media_id uuid references public.media (id) on delete set null,
  category_id uuid references public.news_categories (id) on delete set null,
  author_name text check (author_name is null or char_length(author_name) <= 120),
  status public.news_status not null default 'draft',
  -- Una noticia publicada con fecha futura queda programada: RLS impide
  -- leerla públicamente hasta que llegue la fecha (sin depender de un cron).
  published_at timestamptz,
  is_featured boolean not null default false,
  seo_title text check (seo_title is null or char_length(seo_title) <= 70),
  seo_description text check (seo_description is null or char_length(seo_description) <= 170),
  is_demo boolean not null default false,
  created_by uuid references public.profiles (id) on delete set null,
  updated_by uuid references public.profiles (id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  search tsvector generated always as (
    setweight(to_tsvector('spanish', coalesce(title, '')), 'A') ||
    setweight(to_tsvector('spanish', coalesce(excerpt, '')), 'B')
  ) stored,
  constraint news_published_needs_date check (status <> 'published' or published_at is not null)
);
comment on column public.news_posts.published_at is 'Fecha de publicación. Si es futura y status=published, la noticia está programada.';
create index news_posts_public_idx on public.news_posts (status, published_at desc);
create index news_posts_category_idx on public.news_posts (category_id);
create index news_posts_search_idx on public.news_posts using gin (search);
create trigger news_posts_updated_at before update on public.news_posts
  for each row execute function public.set_updated_at();

-- Fotografías adicionales de una noticia.
create table public.news_post_media (
  post_id uuid not null references public.news_posts (id) on delete cascade,
  media_id uuid not null references public.media (id) on delete restrict,
  sort_order integer not null default 0,
  primary key (post_id, media_id)
);

-- -----------------------------------------------------------------------------
-- Eventos
-- -----------------------------------------------------------------------------
create table public.event_categories (
  id uuid primary key default gen_random_uuid(),
  name text not null check (char_length(name) between 1 and 80),
  slug public.slug not null unique,
  color public.hex_color not null default '#7a9a7e',
  sort_order integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create trigger event_categories_updated_at before update on public.event_categories
  for each row execute function public.set_updated_at();

create table public.events (
  id uuid primary key default gen_random_uuid(),
  title text not null check (char_length(title) between 1 and 200),
  slug public.slug not null unique,
  description_html text not null default '',
  summary text not null default '' check (char_length(summary) <= 300),
  -- Instantes absolutos. Para eventos de día completo se guardan las 00:00
  -- del primer día y las 23:59:59 del último día en hora de Europe/Madrid.
  starts_at timestamptz not null,
  ends_at timestamptz not null,
  all_day boolean not null default false,
  location text check (location is null or char_length(location) <= 200),
  media_id uuid references public.media (id) on delete set null,
  category_id uuid references public.event_categories (id) on delete set null,
  status public.publish_status not null default 'draft',
  is_featured boolean not null default false,
  has_detail_page boolean not null default true,
  external_url text check (external_url is null or external_url ~ '^https://'),
  is_demo boolean not null default false,
  created_by uuid references public.profiles (id) on delete set null,
  updated_by uuid references public.profiles (id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint events_dates_valid check (ends_at >= starts_at)
);
create index events_range_idx on public.events (status, starts_at, ends_at);
create trigger events_updated_at before update on public.events
  for each row execute function public.set_updated_at();

-- -----------------------------------------------------------------------------
-- Servicios
-- -----------------------------------------------------------------------------
create table public.services (
  id uuid primary key default gen_random_uuid(),
  title text not null check (char_length(title) between 1 and 120),
  slug public.slug not null unique,
  summary text not null default '' check (char_length(summary) <= 400),
  content_html text not null default '',
  -- Clave de un icono de la lista cerrada de la aplicación.
  icon text not null default 'heart' check (icon ~ '^[a-z0-9-]{1,40}$'),
  media_id uuid references public.media (id) on delete set null,
  sort_order integer not null default 0,
  status public.publish_status not null default 'draft',
  is_demo boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index services_order_idx on public.services (status, sort_order);
create trigger services_updated_at before update on public.services
  for each row execute function public.set_updated_at();

-- -----------------------------------------------------------------------------
-- Testimonios (solo con autorización expresa)
-- -----------------------------------------------------------------------------
create table public.testimonials (
  id uuid primary key default gen_random_uuid(),
  quote text not null check (char_length(quote) between 1 and 800),
  author_label text not null check (char_length(author_label) between 1 and 120),
  -- Debe marcarse solo cuando exista un consentimiento documentado.
  consent_confirmed boolean not null default false,
  consent_reference text,
  status public.publish_status not null default 'draft',
  sort_order integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint testimonials_publish_needs_consent check (status <> 'published' or consent_confirmed)
);
create trigger testimonials_updated_at before update on public.testimonials
  for each row execute function public.set_updated_at();

-- -----------------------------------------------------------------------------
-- Páginas, revisiones y bloques
-- -----------------------------------------------------------------------------
create table public.pages (
  id uuid primary key default gen_random_uuid(),
  slug public.slug not null unique,
  title text not null check (char_length(title) between 1 and 160),
  -- Las páginas de sistema (inicio, legales, módulos) no se pueden borrar
  -- ni cambiar de URL.
  is_system boolean not null default false,
  -- 'blocks' = página libre; el resto añade un módulo tras los bloques.
  kind text not null default 'blocks' check (kind in ('blocks', 'home', 'services', 'gallery', 'news', 'events', 'contact', 'legal')),
  status public.publish_status not null default 'draft',
  seo_title text check (seo_title is null or char_length(seo_title) <= 70),
  seo_description text check (seo_description is null or char_length(seo_description) <= 170),
  og_media_id uuid references public.media (id) on delete set null,
  published_revision_id uuid,
  draft_updated_at timestamptz,
  has_unpublished_changes boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create trigger pages_updated_at before update on public.pages
  for each row execute function public.set_updated_at();

create table public.page_revisions (
  id uuid primary key default gen_random_uuid(),
  page_id uuid not null references public.pages (id) on delete cascade,
  version integer not null,
  -- Versión del formato de bloques (ver src/features/blocks/schema.ts).
  schema_version integer not null default 1,
  note text,
  created_by uuid references public.profiles (id) on delete set null,
  created_at timestamptz not null default now(),
  unique (page_id, version)
);

alter table public.pages
  add constraint pages_published_revision_fk
  foreign key (published_revision_id) references public.page_revisions (id) on delete set null;

-- Cada bloque es una fila. revision_id NULL = borrador en edición.
create table public.page_blocks (
  id uuid primary key default gen_random_uuid(),
  page_id uuid not null references public.pages (id) on delete cascade,
  revision_id uuid references public.page_revisions (id) on delete cascade,
  position integer not null check (position >= 0),
  type text not null check (type ~ '^[a-z][a-z0-9-]{1,40}$'),
  schema_version integer not null default 1,
  -- Propiedades validadas por esquema en la aplicación (zod) antes de guardar.
  props jsonb not null default '{}'::jsonb check (jsonb_typeof(props) = 'object'),
  is_hidden boolean not null default false,
  visibility jsonb not null default '{"desktop": true, "tablet": true, "mobile": true}'::jsonb,
  created_at timestamptz not null default now()
);
create index page_blocks_page_idx on public.page_blocks (page_id, revision_id, position);

-- -----------------------------------------------------------------------------
-- Temas visuales
-- -----------------------------------------------------------------------------
create table public.themes (
  id uuid primary key default gen_random_uuid(),
  name text not null check (char_length(name) between 1 and 80),
  is_preset boolean not null default false,
  -- Valores publicados (validados con zod: src/features/theme/schema.ts).
  tokens jsonb not null check (jsonb_typeof(tokens) = 'object'),
  -- Cambios en borrador (NULL si no hay).
  draft_tokens jsonb check (draft_tokens is null or jsonb_typeof(draft_tokens) = 'object'),
  -- Valores originales para "restablecer".
  original_tokens jsonb not null check (jsonb_typeof(original_tokens) = 'object'),
  is_active boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create unique index themes_single_active_idx on public.themes (is_active) where is_active;
create trigger themes_updated_at before update on public.themes
  for each row execute function public.set_updated_at();

-- -----------------------------------------------------------------------------
-- Configuración general (fila única)
-- -----------------------------------------------------------------------------
create table public.site_settings (
  id smallint primary key default 1 check (id = 1),
  site_name text not null default 'Residencia la Luz',
  tagline text not null default '',
  logo_media_id uuid references public.media (id) on delete set null,
  favicon_media_id uuid references public.media (id) on delete set null,
  phone text not null default '',
  phone_secondary text not null default '',
  email text not null default '',
  address_line text not null default '',
  postal_code text not null default '',
  city text not null default '',
  province text not null default '',
  map_url text check (map_url is null or map_url ~ '^https://'),
  -- [{ "label": "Lunes a viernes", "hours": "9:00 - 19:00" }]
  opening_hours jsonb not null default '[]'::jsonb check (jsonb_typeof(opening_hours) = 'array'),
  -- [{ "network": "facebook", "url": "https://..." }]
  social_links jsonb not null default '[]'::jsonb check (jsonb_typeof(social_links) = 'array'),
  seo_title text not null default '',
  seo_description text not null default '',
  og_media_id uuid references public.media (id) on delete set null,
  contact_form_enabled boolean not null default true,
  testimonials_enabled boolean not null default false,
  contact_privacy_note text not null default '',
  -- Titular legal (para el aviso legal). Rellenar antes de publicar.
  legal_owner_name text not null default '',
  legal_owner_tax_id text not null default '',
  show_demo_notice boolean not null default true,
  updated_at timestamptz not null default now()
);
create trigger site_settings_updated_at before update on public.site_settings
  for each row execute function public.set_updated_at();

-- -----------------------------------------------------------------------------
-- Menús de navegación
-- -----------------------------------------------------------------------------
create table public.menu_items (
  id uuid primary key default gen_random_uuid(),
  location public.menu_location not null,
  label text not null check (char_length(label) between 1 and 60),
  -- Ruta interna ("/noticias") o URL https externa.
  href text not null check (href ~ '^(/[a-z0-9\-/]*|https://.+)$'),
  page_id uuid references public.pages (id) on delete cascade,
  sort_order integer not null default 0,
  is_visible boolean not null default true,
  -- Los enlaces de sistema no permiten cambiar la ruta ni borrarse.
  is_system boolean not null default false,
  open_in_new_tab boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index menu_items_location_idx on public.menu_items (location, sort_order);
create trigger menu_items_updated_at before update on public.menu_items
  for each row execute function public.set_updated_at();

-- -----------------------------------------------------------------------------
-- Mensajes del formulario de contacto
-- -----------------------------------------------------------------------------
-- Solo se recogen los datos mínimos. No se piden datos de salud.
create table public.contact_messages (
  id uuid primary key default gen_random_uuid(),
  name text not null check (char_length(name) between 1 and 120),
  email text not null check (char_length(email) between 3 and 254),
  phone text check (phone is null or char_length(phone) <= 30),
  subject text check (subject is null or char_length(subject) <= 150),
  message text not null check (char_length(message) between 1 and 3000),
  privacy_accepted boolean not null check (privacy_accepted),
  privacy_version text not null,
  status public.message_status not null default 'new',
  created_at timestamptz not null default now()
);
create index contact_messages_created_idx on public.contact_messages (created_at desc);

-- -----------------------------------------------------------------------------
-- Limitación de intentos (login, formulario). Solo accesible con service role.
-- -----------------------------------------------------------------------------
create table public.rate_limit_hits (
  id bigint generated always as identity primary key,
  bucket text not null,
  key_hash text not null,
  created_at timestamptz not null default now()
);
create index rate_limit_hits_lookup_idx on public.rate_limit_hits (bucket, key_hash, created_at desc);

-- -----------------------------------------------------------------------------
-- Registro de acciones administrativas
-- -----------------------------------------------------------------------------
create table public.audit_log (
  id bigint generated always as identity primary key,
  actor_id uuid references public.profiles (id) on delete set null,
  action text not null,
  entity_type text not null,
  entity_id text,
  summary text,
  created_at timestamptz not null default now()
);
create index audit_log_created_idx on public.audit_log (created_at desc);
