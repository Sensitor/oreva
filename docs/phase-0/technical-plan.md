# ORÉVA · Phase 0 technical plan (revision 3)

| | |
| --- | --- |
| Status | Decisions approved by the founders. Final document review in the Phase 0 PR. **Phase 1 starts only after explicit approval.** |
| Revision | 3, dated 8 November 2026. Replaces revision 2 (8 Nov) and revision 1 (7 Nov). |
| Decisions | See [`decision-record.md`](./decision-record.md). IDs like D-02 or P-04 refer to it. |
| Design | See [`../design/visual-reference.md`](../design/visual-reference.md) |

## What changed in revision 3

* **P-05 reconfirmation deadlines** are now fully specified, including short-notice moves: a guaranteed minimum response window, a minimum notice for significant moves, and the test scenarios (section 5.5).
* **P-09 map:** an interactive map in Discover is approved. The comparison method for `react-native-maps` vs Mapbox is defined, and the provider is recommended only after the spike (section 5.6).
* All proposals are approved. The decision record is updated to match.

## What changed in revision 2

* **The three pillars (DISCOVER, PRACTICE, CONNECT)** now shape navigation, folder structure and the roadmap.
* **Marketplace-ready, international architecture:** organizations, independent instructors, venues with PostGIS, cities with a launch status, multiple currencies and time zones, and languages as configuration.
* **Payment-ready booking:** booking states and price snapshots support future paid classes, packages and in-app payments. The pilot stays free.
* **Explicit reconfirmation** when a class is moved significantly.
* **Visual reference analysed**, with sampled palette, contrast fixes, and content we won't copy.
* **App identifiers** set per environment, with the conflict check results.
* **Placeholder guard** that stops invented partner data reaching production.

---

## 1. Product understanding

ORÉVA is a premium Pilates platform built on three pillars:

* **Discover:** find instructors, studios and in-person classes near you, anywhere.
* **Practice:** a premium digital library of workouts and programs that is valuable on its own.
* **Connect:** relationships with instructors, communities and private Circles of friends.

**The MVP proves the core loop in one place.** In Monaco and on the Côte d'Azur, with Gym & Tonic as Founding Partner, a member can:

1. discover and book an outdoor class
2. attend it
3. get a warm follow-up after class
4. keep practising at home
5. stay connected with friends

**The long-term vision is international.** Independent instructors and studios in cities like London, Paris and Dubai will publish classes that any ORÉVA member can find and book while travelling. Revenue will come from a digital membership and, later, from physical class bookings (commissions, packages, instructor subscriptions, studio partnerships).

Hard constraints carried over from the spec:

* ORÉVA is the main brand.
* A human always decides on weather cancellations.
* No invented partner facts.
* No medical, weight, calorie or appearance features.
* Private by default.
* EN/FR/RU from day one.
* Adults only.

**North Star:** active members who do at least one Pilates session a week and come back the following week.

---

## 2. Architecture

```
┌────────────────────────────────────┐      ┌────────────────────────────────────┐
│ Mobile app (iOS / Android)         │      │ Web: Admin & Provider portal       │
│ Expo SDK 58 · RN · TS strict       │      │ Next.js 16 · TS strict             │
│ Tabs: Home · Discover · Practice · │      │ Platform admin · support           │
│       Connect · Profile            │      │ Organization owner/manager         │
│ TanStack Query · i18next           │      │ Instructor                         │
│ expo-video · maps (P-09)           │      │ Public pages: partner landing (QR),│
│ RevenueCat SDK · Expo Notifs       │      │ instructor/studio share links      │
└───────────────┬────────────────────┘      └─────────────────┬──────────────────┘
                │ publishable key + user JWT                  │ user session (MFA for staff)
                ▼                                             ▼
┌───────────────────────────────────────────────────────────────────────────────────┐
│ Supabase (EU)                                                                     │
│  Auth (email/password; MFA for staff)                                             │
│  Postgres + PostGIS, RLS on every exposed table                                   │
│   ├ Discover RPC: search_classes, search_instructors, search_organizations        │
│   ├ Booking RPC:  create_booking, cancel_booking, respond_waitlist_offer,         │
│   │               reconfirm_booking, mark_attendance                              │
│   ├ Organizer RPC: update_class_status, move_class, publish_*                     │
│   ├ Feedback / Circles RPC: submit_class_feedback, create_circle_invite,          │
│   │               join_circle, send_circle_message, follow / unfollow             │
│   └ Outbox: notifications (idempotent)                                            │
│  Realtime: private Broadcast channels (Circle chat, live class status)            │
│  Storage: public marketing buckets / private buckets with signed URLs            │
│  Edge Functions (Deno): revenuecat-webhook, video-playback-token,                │
│     dispatch-notifications, weather-refresh, delete-account, export-my-data,     │
│     [later] payments-webhook, payouts                                            │
│  pg_cron: reminders, after-class, waitlist + reconfirmation expiry, weather,     │
│     retention                                                                    │
└──────┬──────────────┬──────────────┬─────────────┬──────────────┬────────────────┘
       ▼              ▼              ▼             ▼              ▼
  Video (Mux /    RevenueCat     Expo Push     Weather API    Maps provider
  Cloudflare)    (store IAP)    (APNs/FCM)    (info only)    (P-09)
  PostHog EU · Sentry EU                       [later] Payment provider
                                               with marketplace payouts
```

### Key choices (approved unless marked)

**A. Business rules live in Postgres RPC functions (D-02).** Capacity, waitlist, reconfirmation and permission checks run in one transaction with row locks. The client can't write to sensitive tables directly. Edge Functions are only used for secrets and third-party services.

