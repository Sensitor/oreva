# ORÉVA: instructions for AI-assisted development

ORÉVA is a premium Pilates platform (iOS, Android, web portal) built on three pillars:
**Discover, Practice, Connect**. Read these before any task:

1. `docs/phase-0/decision-record.md`: every approved decision (D-xx, A-xx, P-xx). It wins over the cahier des charges where they differ.
2. `docs/phase-0/technical-plan.md`: architecture, data model, roadmap.
3. `docs/design/visual-reference.md`: palette, accessibility, content we do not copy.
4. `docs/decisions/`: decisions made after Phase 0.

## Working rules

- Work phase by phase, in small vertical slices. Do not start a phase without the founders' explicit approval.
- Before coding: restate the goal, list files and database changes, risks and acceptance criteria. Ask before structural changes.
- Every phase ends on a branch with a PR: lint, typecheck, tests and docs pass; the report says plainly what works, what does not, and what could not be tested.
- Never claim an external integration works unless it was configured and tested.
- Never invent partner, instructor, class, price or schedule data. Sample content sets `isPlaceholder` / `is_placeholder` and is labelled "Sample data".

## Non-negotiable engineering rules

- **TypeScript strict** everywhere. TypeScript is pinned to the version Expo SDK 58 supports (6.0.x).
- **No hardcoded UI text.** All strings go through `@oreva/i18n` (EN default and fallback, FR, RU). ESLint enforces it (`react/jsx-no-literals`). Add every key to `en.json`, `fr.json` and `ru.json`, with the plural forms each language needs; the parity test fails otherwise. Never build sentences from fragments.
- **RTL-safe layout.** Use `start`/`end` style properties, never `left`/`right` (ESLint enforces it).
- **Design tokens only.** Colors, spacing, radii and type come from `@oreva/tokens`. New text/background pairings go into `contrastPairs` so the AA test checks them. Text on lavender is ink, never white.
- **Accessibility.** Spoken labels on icon-only controls, `accessibilityState` for selection, 44pt minimum touch targets, system text scaling on, Reduce Motion respected.
- **Security.** RLS on every `public` table (a pgTAP test enforces it). `SECURITY DEFINER` functions set `search_path = ''`. Business rules live in Postgres RPC functions; clients never write sensitive tables directly. Roles are read from the database, never from the client.
- **Secrets.** Never in the app, the repo, prompts, screenshots or logs. `EXPO_PUBLIC_*` / `NEXT_PUBLIC_*` values are public by design. Only names go in `.env.example`.
- **Migrations** are the only way the schema changes. Never edit production by hand. Seeds are local only and fictional.
- **Privacy.** No weight, calories, measurements, diagnoses or birth date. No personal data in analytics or error reports.

## Commands

```bash
pnpm install          # once
pnpm check            # lint + typecheck + tests in every package
pnpm dev:mobile       # Expo dev server (use a development build, not Expo Go)
pnpm dev:admin        # Next.js portal on http://localhost:3000
pnpm db:start         # local Supabase (Docker)
pnpm db:reset         # re-apply migrations + local seed
pnpm db:test          # pgTAP tests
```

## Tooling notes

- Mobile dependencies: install with `npx expo install <pkg>` from `apps/mobile` so versions match SDK 58. Without access to api.expo.dev, prefix with `EXPO_OFFLINE=1`.
- Expo and Next.js change quickly. Check the installed packages' own types and docs (`node_modules/next/dist/docs/`, `apps/mobile/AGENTS.md`) rather than memory.
- React Native Testing Library 14: `render` and `fireEvent` are async; always `await` them.
