# ORÉVA

_Your movement. Your moment._

ORÉVA is a premium Pilates platform for iOS and Android, built on three pillars:

- **Discover:** find instructors, studios and in-person classes near you, wherever you are.
- **Practice:** a premium library of workouts, programs and guided sessions, anytime.
- **Connect:** instructors, Pilates communities and private Circles with friends.

The pilot launches in Monaco and on the Côte d'Azur with **Gym & Tonic** as Founding Partner. The platform is designed to expand internationally.

## Project status

| Phase         | Status                                                                                                             |
| ------------- | ------------------------------------------------------------------------------------------------------------------ |
| 0. Planning   | Done ([decision record](docs/phase-0/decision-record.md), [technical plan](docs/phase-0/technical-plan.md))        |
| 1. Foundation | In review: monorepo, design system, EN/FR/RU, pillar navigation, static Home, admin shell, database foundation, CI |
| 2. Accounts   | Not started                                                                                                        |

## Repository

```
apps/mobile      Expo SDK 58 app (iOS, Android), Expo Router
apps/admin       Next.js 16 admin and provider portal
packages/tokens  Design tokens + WCAG contrast checks
packages/i18n    EN / FR / RU translations, locale detection, Intl formatters
packages/core    Domain helpers (localized content, time zones)
packages/config  Shared TypeScript, ESLint and Prettier config
supabase/        Migrations, local seed, pgTAP tests
docs/            Decisions, technical plan, design notes, runbooks
```

## Getting started

Prerequisites: Node 22 (`.nvmrc`), pnpm 10 (via Corepack), Docker for the local database. iOS and Android builds can run in the cloud with EAS.

```bash
corepack enable
```

```bash
pnpm install
```

```bash
pnpm check
```

### Mobile app

The app uses native modules, so run it in a **development build**, not Expo Go:

```bash
cd apps/mobile && npx eas-cli@latest build --profile development --platform ios
```

Then start the dev server:

```bash
pnpm dev:mobile
```

Variants: `APP_VARIANT=development|staging|production` sets the bundle ID, app name and URL scheme (see [environments runbook](docs/runbooks/environments.md)). Profile → Design preview (non-production builds) compares the two candidate typefaces in all three languages.

### Admin and provider portal

```bash
pnpm dev:admin
```

### Database

```bash
pnpm db:start
```

```bash
pnpm db:reset
```

```bash
pnpm db:test
```

## Rules for contributors (human or AI)

See [`CLAUDE.md`](CLAUDE.md). In short: no hardcoded UI text, EN/FR/RU always in sync, design tokens only, RLS on every table, no secrets in the repo, never invent partner data.