**B. Notifications go through an outbox.** Business functions insert idempotent notification rows. A dispatcher function then renders the text in the member's language, applies preferences and quiet hours, sends the push and records receipts.

**C. Realtime uses private Broadcast channels**, authorized by RLS on `realtime.messages`.

**D. Roles are read from the database, never from the client.** There are two separate layers:

* **Platform roles** (`platform_roles`: admin, support) for ORÉVA staff.
* **Organization roles** (`organization_members`: owner, manager, instructor), each scoped to one organization.

Policies call small `private.*` helper functions. Staff accounts require MFA (`aal2`).

**E. Every provider is an organization (P-01).** Studios, communities and brands are organizations, and an independent instructor gets an organization of one. This gives one permission model, one portal and one booking engine for Gym & Tonic today and thousands of providers later. *Founding Partner* is a tier on the organization (`partner_tier`), separate from its type.

**F. Location is global, launch scope is data (P-03).** Venues store a PostGIS point, an address, a timezone and an address visibility setting. Cities carry a `launch_status`, and Discover only shows `live` cities. Opening London is an operations decision, not a release.

**G. Booking is payment-ready (P-04).** The pilot only allows `free` and `pay_at_venue`. The states, price snapshots and seat holds needed for `in_app` and `package_credit` exist from day one, so adding a payment provider later doesn't change the booking engine.

**H. Languages and regions are configuration (P-06, P-07).** Locales, required-for-publishing rules and currencies are data. Layouts use logical `start`/`end` properties so right-to-left languages can be added later.

**I. The instructor and provider portal is responsive web (D-06).** Provider accounts are created by ORÉVA staff in V1. Self-service onboarding, verification and instructor subscriptions come after the MVP and use the same model.

---

## 3. Folder structure

```
oreva/
├── apps/
│   ├── mobile/                          # Expo app (iOS + Android)
│   │   ├── app/                         # Expo Router: thin route files only
│   │   │   ├── _layout.tsx              # providers: i18n, query, auth, theme
│   │   │   ├── (auth)/                  # welcome, sign-in, sign-up, reset-password
│   │   │   ├── (onboarding)/            # language, 18+, profile questions, consents, home city
│   │   │   ├── (tabs)/
│   │   │   │   ├── index.tsx            # Home (Today)
│   │   │   │   ├── discover/            # classes, instructors, studios, list + map
│   │   │   │   ├── practice/            # library, programs
│   │   │   │   ├── connect/             # Circles, following
│   │   │   │   └── profile/             # account, my classes, progress, settings
│   │   │   ├── classes/[id].tsx
│   │   │   ├── instructors/[slug].tsx
│   │   │   ├── organizations/[slug].tsx # partner / studio profile
│   │   │   ├── workouts/[id].tsx  player/[workoutId].tsx  programs/[id].tsx
│   │   │   ├── circles/[id]/…  join/[token].tsx
│   │   │   ├── after-class/[bookingId].tsx
│   │   │   └── paywall.tsx
│   │   ├── src/
│   │   │   ├── features/
│   │   │   │   ├── account/             # auth, onboarding, consents, preferences, deletion
│   │   │   │   ├── home/
│   │   │   │   ├── discover/            # search, filters, map, organizations, instructors
│   │   │   │   ├── booking/             # booking, waitlist, reconfirmation, my classes
│   │   │   │   ├── class-updates/       # weather & status states, rain animation
│   │   │   │   ├── practice/            # workouts, player, programs, progress
│   │   │   │   ├── after-class/
│   │   │   │   ├── connect/             # circles, chat, challenges, follows, moderation
│   │   │   │   └── membership/          # paywall, entitlements
│   │   │   ├── ui/                      # design-system components
│   │   │   ├── lib/                     # supabase, query client, analytics, push, sentry, location
│   │   │   └── theme/                   # tokens → RN, Reduce Motion, RTL-safe helpers
│   │   ├── assets/                      # fonts (Cyrillic), images, animations
│   │   ├── app.config.ts                # APP_VARIANT → identifiers, names, schemes
│   │   └── eas.json
│   └── admin/                           # Next.js 16 (App Router)
│       └── src/app/
│           ├── (public)/p/[slug]/       # partner QR landing + attribution
│           ├── (auth)/login/
│           ├── (platform)/…             # ORÉVA admin + support
│           └── (provider)/…             # organization owner/manager + instructor
├── packages/
│   ├── tokens/        # colors, type, spacing, radii, shadows, motion
│   ├── i18n/          # locales/en.json fr.json ru.json, locale config, Intl helpers, parity tests
│   ├── core/          # domain types, Zod schemas, generated DB types, pure helpers
│   │                  # (localized fallback, class state mapping, money/distance formatting)
│   └── config/        # tsconfig (strict), ESLint, Prettier
├── supabase/
│   ├── config.toml
│   ├── migrations/    # timestamped SQL, the only way the schema changes
│   ├── functions/     # Edge Functions + _shared/
│   ├── seed/          # fictional data, all rows is_placeholder = true
│   └── tests/         # pgTAP: RLS matrix, booking, reconfirmation, search, invites, entitlements
├── e2e/mobile/ (Maestro)   e2e/admin/ (Playwright)
├── docs/
│   ├── phase-0/       # this plan, decision record
│   ├── design/        # visual reference analysis, tokens rationale
│   ├── decisions/     # ADRs added after Phase 0
│   ├── product-requirements.md  architecture.md  data-model.md  privacy-security.md  i18n.md
│   └── runbooks/      # weather cancellation, move/reconfirm, incident, GDPR request, release
├── .github/workflows/ # ci.yml, db.yml, eas-preview.yml
├── CLAUDE.md  README.md  turbo.json  pnpm-workspace.yaml  package.json  .nvmrc
└── apps/*/.env.example  supabase/.env.example
```

