# ORÉVA · Phase 0 Technical Plan (revision 1, archived)

> **Superseded.** This is the first Phase 0 plan (7 November 2026), kept for history. The current documents are [`../technical-plan.md`](../technical-plan.md) and [`../decision-record.md`](../decision-record.md).

Status: proposal for founder review. Nothing has been built yet.
Source of truth: *ORÉVA Cahier des charges MVP v1.1* plus the master development prompt.
Date: 7 November 2026

---

## 0. What I inspected

**Repository.** The working directory is empty. There is no git repository, no existing code, no Supabase project and no design files. Everything below starts from zero, so there are no migration or compatibility constraints from earlier work.

**Specification.** I read the whole document (sections 0 to 21 and Addendum v1.1). Some things to know:

1. The file is named `EN_FR_RU`, but the content is entirely in French. That's fine for engineering. It does mean there is no English or Russian product copy yet to start from.
2. **The visual reference is not in the file.** Section 10 refers to "la capture d'écran fournie par les fondateurs", but the .docx has no embedded images. I need that screenshot before Phase 1 design work.
3. Several parts of the spec were written before Russian was added and still say EN/FR only:
   * the section 6.1 architecture diagram ("English (default) / French")
   * the section 7 data model (`title_en/fr`, `description_en/fr`, `bio_en/fr`)
   * section 4.2 ("versions FR/EN gérées séparément")
   * Journey A step 3 ("choisit EN ou FR")
   * the section 15 repo tree ("en/fr translations")

   I will treat all of these as EN/FR/RU, as the Addendum requires.
4. The class status list in CLS-02 (`draft, published, full, waitlist, cancelled, completed`) and the weather section (`cancelled, moved, confirmed`, "weather watch") describe two different things in one field. I propose a cleaner model in section 5.3.

**Tooling available in this cloud session.** I have Node 22, Docker (so I can run Supabase locally), the GitHub CLI and pandoc. I can't run iOS or Android simulators here. Device testing will happen through EAS development builds on your phones.

**Current package versions (checked on npm today).**

| Package | Version |
| --- | --- |
| Expo SDK | 58 |
| Expo Router | 58 |
| React Native | 0.88 |
| Next.js | 16.4 |
| supabase-js | 2.119 |
| Supabase CLI | 3.0 |
| i18next | 27 |
| react-i18next | 18 |
| TanStack Query | 5 |
| Zod | 4 |
| React Hook Form | 7 |
| Reanimated | 4 |
| RevenueCat (`react-native-purchases`) | 11 |
| TypeScript | 7.0 was just released |

I will pin TypeScript to the version Expo SDK 58 officially supports, not blindly to 7.0. More on that in section 9.

---

## 1. My understanding of the product

ORÉVA is a Pilates companion for women aged 18 to 35, piloting in Monaco and on the Côte d'Azur. The MVP has to prove one loop:

> discover and book an outdoor class → attend → get a warm, useful follow-up → keep practising at home → stay connected with friends.

What makes it different from a video library or a booking tool is that it **connects** these moments. If it rains, the member gets a kind message and a ready-made home session instead of a dead end. After class, she gets a short check-in and a session her instructor picked. Between classes, a small private Circle of friends keeps her consistent.

Things I'm treating as hard constraints:

* **ORÉVA is the brand.** Gym & Tonic is the *Founding Partner*: clearly featured, but never presented as the owner of the app. Future partners use the same profile template.
* **Humans decide on weather.** The forecast is for information only. Only an authorized instructor or admin can confirm, put on watch, move or cancel a class. No code path changes a class status based on weather data.
* **No invented facts.** Gym & Tonic data, instructor qualifications, prices and schedules stay as clearly marked placeholders (`is_placeholder = true`, plus a visible "Sample data" label in non-production builds) until the partner validates them.
* **Not medical, not appearance-focused.** No weight, calories, measurements, diagnoses or pain tracking. Feedback is limited to feeling, perceived difficulty and an optional comment.
* **Private by default.** Circles are invite-only. No public search, no DMs between strangers, no public feed.
* **Three first-class languages.** English is the default and fallback. French and Russian are complete before any release.
* **North Star:** active members who do at least one Pilates session a week and come back the following week.

Out of scope for V1, as the spec says: camera or posture analysis, generative AI prescribing sessions, open marketplace, multi-party payouts, wearables, livestream, public social features and large-scale Reformer booking.

---

## 2. Recommended architecture

```
┌───────────────────────────────┐        ┌──────────────────────────────────┐
│ Mobile app (iOS / Android)    │        │ Admin & Partner portal (web)     │
│ Expo SDK 58 · RN · TS strict  │        │ Next.js 16 · TS strict           │
│ Expo Router · TanStack Query  │        │ ORÉVA admin · support            │
│ i18next (EN/FR/RU)            │        │ Partner manager · Instructor     │
│ RevenueCat SDK · Expo Notifs  │        │ Public partner landing pages     │
└──────────────┬────────────────┘        └────────────────┬─────────────────┘
               │  publishable key + user JWT only          │ user session (MFA for staff)
               ▼                                           ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│ Supabase (EU region)                                                        │
│  Auth ─ email/password, MFA (TOTP) for staff                                │
│  Postgres ─ RLS on every exposed table                                      │
│     └ RPC functions (security definer) for every business rule:             │
│       create_booking, cancel_booking, respond_waitlist_offer,               │
│       update_class_status, mark_attendance, submit_class_feedback,          │
│       create_circle_invite, join_circle, send_circle_message ...            │
│  Realtime ─ private Broadcast channels (Circle chat, live class status)     │
│  Storage ─ public marketing buckets / private buckets with signed URLs      │
│  Edge Functions (Deno) ─ things that need secrets or third parties:         │
│       revenuecat-webhook, video-playback-token, dispatch-notifications,     │
│       weather-refresh, delete-account, export-my-data                       │
│  pg_cron ─ reminders, after-class scheduling, waitlist offer expiry,        │
│            retention jobs, weather refresh                                  │
└──────┬───────────────┬────────────────┬──────────────────┬──────────────────┘
       ▼               ▼                ▼                  ▼
  Mux / Cloudflare  RevenueCat      Expo Push          Weather API
  Stream (video)   (App Store /    (APNs / FCM)       (forecast only)
                    Google Play)
  PostHog EU (product analytics, no PII) · Sentry EU (crashes, scrubbed)
```

