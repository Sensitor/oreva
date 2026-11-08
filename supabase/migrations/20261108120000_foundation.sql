-- =============================================================================
-- ORÉVA · Phase 1 foundation
--
-- * Extensions (PostGIS for Discover, decision P-03).
-- * `private` schema for helpers. It is NOT exposed through the API.
-- * Runtime environment setting, failing closed to "production".
-- * Placeholder guard: invented sample data can never be published in
--   production (decisions A-06 / P-11).
-- * Localized text helpers (decision D-04) and the `locales` table (P-06).
-- * Platform roles skeleton with RLS (role model, technical plan section 2.D).
--
-- Conventions for every later migration:
-- * RLS is enabled on every table in `public` (a pgTAP test enforces it).
-- * SECURITY DEFINER functions always set `search_path = ''`.
-- * Business rules live in RPC functions (decision D-02); clients never get
--   direct write access to sensitive tables.
-- =============================================================================

-- -----------------------------------------------------------------------------
-- Extensions
-- -----------------------------------------------------------------------------
create extension if not exists postgis with schema extensions;
create extension if not exists pgcrypto with schema extensions;

-- -----------------------------------------------------------------------------
-- Private schema
-- -----------------------------------------------------------------------------
create schema if not exists private;
revoke all on schema private from public;
-- RLS policies run as the calling role, so it needs USAGE to call helpers.
-- The schema is not in the API's exposed schemas, so nothing here is reachable
-- over HTTP. EXECUTE is granted function by function; PUBLIC is revoked at the
-- end of this migration (and a pgTAP test checks it for every later migration).
grant usage on schema private to anon, authenticated, service_role;

-- -----------------------------------------------------------------------------
-- Runtime settings
-- -----------------------------------------------------------------------------
create table private.runtime_settings (
  key text primary key,
  value text not null,
  updated_at timestamptz not null default now(),
  constraint runtime_settings_environment_value
    check (key <> 'environment' or value in ('local', 'staging', 'production'))
);
revoke all on private.runtime_settings from public, anon, authenticated;

comment on table private.runtime_settings is
  'Per-database settings. "environment" is set to local by the local seed and to staging by the staging runbook. When absent, the database behaves as production (fail closed).';

create function private.app_environment()
returns text
language sql
stable
security definer
set search_path = ''
as $$
  select coalesce(
    (select value from private.runtime_settings where key = 'environment'),
    'production'
  );
$$;

grant execute on function private.app_environment() to anon, authenticated, service_role;

-- -----------------------------------------------------------------------------
-- Generic helpers
-- -----------------------------------------------------------------------------
create function private.set_updated_at()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  new.updated_at := now();
  return new;
end;
$$;

-- -----------------------------------------------------------------------------
-- Placeholder guard (P-11)
--
-- Attach to any table that has an `is_placeholder` column:
--   create trigger guard_placeholder
--     before insert or update on public.organizations
--     for each row execute function private.guard_placeholder_publication('status', 'active');
--
-- Arguments: the status column, then the statuses that make a row visible to
-- members. With no arguments, placeholder rows are refused outright in
-- production.
-- -----------------------------------------------------------------------------
create function private.guard_placeholder_publication()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare
  row_data jsonb := to_jsonb(new);
  status_value text;
begin
  if not coalesce((row_data ->> 'is_placeholder')::boolean, false) then
    return new;
  end if;

  if private.app_environment() <> 'production' then
    return new;
  end if;

  if tg_nargs = 0 then
    raise exception using
      errcode = 'P0001',
      message = 'placeholder_in_production',
      detail = format('%I.%I rows marked is_placeholder are not allowed in production.', tg_table_schema, tg_table_name),
      hint = 'Replace sample content with partner-validated data.';
  end if;

  status_value := row_data ->> tg_argv[0];
  if status_value = any (tg_argv[1:tg_nargs - 1]) then
    raise exception using
      errcode = 'P0001',
      message = 'placeholder_in_production',
      detail = format('%I.%I rows marked is_placeholder cannot be "%s" in production.', tg_table_schema, tg_table_name, status_value),
      hint = 'Replace sample content with partner-validated data before publishing.';
  end if;

  return new;
end;
$$;