---

## 4. Dependencies

Versions are pinned in Phase 1. Mobile packages are installed with `npx expo install`.

### Mobile

| Purpose | Package |
| --- | --- |
| Framework | `expo` (SDK 58), `react-native`, `expo-router`, `typescript` (the version Expo SDK 58 supports) |
| Dev builds | `expo-dev-client` |
| Backend | `@supabase/supabase-js`, `expo-secure-store`, `@react-native-async-storage/async-storage` |
| Data and forms | `@tanstack/react-query`, `react-hook-form`, `zod`, `@hookform/resolvers` |
| i18n | `i18next`, `react-i18next`, `expo-localization` |
| UI | `expo-image`, `expo-font`, `react-native-safe-area-context`, `react-native-screens`, `expo-linear-gradient`, `expo-haptics`, `react-native-svg` (progress ring, icons) |
| Animation | `react-native-reanimated`, `react-native-gesture-handler`; Lottie or Rive for the rain state (Phase 6) |
| Discover | `expo-location` (foreground only, P-12); `react-native-maps` **or** `@rnmapbox/maps` (P-09, Phase 4) |
| Practice | `expo-video` |
| Push | `expo-notifications`, `expo-device`, `expo-linking` |
| Membership | `react-native-purchases` (RevenueCat) |
| Observability | `posthog-react-native` (EU), `@sentry/react-native` |
| Tests | `jest-expo`, `@testing-library/react-native`, Maestro |

### Admin and provider portal

`next`, `@supabase/ssr`, `@supabase/supabase-js`, `tailwindcss`, Radix primitives (or shadcn/ui copied in), `zod`, `react-hook-form`, `i18next` + `react-i18next`, `@sentry/nextjs`, `posthog-js`, a map component for venue placement (same provider as P-09). Tests: `vitest`, `@testing-library/react`, `@playwright/test`.

### Shared and backend

* `turbo`, `pnpm`, ESLint flat config (`typescript-eslint`, `eslint-config-expo`), `prettier`, `vitest`, `supabase` CLI.
* Postgres extensions: **`postgis`**, `pg_cron`, `pg_net`, `pgcrypto`, `pgtap` (tests).
* Edge Functions: Deno, `npm:zod`, `npm:@supabase/supabase-js`, `jose`.

### Accounts and services

GitHub (`Sensitor/oreva`) · Supabase (dev local, staging and prod on a paid plan, EU) · Expo/EAS · Apple Developer and Google Play (after O-01) · a domain (O-02) · weather API · Mux or Cloudflare Stream · map provider · RevenueCat · PostHog EU · Sentry EU. **Later:** a payment provider with marketplace payouts.

---

## 5. Database architecture

### Conventions

* UUID keys, `created_at`/`updated_at`, English snake_case names.
* `timestamptz` in UTC, with the IANA timezone of the venue.
* Money as `*_minor bigint` plus `currency char(3)` (ISO 4217). Countries as ISO 3166-1 alpha-2.
* RLS on every table, deny by default. Helper functions live in a non-exposed `private` schema.
* Schema changes only through `supabase/migrations`. Production is never edited by hand.
* **Localized fields** are `jsonb` (`{"en": "...", "fr": "...", "ru": "..."}`). A check constraint validates keys against the supported locales and requires `en`, or the declared source language for source-language content. Publish functions enforce the required languages per content type (A-03, P-06).

### 5.1 Tables

Tables marked ◆ are new compared with the spec's section 7. Tables marked ◇ are **documented but not created in V1** (future monetization). They're listed so we design around them now.

**Platform, identity and consent**

| Table | Purpose / key fields |
| --- | --- |
| `locales` ◆ | code, enabled, required_for (content types), rtl |
| `profiles` | id = auth user, display_name, avatar_path, locale, timezone, home_city_id (optional), age_confirmed_at, onboarding_completed_at |
| `member_preferences` | level, preferred_duration, equipment[], practice_preferences[], goals[] (fixed non-medical list), preferred_instruction_languages[] |
| `notification_preferences` ◆ | per category, quiet hours |
| `consents` | type, version, granted, granted_at, source (insert-only) |
| `push_tokens` ◆ | user_id, expo_token, platform, last_seen_at, revoked_at |
| `platform_roles` ◆ | user_id, role (`admin`, `support`) |
| `partner_attributions` ◆ | user_id, organization_id, code, channel, consented_at |

**Discover: geography and providers**

| Table | Purpose / key fields |
| --- | --- |
| `cities` ◆ | slug, name (localized), country_code, timezone, center (geography), default_currency, **launch_status** (`hidden`, `coming_soon`, `live`) |
| `organizations` ◆ (replaces `partners`) | slug, name, **type** (`studio`, `independent_instructor`, `community`, `brand`), **partner_tier** (`founding_partner`, `partner`, `none`), status (`draft`, `active`, `inactive`, `suspended`), verification_status, description (localized, all 3 languages required to publish), logo_path, cover_path, website_url, instagram_url, attribution_code, country_code, default_currency, default_timezone, **is_placeholder** |
| `organization_members` ◆ | organization_id, user_id, role (`owner`, `manager`, `instructor`) |
| `venues` ◆ | organization_id, name, description (localized), address fields, city_id, country_code, **location geography(Point)**, timezone, **address_visibility** (`public`, `after_booking`), approximate_location (for map display when private), indoor/outdoor |
| `instructors` | slug, user_id (nullable), display_name, bio (localized), photo_path, photo_consent_at, languages_spoken[], qualifications_declared, verified_at (nullable), active, **is_placeholder** |
| `instructor_affiliations` ◆ | instructor_id, organization_id, status, since |
| `specialties` ◆ | code (`mat`, `reformer`, `outdoor`, `barre`…), name (localized) |
| `organization_specialties` ◆ / `instructor_specialties` ◆ | link tables |
| `follows` ◆ | user_id, target_type (`instructor`, `organization`), target_id, notify_new_classes |

