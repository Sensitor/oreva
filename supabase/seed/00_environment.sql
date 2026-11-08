-- LOCAL DEVELOPMENT ONLY. Seed files are never applied to staging or production.
-- Marks this database as "local" so sample (placeholder) content can be published.
insert into private.runtime_settings (key, value)
values ('environment', 'local')
on conflict (key) do update set value = excluded.value, updated_at = now();
