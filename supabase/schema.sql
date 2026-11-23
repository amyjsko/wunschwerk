-- Wunschwerk: Datenbank-Aufbau für Supabase
-- Einmal im Supabase-Dashboard unter "SQL Editor" einfügen und ausführen.

create extension if not exists pgcrypto;

-- Wunschzettel. Die Wünsche liegen als Liste (JSON) direkt im Wunschzettel.
create table if not exists public.lists (
  id uuid primary key default gen_random_uuid(),
  owner uuid not null default auth.uid() references auth.users (id) on delete cascade,
  slug text not null unique,
  title text not null default '',
  subtitle text not null default '',
  template text not null default 'weihnachten',
  layout text not null default 'raster',
  wishes jsonb not null default '[]'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Reservierungen von Gästen. Niemand liest diese Tabelle direkt,
-- nur über die Funktionen unten, damit die beschenkte Person sie nicht sieht.
create table if not exists public.reservations (
  id uuid primary key default gen_random_uuid(),
  list_id uuid not null references public.lists (id) on delete cascade,
  wish_id text not null,
  name text not null check (char_length(name) between 1 and 60),
  token uuid not null default gen_random_uuid(),
  created_at timestamptz not null default now(),
  unique (list_id, wish_id)
);

-- Scrapbook-Gestaltung (seit Version 3)
alter table public.lists add column if not exists design jsonb;

alter table public.lists enable row level security;
alter table public.reservations enable row level security;

-- Eigene Wunschzettel: lesen, anlegen, ändern, löschen
drop policy if exists "eigene Listen" on public.lists;
create policy "eigene Listen" on public.lists
  for all to authenticated
  using (owner = auth.uid())
  with check (owner = auth.uid());

-- Angemeldete dürfen mit ihren eigenen Listen arbeiten (die Regel oben schränkt
-- das auf eigene Listen ein). Neue Supabase-Projekte vergeben das nicht automatisch.
grant usage on schema public to anon, authenticated;
grant select, insert, update, delete on public.lists to authenticated;
revoke all on public.lists from anon;

-- Keine direkten Rechte auf Reservierungen
revoke all on public.reservations from anon, authenticated;

-- Geteilten Wunschzettel lesen. Reservierungen gibt es nur für Gäste,
-- nicht für die Person, der der Wunschzettel gehört.
create or replace function public.get_shared_list(p_slug text)
returns json
language plpgsql
security definer
set search_path = public
as $$
declare
  l public.lists;
  is_owner boolean;
begin
  select * into l from public.lists where slug = p_slug;
  if not found then
    return null;
  end if;
  is_owner := auth.uid() is not null and auth.uid() = l.owner;
  return json_build_object(
    'title', l.title,
    'subtitle', l.subtitle,
    'template', l.template,
    'layout', l.layout,
    'wishes', coalesce((select jsonb_agg(w) from jsonb_array_elements(l.wishes) w
                         where coalesce((w->>'hidden')::boolean, false) = false), '[]'::jsonb),
    'design', l.design,
    'is_owner', is_owner,
    'reservations', case when is_owner then '[]'::json else coalesce(
      (select json_agg(json_build_object('wish_id', r.wish_id, 'name', r.name))
         from public.reservations r where r.list_id = l.id),
      '[]'::json) end
  );
end;
$$;

-- Wunsch reservieren. Gibt ein Geheimnis (token) zurück, mit dem der Gast
-- die Reservierung wieder aufheben kann.
create or replace function public.reserve_wish(p_slug text, p_wish_id text, p_name text)
returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare
  l public.lists;
  t uuid;
begin
  select * into l from public.lists where slug = p_slug;
  if not found then
    raise exception 'Wunschzettel nicht gefunden';
  end if;
  if auth.uid() is not null and auth.uid() = l.owner then
    raise exception 'Eigene Wünsche kann man nicht reservieren';
  end if;
  if not exists (select 1 from jsonb_array_elements(l.wishes) w where w->>'id' = p_wish_id) then
    raise exception 'Wunsch nicht gefunden';
  end if;
  insert into public.reservations (list_id, wish_id, name)
  values (l.id, p_wish_id, trim(p_name))
  returning token into t;
  return t;
exception
  when unique_violation then
    raise exception 'Schon reserviert';
end;
$$;

-- Eigene Reservierung aufheben
create or replace function public.cancel_reservation(p_token uuid)
returns void
language sql
security definer
set search_path = public
as $$
  delete from public.reservations where token = p_token;
$$;

revoke all on function public.get_shared_list(text) from public;
revoke all on function public.reserve_wish(text, text, text) from public;
revoke all on function public.cancel_reservation(uuid) from public;
grant execute on function public.get_shared_list(text) to anon, authenticated;
grant execute on function public.reserve_wish(text, text, text) to anon, authenticated;
grant execute on function public.cancel_reservation(uuid) to anon, authenticated;