**Classes and booking**

| Table | Purpose / key fields |
| --- | --- |
| `classes` | organization_id, instructor_id, venue_id, specialty_code, title and description (localized, source language required), source_language, **instruction_languages[]**, starts_at, duration_min, capacity, level, equipment[], lifecycle_status (`draft`, `published`, `completed`, `cancelled`), update_state (`none`, `weather_watch`, `confirmed`, `moved`), update_reason (localized), next_update_at, **payment_mode** (`free`, `pay_at_venue`; later `in_app`, `package_credit`), price_minor, currency, alternative_workout_id, **is_placeholder**. Availability is computed, never stored. |
| `class_private_details` ◆ | class_id, meeting_point, organizer_contact, conditions. Visible only to active bookings and class staff. |
| `class_policies` ◆ | per organization, optional per-class override: booking window, member cancellation cutoff, waitlist offer minutes, **reconfirmation settings** (P-05, section 5.5: `significant_shift_minutes`, `reconfirm_max_window_minutes`, `reconfirm_lead_minutes`, `reconfirm_min_window_minutes`, `min_move_notice_minutes`), after-class delay (30 to 90 min, default 60) |
| `class_status_events` ◆ | full history of status, update and move changes (actor, before, after, reason) |
| `bookings` | class_id, user_id, **status** (see 5.3), offer_expires_at, reconfirm_by, waitlist_position, attendance (`unknown`, `attended`, `no_show`), source_organization_id, **price_minor_snapshot, currency_snapshot, payment_mode_snapshot, payment_status** (`not_required`, `pay_at_venue`; later `pending`, `paid`, `refunded`, `failed`), hold_expires_at, release_reason, timestamps |
| `weather_snapshots` ◆ | class_id, provider, fetched_at, summary, attribution. Display only. |

**Future monetization (◇ documented, not created in V1)**

| Table | Purpose |
| --- | --- |
| `orders` ◇ / `order_items` ◇ | what was bought: a booking, a package, a provider subscription |
| `payments` ◇ / `refunds` ◇ | payment provider references, amounts, statuses, idempotency keys |
| `products` ◇ | class packages, memberships sold by organizations, instructor subscription plans |
| `credit_ledger` ◇ | append-only ledger of class credits (purchase, use, expiry, refund) |
| `payout_accounts` ◇ | the organization's account at the payment provider (KYC handled by the provider) |
| `fee_rules` ◇ | commission rules per organization, country or product |

The booking engine already knows about `pending_payment`, seat holds and price snapshots. Adding these tables means implementing `payment_mode = in_app`, a payments webhook Edge Function and refund rules, without changing existing bookings.

**Practice**

`video_assets` ◆, `workouts` (localized, source_language, audio_language, subtitle languages, premium_only, organization_id and instructor_id nullable), `programs`, `program_days`, `program_enrollments` ◆, `workout_progress` ◆ (resume position), `workout_completions` (source: home, after_class, program, challenge), `recommendation_rules` ◆ (explicit editorial rules).

**After Class**

`class_feedback` (feeling 1 to 5, difficulty 1 to 5, comment ≤ 500, policy version), plus the `organization_feedback_summary()` function with the 5-response threshold (D-12).

**Connect**

`circles`, `circle_members` (share_activity off by default), `circle_invites` ◆ (hashed token, expiry, max uses), `circle_messages` (kinds: text, class_share, challenge_share, system), `circle_challenges`, `challenge_progress`, `user_blocks` ◆, `reports`. Plus `follows` (above).

**Operations**

`notifications` (outbox, unique idempotency key), `subscription_entitlements` (digital membership, webhook-only writes), `billing_events` ◆ (RevenueCat event idempotency), `audit_logs`.

### 5.2 Discover search (P-03, P-12)

`search_classes(...)` is one RPC, paginated by cursor. It filters by:

* **Where:** `city_id`, **or** `lat`, `lng` and `radius_km`. Coordinates arrive rounded to about 1 km, and the radius is capped (for example 50 km). They're never stored or logged.
* **When:** `date_from` to `date_to`, in the venue's local time.
* `levels[]`, `specialties[]`, `instruction_language`, `has_availability`.
* `price_max_minor` together with `currency` (no FX conversion, P-07).

It returns classes with distance, computed availability and the localized title with fallback. Only `live` cities, `active` organizations and `published` future classes are returned. Placeholders are excluded in production (P-11).

Indexes: GiST on `venues.location`; a partial B-tree index on `classes (starts_at)` for published future classes; GIN on specialty and language arrays. `search_instructors` and `search_organizations` follow the same pattern. PostGIS in Postgres comfortably covers many cities before any external search engine is needed.

### 5.3 Class and booking states

**Class:** lifecycle (`draft → published → completed`, or `cancelled`), update state (`none`, `weather_watch`, `confirmed`, `moved`), and availability computed as `open`, `waitlist`, or `full`.

**Booking status:**

