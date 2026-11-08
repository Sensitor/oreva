begin;
create extension if not exists pgtap with schema extensions;
select plan(7);

select results_eq(
  'select code from public.locales where is_enabled order by sort_order',
  array['en', 'fr', 'ru'],
  'EN, FR and RU are enabled, in order'
);

select is((select code from public.locales where is_default), 'en', 'English is the default and fallback');

select is(
  (select count(*)::int from public.locales where 'organization' = any (required_for)),
  3,
  'Organizations need all three languages before publication'
);

-- Anonymous visitors can read the language list...
set local role anon;
select is((select count(*)::int from public.locales), 3, 'anon can read enabled locales');

-- ...but nobody outside the backend can change it.
select throws_ok(
  $$ insert into public.locales (code, native_name) values ('de', 'Deutsch') $$,
  '42501',
  null,
  'anon cannot add a locale'
);

set local role authenticated;
select throws_ok(
  $$ update public.locales set is_enabled = false where code = 'ru' $$,
  '42501',
  null,
  'authenticated users cannot change locales'
);

reset role;
select throws_ok(
  $$ insert into public.locales (code, native_name, required_for) values ('es', 'Español', array['workout']) $$,
  '23514',
  null,
  'required_for only accepts known content types'
);

select * from finish();
rollback;