### Key architectural choices

**A. Business rules live in Postgres functions, not Edge Functions.** *(This changes the spec. Needs your approval.)*

The spec lists booking and waitlist under Edge Functions. I recommend `create_booking`, `cancel_booking`, waitlist promotion, attendance, feedback, invites and messages as **Postgres RPC functions** instead.

* Capacity has to be enforced atomically. A transaction with `SELECT ... FOR UPDATE` on the class row is the most reliable way to guarantee CLS-03 and CLS-04, even under concurrent taps.
* It's one network hop instead of two, and the logic is tested with pgTAP right next to the RLS policies.
* The client never writes directly to `bookings`, `class_feedback`, `circle_members` or `subscription_entitlements`. Those privileges are revoked, so the RPC is the only path in.

Edge Functions are kept for work that needs a secret or an outside service: RevenueCat webhooks, signed video tokens, push delivery, weather fetching, account deletion and data export.

**B. Notifications go through an outbox.**

Business functions never send pushes directly. They insert a row in `notifications` with an idempotency key, for example `class_cancelled:{class_id}:{user_id}`. A dispatcher Edge Function, run by pg_cron every minute and by a DB webhook for urgent events like cancellations, then:

* checks preferences, quiet hours and the user's locale
* renders the localized text from the shared i18n keys
* sends through Expo Push
* records receipts and removes dead tokens

The result is no duplicate pushes, retries that are safe, and a full in-app notification history.

**C. Realtime uses private Broadcast, not "Postgres Changes".**

Supabase recommends Broadcast with private channels authorized by RLS on `realtime.messages`. It scales better than Postgres Changes and lets us state exactly who may subscribe to `circle:{id}`. Messages are still written through `send_circle_message` (validation, rate limit, block list). A trigger then broadcasts the stored row.

**D. One staff role model, read from the database.**

The client never sends roles, and I'm not putting roles in custom JWT claims for V1 because they go stale. A `staff_roles` table holds `(user_id, role, partner_id)`, where role is `admin | support | partner_manager | instructor`. Small `private.*` helper functions read it inside policies. Staff accounts must use MFA, and portal policies check `aal2`.

**E. The instructor portal is the responsive Next.js web app for V1.**

The spec allows either a responsive web space or a restricted mobile portal. Web is much less work and works fine on a phone browser at the beach at 7am for weather decisions. If instructors ask for a native "quick actions" view after the pilot, we add it then.

**F. Physical classes: free booking in the pilot.** *(Spec recommendation. Needs Gym & Tonic agreement.)*

Booking in ORÉVA is free. Payment, if any, is handled by Gym & Tonic outside the app, and the class page says so clearly. `price_minor` and `currency` are display-only. No Stripe and no payouts in V1.

---

## 3. Proposed folder structure

A **pnpm + Turborepo monorepo**: one repo, shared tokens, translations and types, and one CI.

```
oreva/
├── apps/
│   ├── mobile/                      # Expo app (iOS + Android)
│   │   ├── app/                     # Expo Router: routes only, thin files
│   │   │   ├── _layout.tsx          # providers: i18n, query, auth, theme
│   │   │   ├── (auth)/              # welcome, sign-in, sign-up, reset-password
│   │   │   ├── (onboarding)/        # language, age, profile questions, consents
│   │   │   ├── (tabs)/              # Home · Classes · Workouts · Circles · Profile
│   │   │   ├── partners/[slug].tsx
│   │   │   ├── classes/[id].tsx
│   │   │   ├── workouts/[id].tsx
│   │   │   ├── player/[workoutId].tsx
│   │   │   ├── programs/[id].tsx
│   │   │   ├── circles/[id]/…
│   │   │   ├── join/[token].tsx     # invite deep link
│   │   │   ├── after-class/[bookingId].tsx
│   │   │   └── paywall.tsx
│   │   ├── src/
│   │   │   ├── features/            # one folder per module: api hooks, components, logic
│   │   │   │   ├── auth/  onboarding/  home/  partners/  classes/
│   │   │   │   ├── workouts/  after-class/  weather/  circles/
│   │   │   │   └── profile/  subscription/
│   │   │   ├── ui/                  # RN design-system components (Button, Card, Chip…)
│   │   │   ├── lib/                 # supabase client, query client, analytics, push, sentry
│   │   │   └── theme/               # maps shared tokens to RN, Reduce Motion helpers
│   │   ├── assets/                  # fonts (with Cyrillic), images, Lottie/Rive files
│   │   ├── app.config.ts            # dev / staging / prod variants
│   │   └── eas.json
│   └── admin/                       # Next.js 16 (App Router)
│       └── src/
│           ├── app/
│           │   ├── (public)/p/[slug]/   # partner QR landing pages (Journey A)
│           │   ├── (auth)/login/
│           │   ├── (admin)/…            # ORÉVA admin + support
│           │   └── (partner)/…          # partner manager + instructor
│           └── lib/supabase/            # @supabase/ssr server + browser clients
├── packages/
│   ├── tokens/        # colors, spacing, radii, type scale, motion (pure TS, used by both apps)
│   ├── i18n/
│   │   ├── locales/en.json fr.json ru.json   # single source for UI + push copy
│   │   └── src/       # init, locale detection, Intl date/number/currency helpers, key-parity test
│   ├── core/          # domain types, Zod schemas, generated DB types, pure helpers
│   │                  # (localized-field fallback, status → UI state mapping, entitlement checks)
│   └── config/        # shared tsconfig (strict), ESLint, Prettier
├── supabase/
│   ├── config.toml
│   ├── migrations/    # timestamped SQL, the only way the schema changes
│   ├── functions/     # Edge Functions (Deno) + _shared/
│   ├── seed/          # fictional data only, every partner row flagged is_placeholder
│   └── tests/         # pgTAP: RLS matrix, booking rules, invites, entitlements
├── e2e/
│   ├── mobile/        # Maestro flows
│   └── admin/         # Playwright
├── docs/
│   ├── product-requirements.md   # English digest of the cahier des charges
│   ├── architecture.md  data-model.md  privacy-security.md  i18n.md
│   ├── decisions/     # ADRs: one short file per approved architectural decision
│   └── runbooks/      # weather cancellation, incident, GDPR request, release
├── .github/workflows/ # ci.yml, db.yml, eas-preview.yml
├── CLAUDE.md          # rules for AI-assisted work (from spec section 16)
├── README.md
├── turbo.json  pnpm-workspace.yaml  package.json  .nvmrc
└── apps/*/.env.example  supabase/.env.example   # names only, no values
```