| Status | Meaning | Holds a seat? |
| --- | --- | --- |
| `pending_payment` *(future)* | Seat held while payment completes, until `hold_expires_at` | yes |
| `confirmed` | Booked | yes |
| `waitlisted` | In the queue | no |
| `offered` | A seat was freed and offered, until `offer_expires_at` | yes |
| `reconfirmation_required` | The class moved significantly, waiting for her answer until `reconfirm_by` | yes |
| `cancelled_by_member` | She cancelled | no |
| `cancelled_by_organizer` | The class was cancelled | no |
| `released` | The hold ended with no action. `release_reason` is `offer_expired`, `reconfirmation_expired`, `declined_move` or `payment_timeout` (future). | no |

Seat count = `confirmed + offered + reconfirmation_required + pending_payment`. The count is checked under a row lock on the class.

### 5.4 Business rules as RPC functions

| Function | Behaviour |
| --- | --- |
| `create_booking(class_id)` | Locks the class. Checks it's published and not cancelled, the booking window is open, there's no active booking, and the `payment_mode` is allowed (V1: `free` or `pay_at_venue`; `in_app` returns `payment_not_available`). Snapshots price and currency. Creates `confirmed` or `waitlisted`. Queues the confirmation. |
| `cancel_booking(booking_id)` | Owner only, applies the cutoff. Frees the seat and offers it to the next person on the waitlist. |
| `respond_waitlist_offer(booking_id, accept)` | Accept within the window. If she declines or the offer expires, it moves to the next person. |
| `update_class_status(class_id, change, reason)` | Class staff or platform admin only. Writes history and the audit log, and notifies bookings. **Never called automatically from weather data.** |
| `move_class(class_id, new_start, new_venue, reason)` | Keeps history. If the change is **significant** (P-05: date change, start moves more than 30 min, or venue change), all seat-holding bookings become `reconfirmation_required`, with `reconfirm_by` computed by the rule in **section 5.5**. That rule guarantees a minimum response window, and significant moves at too short notice are refused. One reminder is sent halfway through. Smaller changes only notify. |
| `reconfirm_booking(booking_id, accept)` | Accept → `confirmed`. Decline → `released` (`declined_move`), the seat goes to the waitlist, and a future paid booking would be refunded according to policy. |
| pg_cron job `expire_holds()` | Every minute: expired offers, reconfirmations and (future) payment holds become `released`. Waitlist promotion follows. |
| `mark_attendance`, `schedule_after_class`, `submit_class_feedback` | As in revision 1 |
| `create_circle_invite`, `join_circle`, `send_circle_message` | As in revision 1 (hashed tokens, limits, rate limits) |
| `follow(target)` / `unfollow(target)` | A followed organization or instructor publishing a class creates an opt-in notification |
| `publish_organization`, `publish_program`, `publish_workout`, `publish_class` | Enforce the required languages (A-03) and the placeholder guard (P-11) |

### 5.5 Reconfirmation deadline rule (P-05)

**Goal.** A member asked to reconfirm must always get a real chance to answer. The deadline is never already past, or almost past, when she's notified. And it always falls before the class starts.

**Definitions.**

* `t0`: the moment the significant move is saved. The notification is queued in the same transaction and sent on the urgent path (section 2, B) within about a minute.
* `S`: the new start time.

**Settings** (in `class_policies`, per organization with optional per-class override):

| Setting | Default | Meaning | Allowed range |
| --- | --- | --- | --- |
| `significant_shift_minutes` | 30 | A start-time shift **greater than** this is significant. A date change or a venue change is always significant. | 15 to 120 |
| `reconfirm_max_window_minutes` | 1440 (24 h) | The longest a seat is held waiting for an answer | ≥ min window, ≤ 4320 |
| `reconfirm_lead_minutes` | 180 (3 h) | The preferred gap between the deadline and the class start | 30 to 1440 |
| `reconfirm_min_window_minutes` | 60 | **The minimum time a member always gets to answer** | 30 to 720 |
| `min_move_notice_minutes` | 120 (2 h) | A significant move must be saved at least this long before the new start | ≥ min window + 30 |

The ranges are enforced by database `CHECK` constraints and validated in the provider portal.

**Rule** (implemented once, in SQL):

```
if S − t0 < min_move_notice:        refuse the move   → error "move_notice_too_short"
preferred   = min(t0 + max_window, S − lead)
reconfirm_by = max(preferred, t0 + min_window)
```

Because `lead ≥ 30` and `min_move_notice ≥ min_window + 30`, the result always satisfies:

```
t0 + min_window  ≤  reconfirm_by  ≤  S − 30 min
```

So the deadline can never have expired when the notification goes out, and the member always has at least `min_window` to answer. The class also never starts while her answer is still pending.

**Short-notice moves.** If an organizer needs to move a class to less than `min_move_notice` from now, the move is refused. The portal explains why and offers two alternatives:

* **Cancel** the class with a reason (members are notified immediately, with the alternative home session).
* **Publish a new class** at the new time, which members can book themselves.

That's more honest for members than an impossible deadline.

**Worked examples** (defaults: 24 h max, 3 h lead, 60 min minimum, 2 h notice):

| Move saved at `t0`, new start `S` is… | `reconfirm_by` | Why |
| --- | --- | --- |
| 3 days later | `t0` + 24 h | max window applies |
| 10 h later | `S` − 3 h (= `t0` + 7 h) | lead applies |
| 3 h 30 later | `t0` + 60 min (= `S` − 2 h 30) | the lead would leave 30 min, so the minimum window applies |
| exactly 2 h later | `t0` + 60 min (= `S` − 60 min) | minimum window; boundary of the notice rule |
| 1 h 59 later | move refused | below `min_move_notice` |
| start time shifted by exactly 30 min, same date and venue | no reconfirmation, notification only | not greater than the threshold |

