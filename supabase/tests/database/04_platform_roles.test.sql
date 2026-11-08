-- Roles are read from the database, never from the client (technical plan 2.D).
begin;
create extension if not exists pgtap with schema extensions;
select plan(7);

insert into auth.users (id, email) values
  ('00000000-0000-4000-8000-00000000000a', 'admin@example.test'),
  ('00000000-0000-4000-8000-00000000000b', 'member@example.test');
insert into public.platform_roles (user_id, role) values ('00000000-0000-4000-8000-00000000000a', 'admin');

-- Admin
set local role authenticated;
select set_config('request.jwt.claims', '{"sub": "00000000-0000-4000-8000-00000000000a", "role": "authenticated"}', true);
select set_config('request.jwt.claim.sub', '00000000-0000-4000-8000-00000000000a', true);
select ok(private.has_platform_role('admin'), 'admin is recognised as admin');
select is((select count(*)::int from public.platform_roles), 1, 'admin sees their own role');

-- Member
select set_config('request.jwt.claims', '{"sub": "00000000-0000-4000-8000-00000000000b", "role": "authenticated"}', true);
select set_config('request.jwt.claim.sub', '00000000-0000-4000-8000-00000000000b', true);
select ok(not private.has_platform_role('admin'), 'a member is not an admin');
select is((select count(*)::int from public.platform_roles), 0, 'a member cannot see other people''s roles');
select throws_ok(
  $$ insert into public.platform_roles (user_id, role) values ('00000000-0000-4000-8000-00000000000b', 'admin') $$,
  '42501',
  null,
  'a member cannot grant themselves a role'
);

-- A claim sent by the client does not make anyone an admin.
select set_config('request.jwt.claims', '{"sub": "00000000-0000-4000-8000-00000000000b", "role": "authenticated", "app_role": "admin"}', true);
select ok(not private.has_platform_role('admin'), 'client-supplied role claims are ignored');

-- Anonymous
set local role anon;
select is((select count(*)::int from public.platform_roles), 0, 'anonymous visitors see no roles');

select * from finish();
rollback;