-- -----------------------------------------------------------------------------
-- Locales (P-06): languages are data, not code.
-- -----------------------------------------------------------------------------
create table public.locales (
  code text primary key check (code ~ '^[a-z]{2,3}$'),
  native_name text not null check (length(btrim(native_name)) > 0),
  is_enabled boolean not null default true,
  is_default boolean not null default false,
  rtl boolean not null default false,
  -- Content types that must have this language before they can be published (A-03).
  required_for text[] not null default '{}'
    check (required_for <@ array['organization', 'program', 'community_rules']::text[]),
  sort_order integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create unique index locales_single_default on public.locales (is_default) where is_default;

create trigger locales_set_updated_at
  before update on public.locales
  for each row execute function private.set_updated_at();

alter table public.locales enable row level security;

create policy "Enabled locales are readable by everyone"
  on public.locales for select
  to anon, authenticated
  using (is_enabled);

revoke insert, update, delete, truncate on public.locales from anon, authenticated;

insert into public.locales (code, native_name, is_default, required_for, sort_order) values
  ('en', 'English', true, array['organization', 'program', 'community_rules'], 1),
  ('fr', 'Français', false, array['organization', 'program', 'community_rules'], 2),
  ('ru', 'Русский', false, array['organization', 'program', 'community_rules'], 3);

-- -----------------------------------------------------------------------------
-- Localized text (D-04): {"en": "...", "fr": "...", "ru": "..."}
-- -----------------------------------------------------------------------------

-- Shape check, usable in CHECK constraints (immutable: does not read tables).
create function private.is_localized_text(value jsonb, max_length integer default 10000)
returns boolean
language sql
immutable
set search_path = ''
as $$
  select value is not null
    and jsonb_typeof(value) = 'object'
    and value <> '{}'::jsonb
    and not exists (
      select 1
      from jsonb_each(value) as entry
      where entry.key !~ '^[a-z]{2,3}$'
         or jsonb_typeof(entry.value) <> 'string'
         or length(btrim(entry.value #>> '{}')) = 0
         or length(entry.value #>> '{}') > max_length
    );
$$;

-- Languages still missing before a content type can be published (A-03).
create function private.missing_translations(value jsonb, content_type text)
returns text[]
language sql
stable
set search_path = ''
as $$
  select coalesce(array_agg(l.code order by l.sort_order), '{}')
  from public.locales as l
  where l.is_enabled
    and content_type = any (l.required_for)
    and length(btrim(coalesce(value ->> l.code, ''))) = 0;
$$;

-- Best text for a member: their language, then the default language, then the
-- content's source language. Used later for notifications rendered server-side.
create function private.localized(value jsonb, locale text, source_locale text default null)
returns text
language sql
stable
set search_path = ''
as $$
  select coalesce(
    nullif(btrim(value ->> locale), ''),
    nullif(btrim(value ->> (select code from public.locales where is_default limit 1)), ''),
    nullif(btrim(value ->> source_locale), '')
  );
$$;

grant execute on function private.is_localized_text(jsonb, integer) to anon, authenticated, service_role;
grant execute on function private.missing_translations(jsonb, text) to authenticated, service_role;
grant execute on function private.localized(jsonb, text, text) to anon, authenticated, service_role;

-- -----------------------------------------------------------------------------
-- Platform roles (ORÉVA team). Organization roles arrive with organizations
-- in Phase 3. Roles are never taken from the client: policies read this table.
-- -----------------------------------------------------------------------------
create table public.platform_roles (
  user_id uuid not null references auth.users (id) on delete cascade,
  role text not null check (role in ('admin', 'support')),
  granted_at timestamptz not null default now(),
  granted_by uuid references auth.users (id) on delete set null,
  primary key (user_id, role)
);

alter table public.platform_roles enable row level security;

create policy "Members can see their own platform roles"
  on public.platform_roles for select
  to authenticated
  using (user_id = (select auth.uid()));

-- No insert/update/delete policies: roles are granted by an audited admin RPC
-- (Phase 8) or by the service role during setup.
revoke insert, update, delete, truncate on public.platform_roles from anon, authenticated;

create function private.has_platform_role(required_role text)
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1
    from public.platform_roles
    where user_id = (select auth.uid())
      and role = required_role
  );
$$;

grant execute on function private.has_platform_role(text) to authenticated, service_role;

-- -----------------------------------------------------------------------------
-- Postgres grants EXECUTE on new functions to PUBLIC by default. Remove it for
-- every private helper; the explicit grants above remain.
-- -----------------------------------------------------------------------------
revoke execute on all functions in schema private from public;