**Related behaviour.**

* **Halfway reminder:** one reminder at `t0 + (reconfirm_by − t0) / 2`, never more.
* **Quiet hours:** move, cancellation and reconfirmation notifications are **urgent transactional** messages and are delivered during quiet hours. Otherwise a 23:00 move with a 60-minute window would be meaningless. Marketing and non-essential reminders still respect quiet hours.
* **When push is unavailable** (permission refused, or no token): the class card and the Home "Today" card show the reconfirmation request in the app, with the deadline in her timezone. Email fallback is a post-MVP option.
* **A second move while a reconfirmation is open:** the deadline is recomputed from the new `t0`. Members who had already reconfirmed the first move are asked again. Each move sends its own notification, keyed by the move event so it's never duplicated.
* **Expiry:** at `reconfirm_by`, the `expire_holds()` job releases the seat (`release_reason = reconfirmation_expired`) and offers it to the waitlist.
* **Waitlist offers get the same protection:** `offer_expires_at = min(now + offer_window, S − 30 min)`. No offer is made if less than `reconfirm_min_window_minutes` remains before the start.
* **Display:** the deadline is shown in the member's timezone, with relative wording ("Please confirm within 1 hour, by 15:40"), in EN/FR/RU.

**Tests (Phase 4, pgTAP + unit):**

