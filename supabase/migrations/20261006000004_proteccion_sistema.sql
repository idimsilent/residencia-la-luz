-- =============================================================================
-- Protecciones adicionales para elementos de sistema
-- =============================================================================

-- Las páginas principales no pueden cambiar de dirección, tipo ni perder la
-- marca de sistema (aunque se manipule la petición desde el navegador).
create or replace function public.protect_system_pages()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  if old.is_system and (
       new.slug is distinct from old.slug
    or new.kind is distinct from old.kind
    or new.is_system is distinct from old.is_system
    or new.status <> 'published'
  ) then
    raise exception 'las páginas principales no se pueden renombrar, despublicar ni convertir' using errcode = 'P0001';
  end if;
  if not old.is_system and new.is_system then
    raise exception 'no se puede marcar una página como principal' using errcode = 'P0001';
  end if;
  return new;
end;
$$;

create trigger pages_protect_system
  before update on public.pages
  for each row execute function public.protect_system_pages();

-- Los enlaces de sistema del menú conservan su ruta y su marca.
create or replace function public.protect_system_menu_items()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  if tg_op = 'DELETE' then
    if old.is_system then
      raise exception 'los enlaces principales no se pueden borrar' using errcode = 'P0001';
    end if;
    return old;
  end if;
  if old.is_system and (new.href is distinct from old.href or not new.is_system) then
    raise exception 'los enlaces principales no pueden cambiar de ruta' using errcode = 'P0001';
  end if;
  if not old.is_system and new.is_system then
    raise exception 'no se puede marcar un enlace como principal' using errcode = 'P0001';
  end if;
  return new;
end;
$$;

create trigger menu_items_protect_system
  before update or delete on public.menu_items
  for each row execute function public.protect_system_menu_items();

-- Los enlaces creados desde la aplicación nunca son de sistema.
create policy "menú nuevo no es de sistema" on public.menu_items
  as restrictive for insert to authenticated
  with check (not is_system);
