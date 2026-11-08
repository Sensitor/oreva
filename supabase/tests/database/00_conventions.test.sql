-- Project-wide security conventions. Every later migration is checked too.
begin;
create extension if not exists pgtap with schema extensions;
select plan(3);

select is(
  (
    select coalesce(array_agg(c.relname::text order by c.relname), '{}')
    from pg_class as c
    join pg_namespace as n on n.oid = c.relnamespace
    where n.nspname = 'public'
      and c.relkind in ('r', 'p')
      and not c.relrowsecurity
      and c.relname <> 'spatial_ref_sys' -- owned by PostGIS, read-only reference data
  ),
  '{}'::text[],
  'Row Level Security is enabled on every table in public'
);

select is(
  (
    select coalesce(array_agg(p.oid::regprocedure::text order by 1), '{}')
    from pg_proc as p
    join pg_namespace as n on n.oid = p.pronamespace
    where n.nspname in ('public', 'private')
      and p.prosecdef
      and not exists (
        select 1 from unnest(coalesce(p.proconfig, '{}')) as setting where setting like 'search_path=%'
      )
  ),
  '{}'::text[],
  'Every SECURITY DEFINER function pins its search_path'
);

select is(
  (
    select coalesce(array_agg(p.oid::regprocedure::text order by 1), '{}')
    from pg_proc as p
    join pg_namespace as n on n.oid = p.pronamespace
    where n.nspname = 'private'
      and has_function_privilege('public', p.oid, 'execute')
  ),
  '{}'::text[],
  'No private function is executable by PUBLIC'
);

select * from finish();
rollback;