1. Every row of the worked-examples table, including both boundaries (`S − t0 = min_move_notice` accepted, one minute less refused; a shift of exactly the threshold isn't significant, one minute more is).
2. **Property test:** for a few thousand generated combinations of `t0`, `S` and valid settings, every accepted move gives `t0 + min_window ≤ reconfirm_by ≤ S − 30 min`.
3. Settings outside the allowed ranges are rejected by the constraints.
4. A move during quiet hours delivers the reconfirmation push immediately. A marketing message at the same time is deferred.
5. A second move during an open reconfirmation recomputes the deadline and sends exactly one new notification per member.
6. Expiry at the deadline releases the seat and creates exactly one waitlist offer. That offer's expiry is clamped before the class start.
7. Accept, decline and expired paths, plus permission checks: a member can only answer for her own booking, and only while `reconfirmation_required`.
8. Daylight-saving boundaries: a move across the October/March clock change in `Europe/Monaco` still respects the minimum window in real elapsed time.

### 5.6 Map provider comparison (P-09)

An interactive map in Discover is approved. The provider is chosen **after** a short, documented comparison at the start of Phase 4, presented to the founders with screenshots and a recommendation.

**Candidates.**

* `react-native-maps`: Apple Maps on iOS, Google Maps on Android.
* `@rnmapbox/maps`: Mapbox on both platforms.

**Method.** I'll build the same Discover map screen with both, in a development build, on one iPhone and one Android device. It will show Monaco and Côte d'Azur venues and classes from seed data, a custom ORÉVA marker, clustering, an approximate-area circle for private meeting points, and a bottom-sheet class preview.

| Criterion | What is measured |
| --- | --- |
| **Premium visual fit** | Can the map be styled to the ORÉVA palette (soft neutrals, lavender accents, quiet labels) **identically on iOS and Android**? Custom markers, clusters and the approximate-area circle drawn in the brand style. Side-by-side screenshots. |
| Consistency | The same look and behaviour on both platforms (Apple and Google base maps differ visually) |
| Performance | Smooth pan and zoom with several hundred markers, clustering cost, memory, effect on app size |
| Privacy | What the SDK sends and to whom (telemetry, opt-out options). Whether approximate locations can be shown without exposing exact points. Processor and DPA implications. |
| Cost | Pricing at pilot scale and at an international-growth scenario, from **current** official pricing pages |
| Keys and setup | API key needs, key restriction by app identifier (P-10), Expo config plugin support, build impact |
| Accessibility | Screen-reader labels on markers, the list alternative, Dynamic Type in callouts, Reduce Motion on camera animations |
| Localization | Map labels in EN/FR/RU, attribution text |
| Future needs | Dark mode, offline areas (travellers), web map for the provider portal with the same style |

**Deliverable:** a short decision note in `docs/decisions/` with the screenshots, a scoring table and a recommendation, for the founders' approval before the map is integrated. A **list view always exists** next to the map, for accessibility and when location or the network is unavailable.

---

## 6. Security and privacy

Everything from revision 1 still applies:

* Only the publishable key ships in the app. Secrets live in function, host and CI secret stores. Gitleaks runs in CI.
* RLS on every table, a **pgTAP role matrix** on every PR, and MFA for staff.
* Server-side validation through constraints and RPC functions. Rate limits.
* RevenueCat webhook auth header check, re-fetch and idempotency. Entitlements checked on the server.
* Private buckets with signed URLs, and signed video playback.
* EU processors with DPAs. No medical, weight, calorie or birth-date data. Feedback treated as possibly health-related. Analytics without personal data. Sentry scrubbing.
* In-app account deletion and data export. Retention jobs. Fictional seed data only.

Additions in revision 2:

* **Role matrix now covers marketplace roles:** anonymous, member A, member B, owner, manager and instructor of organization X, the same roles in organization Y, an instructor affiliated with both, support, and admin. A provider can never read another organization's bookings, attendees or feedback.
* **Location privacy (P-12):** only coarse coordinates are sent, and they're never stored or logged. Outdoor meeting points stay private until booking, and the map shows an approximate area.
* **Placeholder guard (P-11):** the database knows its environment (`app.environment`). In production, a trigger blocks publishing or activating any `is_placeholder` row. Seed files never run against production. CI checks that migrations contain no seed inserts.
* **Provider data:** instructor qualifications are labelled *declared*. A `verified_at` field exists for a future verification process. Photos need a consent timestamp.
* **Future payments:** card data never touches ORÉVA. The payment provider's hosted or native SDK flows and webhooks are used. That's a later phase with its own security review.

---

## 7. Roadmap (revised)

Every phase ends with lint, type checks and tests passing, EN/FR/RU parity, updated docs, and a **GitHub branch + PR** for review. The report says what works, what doesn't, and what couldn't be tested from this environment.

| Phase | Pillar | Scope | Exit criteria |
| --- | --- | --- | --- |
| **0. Planning** | | Spec review, architecture, decision record, visual analysis | Founders' final approval |
| **1. Foundation** | all | Monorepo, Expo app with dev/staging/prod variants (P-10), Next.js shell, TS strict, lint, tests, CI. Design tokens from the reference with AA fixes, typography test (P-14), base components, **pillar tab bar** (P-08), RTL-safe layout rules. i18n EN/FR/RU with locale detection, manual switch, plurals, dates, currency and distance formatting, key-parity CI test. Static Home faithful to the reference. Local Supabase with PostGIS, locales and the RLS skeleton. Placeholder guard. Sentry. README, CLAUDE.md, `.env.example`. | Runs on iOS and Android dev builds. Language switches live. Russian layouts checked. CI green. |
| **2. Accounts** | | Sign up/in/reset, 18+, consents, onboarding (skippable, editable, optional home city), first program suggestion by rules, notification preferences, account deletion and export | AUTH/ONB criteria pass. RLS tests. Localized errors. |
| **3. Home + Discover foundations** | Discover | Cities, venues, organizations, instructors, affiliations, specialties. Organization and instructor profiles. Founding Partner badge. Gym & Tonic **placeholder in dev/staging only**. Partner QR landing and attribution. Home wired to real data with empty states. | Three-language profiles. The placeholder guard is proven by a test. Attribution with consent. |
| **4. Discover: classes and booking** | Discover | **Map provider comparison first** (section 5.6, founders choose). Search and filters (date, level, specialty, price, language, distance within live cities). List view and interactive brand-styled map. Class detail. Payment-ready booking engine (free and pay at venue). Waitlist offers. Member cancellation. **Move with reconfirmation** (section 5.5). Attendance. Provider portal for classes, including the move flow and its short-notice alternatives. Booking notifications are written to the outbox and shown in the app; push delivery is switched on in Phase 6. | CLS-01 to 08 pass. Concurrency test (50 attempts for 10 seats gives exactly 10). **All reconfirmation tests in section 5.5**, including short-notice and property tests. RLS matrix across two organizations. Map decision note approved. |
| **5. Practice** | Practice | Video spike (O-10), library and filters, workout page, player (progress ring, captions, audio language, resume), programs, progress | Signed playback. Resume. Captions. |
| **6. After Class + Weather & Class Updates** | Discover / Practice | Weather snapshots (display only), status controls, outbox and push dispatcher, deep links, quiet hours, rain state, alternative home session, After Class feedback, aggregated view | Journeys B and C end to end on devices. A test proves weather data never changes a status. |
| **7. Connect** | Connect | Circles, invites, chat, class and challenge sharing, challenges, activity-sharing toggle, follow instructors and studios, block, report, moderation queue, share cards | Security tests (forged invites, non-member access, spam). Moderation works in admin. |
| **8. Admin, membership, analytics** | all | Platform admin (content, organizations, cities, moderation, GDPR requests, audit). Provider portal polish. RevenueCat paywall, restore, webhook, entitlement gating. PostHog events. | Sandbox purchase, restore and cancel on both stores |
| **9. QA, security, beta** | all | Full E2E, accessibility pass, weak network and timezone tests, independent RLS review, store listings and privacy labels, TestFlight and Play internal testing, runbooks | Spec section 17 checklist done. Monaco beta with the Gym & Tonic cohort. |

### After the MVP (not scheduled, architecture ready)

| Horizon | What | What it needs |
| --- | --- | --- |
| H1 | **Paid classes in the app** | Payment provider with marketplace payouts, `orders`/`payments`/`refunds`, `payment_mode = in_app`, refund policies, legal and tax review |
| H2 | **Class packages and credits** | `products`, `credit_ledger`, `payment_mode = package_credit` |
| H3 | **Provider self-onboarding and verification**, instructor subscriptions (B2B, billed on the web) | Onboarding flow, verification process, `products` for plans |
| H4 | **New cities** (for example London, Paris, Dubai) | Set `cities.launch_status = live`, recruit providers, local content, legal checks per country |
| H5 | **Commissions and payouts** | `fee_rules`, `payout_accounts`, reporting, invoicing |
| H6 | **More languages** (for example Spanish, German, Arabic) | Translation files, `locales` rows, RTL QA for Arabic |
| H7 | **Wider Connect** (community pages, instructor updates, member↔instructor messages) | Moderation design and a consent model |

---

## 8. Design system

See [`../design/visual-reference.md`](../design/visual-reference.md). In short:

* The reference's layout language is kept: light canvas, one lavender accent, pastel tiles, very round cards, soft depth, a floating pill tab bar, big friendly headlines, photography first.
* **Contrast fixes:** content on lavender is dark, a deeper lavender is used where white text is needed, darker meta text on pastels, and hairline borders on controls.
* Typography with full Cyrillic support (P-14).
* **Content we don't copy:** calories, appearance-based categories, invented social proof, stock photos.

---

## 9. Potential technical problems

Carried over from revision 1:

* Lavender contrast (now quantified against the reference).
* Partner attribution without a third-party SDK.
* Store payment rules.
* App Store rules for user-generated content (Circles).
* Russian length and plurals.
* Timezones and daylight saving.
* Push reliability.
* Video provider choice.
* Weather licensing.
* pnpm and Metro, and Deno code sharing.
* TypeScript 7 maturity.
* Supabase plan limits.
* Apple enrollment lead time.
* RLS mistakes in AI-assisted code.
* Legal dependencies.

New in revision 2:

1. **Brand and identifier.** `oreva.com` and the "OREVA" brand belong to an unrelated industrial company. `com.oreva.app` is technically usable, but ORÉVA needs its own domain for universal links, plus a trademark opinion before the bundle ID is registered. The ID can't change after the first store submission. (Decision record, section 5.)
2. **Marketplace trust and safety.** Once independent providers can publish, we need verification, insurance, content quality and dispute handling. V1 avoids this by keeping onboarding staff-only, and the model keeps the necessary fields ready.
3. **Payments regulation.** Taking payments on behalf of providers raises licensing, KYC, VAT on commissions and refund liability. A payment provider with a marketplace product carries most of it, but legal and tax advice is needed before H1. App Store in-app purchase must **not** be used for physical classes. Digital membership **must** use it (subject to current regional rules).
4. **Map look, costs and keys.** Apple and Google base maps look different, which works against a consistent premium style. Google Maps on Android needs an API key with billing. Mapbox is usage-priced. Both need restricted keys and attribution. To be decided with the comparison in section 5.6.
5. **Search across currencies.** Without FX conversion, price filters only make sense within a city's currency. That's acceptable for V1 and documented.
6. **RTL later.** Logical `start`/`end` layout from Phase 1 is a small discipline now. Skipping it would mean a large rework when adding Arabic.
7. **Data growth.** Global classes and bookings grow faster than the pilot's. Indexes, cursor pagination and archive jobs for past classes are planned from the first migrations.
8. **Short-notice changes.** Organizers sometimes need to change a class at the last minute. The reconfirmation rule refuses significant moves below the minimum notice, and offers cancel or a new class instead (section 5.5). The portal has to explain this clearly so instructors don't feel blocked.

---

## 10. Initial setup commands (Phase 1, not run yet)

Prerequisites: Node 22 LTS, Docker, pnpm via Corepack. EAS builds can run in the cloud.

```bash
corepack enable
```

```bash
cd oreva && corepack use pnpm@latest
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
pnpm supabase migration new foundation_extensions_locales_rls
```

```bash
cd apps/mobile && npx expo install expo-dev-client expo-localization expo-secure-store expo-image expo-font react-native-reanimated react-native-gesture-handler react-native-svg @react-native-async-storage/async-storage
```

```bash
cd apps/mobile && pnpm add @supabase/supabase-js @tanstack/react-query i18next react-i18next zod react-hook-form @hookform/resolvers
```

```bash
npm install -g eas-cli
```

```bash
cd apps/mobile && eas init && eas build:configure
```

### App identifiers (P-10)

| Variant | `APP_VARIANT` | iOS bundle ID / Android package | Display name | URL scheme |
| --- | --- | --- | --- | --- |
| Development | `development` | `com.oreva.app.dev` | ORÉVA Dev | `oreva-dev` |
| Staging | `staging` | `com.oreva.app.staging` | ORÉVA Staging | `oreva-staging` |
| Production | `production` | `com.oreva.app` | ORÉVA | `oreva` |

All values are derived in `apps/mobile/app.config.ts` from `APP_ID_BASE` (default `com.oreva.app`) and `APP_VARIANT`.

### Environment variable names (no values in git)

**Mobile:**

```
APP_VARIANT
APP_ID_BASE
EXPO_PUBLIC_SUPABASE_URL
EXPO_PUBLIC_SUPABASE_PUBLISHABLE_KEY
EXPO_PUBLIC_REVENUECAT_IOS_KEY
EXPO_PUBLIC_REVENUECAT_ANDROID_KEY
EXPO_PUBLIC_POSTHOG_KEY
EXPO_PUBLIC_POSTHOG_HOST
EXPO_PUBLIC_SENTRY_DSN
EXPO_PUBLIC_MAPS_KEY                # only if the chosen map provider needs a client key; restricted by app ID
SENTRY_AUTH_TOKEN                   # CI / EAS secret only
```

**Admin:**

```
NEXT_PUBLIC_SUPABASE_URL
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY
NEXT_PUBLIC_POSTHOG_KEY
NEXT_PUBLIC_SENTRY_DSN
NEXT_PUBLIC_MAPS_KEY
SUPABASE_SECRET_KEY                 # server-only module, narrow use
```

**Supabase secrets:**

```
SUPABASE_SECRET_KEY
REVENUECAT_WEBHOOK_AUTH
REVENUECAT_SECRET_API_KEY
MUX_TOKEN_ID
MUX_TOKEN_SECRET
MUX_SIGNING_KEY_ID
MUX_SIGNING_PRIVATE_KEY
WEATHER_API_KEY
EXPO_ACCESS_TOKEN
```

The database setting `app.environment` (`local` / `staging` / `production`) is set per project. It's used by the placeholder guard (P-11).

---

*ORÉVA: Your movement. Your moment.*