Two small changes from the section 15 tree:

* `packages/ui` becomes `packages/tokens`. Native components and web components can't really be shared, but tokens can.
* `packages/types` becomes `packages/core`, so it can also hold pure, tested domain helpers.

---

## 4. Required dependencies

Versions get pinned in Phase 1. On mobile, use `npx expo install` so they match SDK 58.

### Mobile (`apps/mobile`)

| Purpose | Package |
| --- | --- |
| Framework | `expo`, `react-native`, `expo-router`, `typescript` |
| Dev builds | `expo-dev-client` (Expo Go can't run RevenueCat or real push) |
| Backend | `@supabase/supabase-js`, `expo-secure-store` (session storage), `@react-native-async-storage/async-storage` (non-sensitive cache) |
| Data | `@tanstack/react-query` |
| Forms | `react-hook-form`, `zod`, `@hookform/resolvers` |
| i18n | `i18next`, `react-i18next`, `expo-localization` |
| UI | `expo-image`, `expo-font`, `react-native-safe-area-context`, `react-native-screens`, `expo-linear-gradient`, `expo-haptics`, `expo-blur` (sparingly) |
| Animation | `react-native-reanimated`, `react-native-gesture-handler`; Lottie or Rive for the rain animation (choose in Phase 6) |
| Video | `expo-video` (HLS from Mux or Cloudflare; no provider SDK needed for playback) |
| Push | `expo-notifications`, `expo-device`, `expo-linking` |
| Subscriptions | `react-native-purchases` (RevenueCat), `react-native-purchases-ui` optional |
| Analytics | `posthog-react-native` (EU host) |
| Errors | `@sentry/react-native` |
| Tests | `jest-expo`, `@testing-library/react-native`, Maestro CLI (E2E) |

**Styling: StyleSheet + typed tokens. NativeWind is not recommended.** The spec says to pick one approach. Plain StyleSheet with a typed theme:

* removes a build layer (Tailwind/Babel in Metro)
* plays well with Reanimated
* keeps the design system explicit, which matters for a bespoke premium look

The admin app uses Tailwind, where it really is the simpler option.

### Admin (`apps/admin`)

`next`, `react`, `@supabase/ssr`, `@supabase/supabase-js`, `tailwindcss`, `zod`, `react-hook-form`, `@tanstack/react-query` (client islands only), `i18next` + `react-i18next` (admin UI in EN/FR/RU too), `@sentry/nextjs`, `posthog-js`. Tests: `vitest`, `@testing-library/react`, `@playwright/test`.

I'd add a small headless component set (Radix primitives, or shadcn/ui copied into the repo) for tables, dialogs and forms. That's the only UI library I'd add.

### Shared and backend

* Tooling: `turbo`, `pnpm`, `eslint` (flat config, `typescript-eslint`, `eslint-config-expo`), `prettier`, `vitest` (packages).
* Database: `supabase` CLI (dev dependency; migrations, local stack, type generation, `supabase test db` for pgTAP).
* Edge Functions: Deno runtime from Supabase, `npm:zod`, `npm:@supabase/supabase-js`, `jose` (signing Mux playback tokens). Tested with `deno test`.

### External services and accounts you'll need to open

| Service | Needed by | Note |
| --- | --- | --- |
| GitHub repository | Phase 1 | Create it and attach it to this session. This container is temporary, so work has to be pushed. |
| Supabase | Phase 1 | Three projects: dev (local Docker), staging, prod. **Staging and prod need a paid plan** (free projects pause, no PITR backups). EU region. |
| Expo / EAS | Phase 1 | Organization account for builds and push credentials. |
| Apple Developer Program | Phase 2 | Organization enrollment needs a D-U-N-S number, which can take weeks. Start now. |
| Google Play Console | Phase 2 | Organization account and identity verification. |
| Domain (e.g. for universal links and landing) | Phase 3 | Needed for QR landing pages and invite links. I haven't assumed any domain name. |
| Weather API | Phase 6 | See section 9. |
| Mux or Cloudflare Stream | Phase 5 | Spike first, then choose. |
| RevenueCat | Phase 8 | Linked to App Store Connect and Play Console. |
| PostHog (EU cloud) · Sentry (EU region) | Phase 1 (Sentry), Phase 8 (PostHog) | |

---

## 5. Database architecture

Conventions:

* UUID primary keys, `created_at` / `updated_at` with triggers, English names, snake_case.
* Times stored in UTC (`timestamptz`), with the class's IANA timezone stored next to them (`Europe/Monaco`).
* Every table in `public` has RLS enabled with **no policies granting access by default**. Helper functions live in a non-exposed `private` schema.
* All changes go through `supabase/migrations`. Production is never edited by hand.

### 5.1 Localized content *(decision needed)*

The spec's `_en/_fr` columns don't scale to Russian, and translation tables are heavy for three fixed languages. I recommend **a `jsonb` column per translatable field**, for example `title = {"en": "...", "fr": "...", "ru": "..."}`:

* A check constraint requires valid keys and a non-empty `en`.
* A `publish_*` function enforces the Addendum rules at publish time:
  * **Partners, programs, community rules and paywall copy:** EN, FR and RU all required.
  * **Workouts and classes:** a `source_language` is required. Other languages are optional, and the app shows which language a session is in and which subtitle languages exist.
* The client resolves the user's locale, then falls back to `en` (helper in `packages/core`, unit-tested).

UI strings are never stored in the database. They live in `packages/i18n/locales/*.json`, including push notification copy, so the dispatcher can render pushes in each user's language.

### 5.2 Tables

Tables marked **new** aren't in the spec's section 7 model but are needed to meet its rules.

**Identity, consent, preferences**

| Table | Purpose / key fields |
| --- | --- |
| `profiles` | `id = auth.users.id`, display_name, avatar_path, locale (`en/fr/ru`), timezone, `age_confirmed_at` (no birth date: data minimization), onboarding_completed_at |
| `member_preferences` | level, preferred_duration, equipment[], practice_preferences[], goals[] (fixed non-medical list), activity_visibility_default |
| `notification_preferences` **new** | per-category toggles (reminders, class updates, after class, circles, marketing), quiet hours start and end |
| `consents` | consent_type (terms, privacy, marketing, push, analytics), version, granted, granted_at, source. Insert-only, never updated, so it works as an audit trail. |
| `push_tokens` **new** | user_id, expo_token, platform, last_seen_at, revoked_at |
| `staff_roles` **new** | user_id, role (`admin, support, partner_manager, instructor`), partner_id (nullable for admin and support) |
| `partner_attributions` **new** | user_id, partner_id, code, channel (QR, link), consented_at. Covers the spec's "attribution documentée". |

**Partners and instructors**

| Table | Purpose / key fields |
| --- | --- |
| `partners` | slug, name, status (`founding_partner, partner, inactive`), partner_type, city, description (localized), logo_path, cover_path, instagram_url, website_url, attribution_code, **is_placeholder** |
| `partner_categories` | partner_id, category (outdoor, mat, reformer…) |
| `instructors` | partner_id, user_id (nullable; links a portal account), display_name, bio (localized), photo_path, `qualifications_declared` (labelled "declared by the partner" in the UI), photo_consent_at, active, **is_placeholder** |

**Classes and bookings**

| Table | Purpose / key fields |
| --- | --- |
| `classes` | partner_id, instructor_id, title and description (localized), source_language, starts_at, timezone, duration_min, capacity, level, equipment[], location_label (public: "Larvotto beach"), price_minor, currency, lifecycle_status, update_state, update_reason (localized), next_update_at, alternative_workout_id, replaced_by_class_id |
| `class_private_details` **new** | class_id, meeting_point, organizer_contact, conditions. Readable only by members with an active booking and by the class's staff. It's a separate table because RLS works on rows, not columns. |
| `class_policies` **new** | per partner, optional per-class override: booking_opens_hours, member_cancel_cutoff_hours, waitlist_offer_minutes, after_class_delay_minutes (default 60, allowed range 30 to 90) |
| `class_status_events` **new** | full history of every status or update change: actor, from, to, reason, created_at. Covers "conserver l'historique". |
| `bookings` | class_id, user_id, status (`confirmed, waitlisted, offered, cancelled_by_member, cancelled_by_organizer, declined_move`), offer_expires_at, waitlist_position, attendance (`unknown, attended, no_show`), source_partner_id, booked_at, cancelled_at. A partial unique index `(class_id, user_id) WHERE status IN (active statuses)` enforces CLS-03. |
| `weather_snapshots` **new** | class_id, provider, fetched_at, forecast summary (temperature, precipitation probability, wind, icon code), source attribution. Read-only for members, display only. Nothing reads this table to change a class status. |

**Content and progress**

| Table | Purpose / key fields |
| --- | --- |
| `video_assets` **new** | provider, provider_asset_id, playback_id, status, duration_sec, caption_tracks (language list). Not readable by members; playback goes through a signed token. |
| `workouts` | instructor_id, partner_id, title, description and precautions (localized), source_language, audio_language, duration_sec, level, category, equipment[], video_asset_id, thumbnail_path, premium_only, published_at |
| `programs` / `program_days` | as in the spec, localized text, `premium_only` |
| `program_enrollments` **new** | user_id, program_id, started_at, current_day. Needed for "progression simple". |
| `workout_progress` **new** | user_id, workout_id, position_sec, updated_at. For "reprendre une vidéo interrompue". |
| `workout_completions` | user_id, workout_id, completed_at, duration_completed_sec, source (`home, after_class, program, circle_challenge`) |
| `recommendation_rules` **new** | explicit editorial rules: (class or instructor or level) → workout, plus onboarding rules for ONB-03. Created by instructors and admins only. Readable and explainable. |

**After Class**

| Table | Purpose / key fields |
| --- | --- |
| `class_feedback` | booking_id (unique), user_id, feeling (1 to 5), difficulty (1 to 5), comment (max 500 chars, optional), submitted_at, visibility_policy_version |
| (function) `partner_feedback_summary` | returns aggregates only when there are at least **5** responses (threshold configurable). Otherwise it returns "not enough responses". |

**Circles**

| Table | Purpose / key fields |
| --- | --- |
| `circles` | owner_id, name, description, avatar_path, max_members (default 10, minimum 3 to be "active"), created_at |
| `circle_members` | circle_id, user_id, role (`owner, member`), status (`active, left, removed`), notification_setting, share_activity (bool, off by default) |
| `circle_invites` **new** | circle_id, created_by, token_hash (SHA-256 of a 128-bit random token; the raw token exists only in the link), expires_at, max_uses, use_count, revoked_at |
| `circle_messages` | circle_id, sender_id, kind (`text, class_share, challenge_share, system`), body (max 1,000 chars), ref_id, created_at, deleted_at, moderation_status |
| `circle_challenges` / `challenge_progress` | as in the spec. Joining a challenge is voluntary (a row exists only if the member opts in). |
| `user_blocks` **new** | blocker_id, blocked_id. Blocked members' messages are hidden for the blocker, and they can't invite each other. |
| `reports` | reporter_id, target_type, target_id, reason, status, resolved_by, resolved_at |

**Notifications, billing, audit**

| Table | Purpose / key fields |
| --- | --- |
| `notifications` | user_id, type, payload (keys and params, not rendered text), deep_link, idempotency_key (unique), scheduled_at, sent_at, read_at, status, attempt_count |
| `subscription_entitlements` | user_id, provider, entitlement, status, expires_at, provider_user_id. Written only by the webhook function. |
| `billing_events` **new** | provider_event_id (unique, gives idempotency), type, received_at, processed_at. Raw payload kept for a limited time. |
| `audit_logs` | actor_id, action, entity_type, entity_id, metadata_minimal, created_at. Written by every staff RPC. |

### 5.3 Class status model *(decision needed)*

CLS-02 mixes three different things. I propose splitting them:

| Concept | Values | Stored? |
| --- | --- | --- |
| **Lifecycle** | `draft → published → completed`, or `cancelled` | yes, `lifecycle_status` |
| **Update state** (the weather and organizer layer) | `none`, `weather_watch` (with `next_update_at`), `confirmed`, `moved` | yes, `update_state` |
| **Availability** | `open`, `full_waitlist_open`, `full` | **computed** from bookings and capacity, never stored, so it can't drift |

The app combines them into one clear state for members: "Confirmed", "Weather watch, next update 7:30", "Cancelled, rain", "Moved to Sat 9:00", "Full, join waitlist".

### 5.4 Business rules as RPC functions (section 11 contracts)

| Function | Notes |
| --- | --- |
| `create_booking(class_id)` | Locks the class row, checks published, not cancelled, booking window open, no active booking, capacity. Creates `confirmed` or `waitlisted` in one transaction. Queues the "booking confirmed" notification. |
| `cancel_booking(booking_id)` | Owner only, applies the cutoff policy. Frees the seat and offers it to the first waitlisted member (`offered`, expires after `waitlist_offer_minutes`). |
| `respond_waitlist_offer(booking_id, accept)` | Accept within the window or the offer passes to the next person. pg_cron expires stale offers every minute. |
| `update_class_status(class_id, change, reason, …)` | Instructor of that class's partner, partner manager or admin only. Writes `class_status_events` and the audit log, frees seats on cancel, queues notifications for all active bookings. **There is no automatic caller.** |
| `move_class(class_id, new_starts_at, new_location, reason)` | Keeps history. Bookings stay confirmed, and each member can decline without penalty (`declined_move`). *Option: require explicit re-acceptance instead. Founders to decide.* |
| `mark_attendance(booking_id, attendance)` | Class staff only. Once the class is `completed` and attendance is `attended`, it calls `schedule_after_class`. |
| `schedule_after_class(class_id)` | One notification per attended booking, with an idempotency key, scheduled for the end time plus the delay. One gentle reminder if there's no answer, never more. |
| `submit_class_feedback(booking_id, …)` | Owner only, attendance must be `attended`. One submission, editable for 24h. |
| `create_circle_invite(circle_id)` / `join_circle(token)` | Generates the token, stores only its hash, enforces expiry, max uses, max members and blocks. |
| `send_circle_message(circle_id, body, kind, ref_id)` | Active member only, length limit, rate limit (for example 20 messages per minute per user per circle), then broadcast. |

---

## 6. Security approach

**Keys and secrets**

* The mobile app ships only the Supabase URL and the **publishable** key, plus public RevenueCat SDK keys, the PostHog project key and the Sentry DSN, which are all designed to be public.
* Never in the app or in git: the secret/service-role key, Mux signing keys, the RevenueCat secret and webhook auth, weather API keys, or the Expo access token. They live in Supabase function secrets, Vercel or host env vars, EAS secrets and GitHub Actions secrets.
* The admin app uses the logged-in user's session and RLS. If an admin action really needs elevated rights (for example inviting a staff user), it goes through a single server-only module, or an Edge Function that re-checks the caller's role.
* Gitleaks runs in CI and as a pre-commit hook.

**RLS and permissions**

* RLS is enabled on every table. Writes to sensitive tables are revoked from `authenticated`, and the RPC functions are the only write path. Policies call `private.is_admin()`, `private.has_partner_role(partner_id, roles)` and `private.is_active_circle_member(circle_id)`. These are all `security definer` with a fixed `search_path`, and policies use `(select auth.uid())` for performance.
* **An RLS test matrix in pgTAP** runs on every PR. Each table is tested as anonymous, member A, member B, instructor of partner X, instructor of partner Y, partner manager, support and admin. That covers the spec's security tests: cross-user access, unauthorized partner access, forged invites, chat spam and invalid webhooks.
* Staff must have MFA. Portal policies require `aal2`.
* Other Circle members only see your display name and avatar, through a narrow view. Never your email or other profile data.

**Server-side validation**

* Postgres `CHECK` constraints for limits (text lengths, ranges, enums).
* RPC functions re-validate everything. Zod is used on the client for user experience, and in Edge Functions for request payloads. Client checks are never trusted.
* Rate limits: chat (in the DB function), invites (per user per day), auth (Supabase built-in limits plus CAPTCHA on sign-up if abuse shows up).

**Payments and entitlements**

* RevenueCat `app_user_id` is the Supabase user id. The webhook function checks the configured authorization header. (RevenueCat uses a shared auth header rather than an HMAC signature, so "vérifie signature" in the spec becomes "verify the auth header, then re-fetch the subscriber from the RevenueCat API before trusting the event".) Events are deduplicated by `provider_event_id`.
* Premium content checks happen on the server: `video-playback-token` refuses a Premium workout without an active entitlement row. The client's RevenueCat state is only used to update the UI quickly.

**Storage**

* Public buckets: `partner-media`, `workout-thumbnails` (marketing assets only).
* Private buckets: `avatars`, `circle-avatars`, accessed with short-lived signed URLs.
* Upload limits on size and MIME type, and image metadata stripped.
* Videos only play from signed HLS URLs that expire.

**Privacy by design (GDPR and Monaco)**

* Supabase, PostHog and Sentry all in the EU. Data processing agreements with every processor: Supabase, Expo, Apple, Google, RevenueCat, the video provider, PostHog, Sentry, the weather provider.
* No birth date, weight, measurements or medical fields. Onboarding goals come from a fixed non-medical list.
* Feedback (feeling and difficulty) is treated as **possibly health-related** until a lawyer says otherwise. It has its own consent text and visibility notice, a short retention period (proposal: individual feedback kept 12 months, then only aggregates), and is visible only to the member and her class's partner staff.
* Analytics: no free text, no emails, no names in event properties. Users are identified by an opaque id. PostHog only starts after the analytics consent if counsel says it's required (Monaco has its own data protection law and authority alongside GDPR for EU residents, so this needs a legal check).
* Sentry scrubs request bodies and user data before sending.
* In-app **account deletion**, which Apple requires: an Edge Function deletes the auth user and either cascades or anonymizes linked rows. Messages become "Deleted member", and aggregate stats are kept. In-app **data export** produces a JSON file.
* Retention jobs run via pg_cron: notifications 90 days, reports and evidence as the moderation policy says, billing events as the law requires.
* Seed and test data are always fictional. No real member data goes into prompts, staging or screenshots.

**Process**

* Human review is required on every migration and every policy change. That's also in `CLAUDE.md`.
* Before the beta, an independent RLS review (spec section 17).

---

## 7. Development roadmap

Every phase ends with lint, typecheck and tests passing, EN/FR/RU keys in sync, and a short report of what works, what doesn't, and what I couldn't test (for example device-only behaviour). Each phase is a branch and PR you review.

| Phase | Scope | Exit criteria |
| --- | --- | --- |
| **0. Planning** (this document) | Spec review, architecture, decisions | You approve or amend this plan |
| **1. Foundation** | Monorepo, Expo app with dev, staging and prod variants, Next.js admin shell, TS strict, ESLint, Prettier, Vitest and Jest, CI. Tokens and fonts, base components (Text, Button, Card, Chip, Screen, Skeleton, EmptyState, ErrorState). Tab navigation. i18n EN/FR/RU with locale detection and manual switch, plural and date tests, CI key-parity test. Static Home faithful to the visual reference. Local Supabase with an empty schema and the RLS skeleton. Sentry. README, CLAUDE.md, `.env.example` files. | App runs on iOS and Android dev builds. Language switch works live. CI is green. Russian layout checked on small screens. |
| **2. Auth and onboarding** | Sign up, sign in, reset password, 18+ confirmation, consents (nothing pre-checked, timestamped), onboarding questions (skippable, editable), first program suggestion from explicit rules, notification preferences, account deletion, data export | Spec checks AUTH-01 to 03 and ONB-01 to 03 pass. RLS tests for profiles, preferences and consents. Localized auth errors. |
| **3. Home, Partners, Gym & Tonic** | Partner directory and profile template, Founding Partner badge, Gym & Tonic **placeholder** profile, instructor cards (declared qualifications), public QR landing page and attribution capture, Home dashboard wired to real data (empty or placeholder states for modules not built yet) | Partner content renders in three languages. Placeholder flags are visible in non-prod. Attribution is recorded with consent. |
| **4. Classes, bookings, instructor management** | Class list and detail, booking, cancellation, waitlist with timed offers, private meeting point, partner portal: create and edit classes, attendees, attendance, cancellation | CLS-01 to 08 pass. Concurrency test: 50 simultaneous bookings for 10 seats gives exactly 10 confirmed. RLS matrix for bookings. |
| **5. Workouts and video** | Video provider spike (Mux vs Cloudflare, see section 9), library with filters, workout page, player with resume, captions, programs and progression, completions, free vs Premium flag (the paywall itself comes in Phase 8) | Signed playback works. Resume works. Captions selectable. Audio language shown. |
| **6. After Class, Weather and Class Updates** | Weather snapshots (display only), instructor status controls (watch, confirm, move, cancel) with reasons, outbox and push dispatcher, deep links, quiet hours, cancellation card with the animated rain state (respects Reduce Motion), alternative home session, After Class prompt and feedback, aggregated partner view with threshold | Journeys B and C pass end to end on devices. A test proves no code path changes status from weather data. Notifications are idempotent. |
| **7. Pilates Circles** | Create a Circle, invite by link or code, join, leave, chat (Broadcast, pagination, timestamps), class and challenge sharing, simple challenges, activity sharing toggle, block, report, delete own message, message notifications grouped | Security tests: forged or expired invite, non-member read, spam limit. Moderation queue works in admin. |
| **8. Admin, subscriptions, analytics** | Full admin: content publishing (enforces translation rules), partners, classes, moderation, users, GDPR requests, audit log. RevenueCat products, paywall with clear price, period, renewal and cancellation info, restore purchases, webhook, entitlement gating. PostHog with the spec's 19 events, no PII. | Sandbox purchase, restore and cancel tested on both stores. Paywall reviewed against current Apple and Google rules. |
| **9. QA, security, beta** | Full E2E (sign up → onboarding → booking → attendance → After Class → workout → Circle), accessibility pass (VoiceOver, TalkBack, dynamic type, contrast, Reduce Motion), weak network and timezone tests, independent RLS review, store listings, privacy labels, TestFlight and Play internal testing, runbooks | The spec section 17 checklist is complete. Beta goes out to the Gym & Tonic pilot cohort. |

**One sequencing note.** The Home dashboard (Phase 3) shows the next booking and the daily practice, but those only exist after Phases 4 and 5. I'll build Home in Phase 3 with proper empty states and connect each card when its module lands, rather than faking data.

---

## 8. Design system notes (Phase 1)

Tokens from section 10 of the spec, with an accessibility check I ran on the proposed colors:

| Pair | Contrast | WCAG AA (4.5:1 text, 3:1 large text and UI) |
| --- | --- | --- |
| Lavender `#A88AF0` text on white | 2.78 | **fails**, even for large text |
| Lavender `#A88AF0` text on ivory `#F8F7F5` | 2.59 | **fails** |
| Dark text `#26232D` on lavender `#A88AF0` | 5.55 | passes |
| Secondary text `#77717E` on ivory `#F8F7F5` | 4.41 | **fails narrowly** |
| Secondary text `#77717E` on white | 4.72 | passes |
| Dark text on soft pink / soft green | 11.7 / 12.8 | passes |

My proposal keeps the look you chose:

* `#A88AF0` stays the signature color for fills, selection, progress rings and large surfaces.
* Lavender buttons get **dark text** (`#26232D`).
* A deeper lavender (around `#6B4FCF`, 5.8:1 on white) is used for links and text accents.
* Secondary text goes to around `#6F6977` (4.95:1 on ivory).

I'll show the swatches next to the visual reference before locking them in.

* **Typography.** One editorial serif for display and one clean sans-serif for UI, **both with full Cyrillic support** and an open (OFL) license. I'll propose 2 or 3 pairings on real screens in EN, FR and RU so you can choose.
* **Motion.** Short, soft animations (Reanimated). Every animation has a Reduce Motion fallback, including the rain state, which falls back to a static illustration.
* **Photography.** Editorial photos come from you or the partner with documented rights. Placeholders in development are clearly marked as such. I won't use stock images that look like real Gym & Tonic content.
* **Avoiding the "AI fitness app" look.** No gradient-heavy hero cards, no emoji-filled UI, no generic icon packs at default weights, no neon progress charts. Generous whitespace, a strong type hierarchy, few colors, real photography.

---

## 9. Potential technical problems

1. **Accessibility of the brand lavender.** See section 8. If we don't fix it now, it becomes a store review and accessibility issue later.
2. **Partner attribution without a third-party SDK.** When the app isn't installed yet, iOS doesn't reliably pass the QR context through the App Store. Options:
   * (a) the landing page shows a short partner code that's pre-suggested at sign-up ("Joined through a partner?"), plus universal links for people who already have the app. Simple and private. **Recommended for the pilot.**
   * (b) a deferred deep-linking provider such as Branch or AppsFlyer. Adds a processor and needs a privacy review.
3. **Store payment rules.** Digital subscriptions for in-app content must use in-app purchase. Physical classes can be paid outside. Rules on external payment links have been changing by region, so I'll check the current Apple and Google guidelines in Phase 8 rather than relying on what I know today.
4. **App Store user-generated content rules.** Because Circles has chat, Apple requires reporting, blocking, a way to filter objectionable content and published contact information. These are already in scope. They have to ship in the same release as chat, not later.
5. **Russian and plurals.** Russian has 4 plural categories, and strings run about 20 to 30% longer than English. I'll test `Intl.PluralRules` and `Intl.DateTimeFormat` on Hermes on both platforms in Phase 1, and add a long-string "pseudo-locale" for layout testing.
6. **Timezones and daylight saving.** Classes are in `Europe/Monaco`, members may be travelling, and quiet hours depend on the member's own timezone. All times are stored in UTC, displayed in the class timezone for classes and in the user's timezone for reminders, with tests around DST changes.
7. **Push reliability.** Android 13+ and iOS both require permission, tokens expire, and Expo push has receipts that must be checked. The outbox design handles retries and cleans up dead tokens. The in-app notification list means nothing important depends only on push.
8. **Video provider choice.** Both Mux and Cloudflare Stream offer HLS, signed playback and captions, and both play in `expo-video`. Mux has stronger playback analytics and developer experience. Cloudflare usually has simpler storage and delivery pricing. Plan: a 1-day spike in Phase 5 with 3 real test videos on both, comparing quality on mobile networks, signed URL setup, caption workflow and cost at your expected library size and viewer numbers. **Leaning Mux until the spike says otherwise.** I'll use current pricing pages, not figures from memory.
9. **Weather provider licensing.** Free tiers (for example Open-Meteo) are often non-commercial only. Options include a paid Open-Meteo API plan, OpenWeather or Météo-France data. Weather is fetched server-side and cached per class (every 1 to 3 hours, more often on class day), with source and "last updated" shown, as the spec requires. To decide in Phase 6.
10. **Monorepo and Metro.** pnpm workspaces work with Expo, but some native packages expect hoisted `node_modules`. If isolated installs cause trouble, I'll use `node-linker=hoisted` and document why. Edge Functions run on Deno and can't import workspace packages directly, so shared schemas will be imported with explicit relative paths, or kept duplicated and covered by a parity test.
11. **TypeScript 7.** TS 7 (the native compiler) is very new. Expo, Next.js and typescript-eslint support may lag behind it. I'll pin the version Expo SDK 58 recommends and revisit later.
12. **Supabase plan limits.** Free projects pause after inactivity and don't have point-in-time recovery. Staging and production need a paid plan before the pilot.
13. **Apple organization enrollment.** The D-U-N-S number and verification can take several weeks and would block TestFlight. Please start this now.
14. **AI-assisted development risk.** Plausible-looking but wrong RLS policies are the biggest risk in this kind of project. That's why every table gets pgTAP tests across all roles, and why migrations always get human review.
15. **Legal dependencies outside the code.** The feedback data classification, the Gym & Tonic agreement (logo, photos, instructor details), terms, privacy policy, refund and cancellation policy, and insurance all block the beta, not development. We can build in parallel with placeholders.

---

## 10. Decisions I need from you before Phase 1

| # | Decision | My recommendation |
| --- | --- | --- |
| 1 | Repo layout | pnpm + Turborepo monorepo, as in section 3 |
| 2 | Business rules location | Postgres RPC functions, with Edge Functions only for secrets and third parties (changes the spec's section 6.1 wording) |
| 3 | Mobile styling | StyleSheet + typed tokens (no NativeWind). Tailwind for admin only. |
| 4 | Localized DB content | `jsonb` per field `{en, fr, ru}` with publish-time checks |
| 5 | Class status model | Lifecycle + update state + computed availability (section 5.3) |
| 6 | Moved class | Bookings stay confirmed, and members can decline without penalty. Or: explicit re-acceptance. |
| 7 | Instructor tooling | Responsive web portal in V1 |
| 8 | Physical class payment | Free booking in the app. Payment handled by Gym & Tonic, clearly stated. |
| 9 | Age check | 18+ self-confirmation with a timestamp, no birth date |
| 10 | Sign-in methods | Email and password only in V1, as in the spec. (Adding Google sign-in later means we'd also have to add Sign in with Apple.) |
| 11 | Partner attribution | Partner code + universal links, no third-party attribution SDK |
| 12 | Hosting region | Supabase EU, either Paris or Frankfurt |
| 13 | Feedback visibility threshold | Aggregates shown from 5 responses |
| 14 | Lavender accessibility adjustments | Dark text on lavender buttons, plus a deeper lavender for text accents |

**Things I need from you (not decisions):**

* The visual reference screenshot (it isn't in the .docx).
* A GitHub repository attached to this session.
* Confirmation of who will own the Supabase, Expo, Apple, Google and later RevenueCat accounts. I'll never ask you to paste secrets in chat.
* The app identifiers you want (for example `com.<company>.oreva`). I won't guess the company name.

---

## 11. Initial setup commands (Phase 1, not run yet)

Prerequisites on your machine: Node 22 LTS, Docker Desktop (for local Supabase), Xcode and/or Android Studio optional (EAS can build in the cloud).

```bash
corepack enable
```

```bash
mkdir oreva && cd oreva && git init
```

```bash
corepack use pnpm@latest
```

```bash
pnpm dlx create-expo-app@latest apps/mobile --template default
```

```bash
pnpm create next-app@latest apps/admin --typescript --eslint --tailwind --app --src-dir --import-alias "@/*" --use-pnpm
```

```bash
pnpm add -D -w turbo typescript prettier vitest supabase
```

```bash
pnpm supabase init
```

```bash
pnpm supabase start
```

```bash
pnpm supabase migration new foundation_rls_skeleton
```

```bash
cd apps/mobile && npx expo install expo-dev-client expo-localization expo-secure-store expo-image expo-font react-native-reanimated react-native-gesture-handler @react-native-async-storage/async-storage
```

```bash
cd apps/mobile && pnpm add @supabase/supabase-js @tanstack/react-query i18next react-i18next zod react-hook-form @hookform/resolvers
```

```bash
npm install -g eas-cli
```

```bash
cd apps/mobile && eas login && eas init && eas build:configure
```

```bash
cd apps/mobile && eas build --profile development --platform all
```

Day-to-day commands once the foundation exists (all defined in the root `package.json`):

```bash
pnpm dev
```

```bash
pnpm lint && pnpm typecheck && pnpm test
```

```bash
pnpm db:test
```

```bash
pnpm db:types
```

### Environment variable names (values never committed)

**Mobile** (`EXPO_PUBLIC_*` values end up in the app bundle and are public by design):

```
APP_VARIANT                         # development | staging | production
EXPO_PUBLIC_SUPABASE_URL
EXPO_PUBLIC_SUPABASE_PUBLISHABLE_KEY
EXPO_PUBLIC_REVENUECAT_IOS_KEY
EXPO_PUBLIC_REVENUECAT_ANDROID_KEY
EXPO_PUBLIC_POSTHOG_KEY
EXPO_PUBLIC_POSTHOG_HOST
EXPO_PUBLIC_SENTRY_DSN
SENTRY_AUTH_TOKEN                   # EAS/CI secret only, for source maps
```

**Admin:**

```
NEXT_PUBLIC_SUPABASE_URL
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY
NEXT_PUBLIC_POSTHOG_KEY
NEXT_PUBLIC_SENTRY_DSN
SUPABASE_SECRET_KEY                 # server-only module, narrowly used, never NEXT_PUBLIC
```

**Supabase Edge Function secrets:**

```
SUPABASE_SECRET_KEY
REVENUECAT_WEBHOOK_AUTH
REVENUECAT_SECRET_API_KEY
MUX_TOKEN_ID
MUX_TOKEN_SECRET
MUX_SIGNING_KEY_ID
MUX_SIGNING_PRIVATE_KEY             # or CLOUDFLARE_STREAM_* after the spike
WEATHER_API_KEY
EXPO_ACCESS_TOKEN                   # enhanced push security
```

---

*ORÉVA: Your movement. Your moment.*
