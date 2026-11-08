-- Decision P-11: invented sample data can never be published in production.
begin;
create extension if not exists pgtap with schema extensions;
select plan(9);

create table public.guard_test (
  id serial primary key,
  status text not null,
  is_placeholder boolean not null default false
);
alter table public.guard_test enable row level security;
create trigger guard_placeholder
  before insert or update on public.guard_test
  for each row execute function private.guard_placeholder_publication('status', 'published', 'active');

create table public.guard_test_media (
  id serial primary key,
  is_placeholder boolean not null default false
);
alter table public.guard_test_media enable row level security;
create trigger guard_placeholder
  before insert or update on public.guard_test_media
  for each row execute function private.guard_placeholder_publication();

-- Local / staging: sample content can be published for demos and tests.
insert into private.runtime_settings (key, value) values ('environment', 'local')
  on conflict (key) do update set value = excluded.value;
select lives_ok(
  $$ insert into public.guard_test (status, is_placeholder) values ('published', true) $$,
  'local: placeholder rows can be published'
);

-- Production.
update private.runtime_settings set value = 'production' where key = 'environment';
select throws_ok(
  $$ insert into public.guard_test (status, is_placeholder) values ('published', true) $$,
  'P0001',
  'placeholder_in_production',
  'production: a placeholder row cannot be inserted as published'
);
select lives_ok(
  $$ insert into public.guard_test (status, is_placeholder) values ('draft', true) $$,
  'production: placeholder drafts are allowed (never visible to members)'
);
select throws_ok(
  $$ update public.guard_test set status = 'active' where status = 'draft' $$,
  'P0001',
  'placeholder_in_production',
  'production: a placeholder draft cannot be activated'
);
select lives_ok(
  $$ insert into public.guard_test (status, is_placeholder) values ('published', false) $$,
  'production: validated content publishes normally'
);
select throws_ok(
  $$ insert into public.guard_test_media (is_placeholder) values (true) $$,
  'P0001',
  'placeholder_in_production',
  'production: tables without a status refuse placeholder rows outright'
);

-- Fail closed: a database that was never configured behaves as production.
delete from private.runtime_settings where key = 'environment';
select is(private.app_environment(), 'production', 'unset environment means production');
select throws_ok(
  $$ insert into public.guard_test (status, is_placeholder) values ('published', true) $$,
  'P0001',
  'placeholder_in_production',
  'unconfigured database: placeholders are blocked'
);

select throws_ok(
  $$ insert into private.runtime_settings (key, value) values ('environment', 'prod') $$,
  '23514',
  null,
  'only local, staging or production are valid environments'
);

select * from finish();
rollback;
