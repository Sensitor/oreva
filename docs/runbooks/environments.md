# Runbook · Environments

ORÉVA has three environments (cahier des charges 6.3, decision P-10).

|                                        | Local                                                        | Staging                                                          | Production                                              |
| -------------------------------------- | ------------------------------------------------------------ | ---------------------------------------------------------------- | ------------------------------------------------------- |
| Database                               | Supabase in Docker (`pnpm db:start`)                         | Separate Supabase project (EU, paid plan)                        | Separate Supabase project (EU, paid plan, PITR backups) |
| Mobile app                             | `APP_VARIANT=development` → `com.oreva.app.dev`, "ORÉVA Dev" | `APP_VARIANT=staging` → `com.oreva.app.staging`, "ORÉVA Staging" | `APP_VARIANT=production` → `com.oreva.app`, "ORÉVA"     |
| Data                                   | Fictional seed only                                          | Fictional data only                                              | Real data, restricted access                            |
| Sample data labels and Design preview  | Visible                                                      | Visible                                                          | Hidden                                                  |
| Placeholder content (`is_placeholder`) | Can be published                                             | Can be published                                                 | **Blocked by the database**                             |

## Marking a database's environment

The placeholder guard reads `private.runtime_settings`. When the `environment` key is absent, the database **behaves as production** (fail closed).

- **Local:** set automatically by `supabase/seed/00_environment.sql` on `pnpm db:reset`.
- **Staging:** run once in the staging project's SQL editor, by someone with database owner access:

  ```sql
  insert into private.runtime_settings (key, value) values ('environment', 'staging')
  on conflict (key) do update set value = excluded.value, updated_at = now();
  ```

- **Production:** do nothing. Never insert `local` or `staging` into the production database.

## Identifiers

`APP_ID_BASE` (default `com.oreva.app`) can change freely **until the first store submission**, then never. Before that: confirm the legal entity, the domain and the trademark check (decision record, section 5 and O-01 to O-03).
