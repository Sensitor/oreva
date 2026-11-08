# Roadmap revision 4 (proposal)

Status: **proposal, awaiting the founders' approval**. Until it is approved, the roadmap in `docs/phase-0/technical-plan.md` section 7 stays in force.
Date: 8 November 2026
Basis: the founders' brief of 8 November 2026 (after testing Phase 1 on iPhone), the decision record, and decision note 0002 (map provider).

## 1. The founders' brief, checked against approved decisions

| #   | Founders' decision (8 Nov)                                                                | Status against the decision record                                                                                                                                         |
| --- | ----------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 1   | Discover becomes a discovery experience built around a large worldwide interactive map    | Consistent with P-03 and P-09. Provider choice: see note 0002.                                                                                                             |
| 2   | Studios and instructors join ORÉVA by creating their own professional profile and venues  | **Changes an approved decision.** The decision record says "provider accounts are created by ORÉVA staff" in V1, and self-onboarding was a post-MVP horizon (H3). See C-1. |
| 3   | An instructor can belong to several organizations                                         | Consistent with P-02 (`instructor_affiliations`)                                                                                                                           |
| 4   | Members search a city manually, or use Near Me after location permission                  | Consistent with P-12. City search uses ORÉVA's own `cities` table, so no third-party geocoding.                                                                            |
| 5   | Private venues never expose exact personal addresses                                      | Consistent with P-03 and P-12 (`address_visibility`, approximate location)                                                                                                 |
| 6   | Monaco and the Côte d'Azur are the first live areas; the architecture stays international | Consistent with P-03 (`cities.launch_status`)                                                                                                                              |
| 7   | A real experience on all five tabs, no "Coming soon" screens                              | **Changes the approved phase order.** Practice and Connect UIs move earlier, on demo data. See C-2.                                                                        |

## 2. Decisions to confirm before work starts

| ID      | Proposal                                                                                                                                                                                                                                                                                                                                                                        | Why                                                                                                                                                                                                                                                         |
| ------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **C-1** | **Professional self-signup with ORÉVA review.** A studio or instructor creates a professional account and a profile. The profile stays `pending_review`, invisible to members, until ORÉVA approves it in the admin portal. Qualifications stay labelled _declared_ until verified. ORÉVA can still create accounts for partners such as Gym & Tonic.                           | Implements brief item 2 while keeping trust and safety (no unchecked public profiles) and the placeholder guard. It replaces "staff-created accounts only" in V1 and brings part of horizon H3 forward. Instructor subscriptions and payouts stay post-MVP. |
| **C-2** | **UI first on demo data.** The next phase builds the real interfaces of the five tabs on a demo data layer. Each backend slice then replaces the demo data, one domain at a time.                                                                                                                                                                                               | Delivers brief item 7 quickly without starting every backend at once. The UI is built against stable interfaces, so swapping in real data doesn't mean rewriting screens.                                                                                   |
| **C-3** | **International demo data in development and staging only.** Fictional demo studios in Monaco and the Côte d'Azur, plus a few in other cities (for example Paris, London, Dubai), to test the worldwide map. Every item is clearly fictional, labelled "Sample data", placed on public spaces such as parks and seafronts rather than real businesses, and never in production. | Lets us test a worldwide map before real partners exist, without inventing real partners (A-06).                                                                                                                                                            |
| **C-4** | **Map provider: Mapbox**, with a one-day validation on iPhone first (note 0002). Option: an A/B against Apple Maps.                                                                                                                                                                                                                                                             | P-09                                                                                                                                                                                                                                                        |

## 3. Demo data versus production data

Demo data must never be mistaken for real data, and never reach production:

| Layer                | Rule                                                                                                                                                                                                                       | Enforcement                                                                                                          |
| -------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------- |
| Mobile app, UI phase | Screens read data through **repository interfaces** (for example `DiscoverRepository`). A `demo` implementation lives in a separate package, `@oreva/demo-data`. The `supabase` implementation replaces it slice by slice. | The data source comes from configuration. A test fails if a **production** build is configured with the demo source. |
| Every demo item      | `isPlaceholder: true`, "Sample data" badge visible, fictional names                                                                                                                                                        | Component tests check the badge on every demo card                                                                   |
| Database             | Demo rows live in `supabase/seed/demo/*.sql`: local and staging only, all `is_placeholder = true`                                                                                                                          | Placeholder guard (P-11): production refuses to publish placeholder rows. Seeds never run in production.             |
| Places               | Demo venues sit on public spaces (parks, seafronts, squares) with fictional names, never on real businesses or private addresses                                                                                           | Review checklist in the PR                                                                                           |
| Content              | No real partner, instructor, price or schedule (A-06). Gym & Tonic appears only once its information is validated in writing (O-06).                                                                                       | Code review, decision record                                                                                         |

## 4. Phases

Sizes are relative: S is about a week of focused work, M about two, L about three or more. Each phase ends with a PR, green CI, a report, and screenshots or an iPhone check.

### Phase 2 · Mobile experience on demo data (L)

**Goal.** Real, polished interfaces on all five tabs, driven by demo data, with the Discover map.

**Deliverables**

- **Map validation gate** (note 0002, section 7) on iPhone, then Mapbox integrated with the ORÉVA style, with tokens kept in EAS secrets.
- **Data layer:**
  - repository interfaces plus TanStack Query hooks;
  - the `@oreva/demo-data` package (fictional, flagged, in three languages where it represents editorial content);
  - a production guard that refuses the demo source in production builds.
- **Discover:**
  - full-screen map with native clustering and a bottom sheet of results;
  - map/list toggle;
  - **city search** across ORÉVA's cities (demo list) and **Near Me** (permission explained first, refusal handled, coordinates rounded to about 1 km, nothing stored);
  - filters for date, level, specialty, price, language and availability.
  - Screens: venue detail with an approximate area for private venues, class detail with a "booking opens soon" state (no fake booking), **studio public profile**, and **instructor public profile** listing several affiliations.
- **Home:** the Today card, nearby classes, recommended session, followed instructors and studios, all on demo data.
- **Practice:**
  - library with filters, workout detail and program detail;
  - player screen with progress ring and captions selector, no real video until the Practice backend phase; the demo shows a still image and is labelled.
- **Connect:**
  - Circles list and detail, demo conversation, challenge card;
  - following list;
  - empty states for invite, join and create.
- **Profile:**
  - signed-out state with a "Create your account" call to action (active in Phase 3);
  - language, notification preferences (stored on the device until Phase 3), privacy (map telemetry opt-out), accessibility notes, about and legal placeholders;
  - Design preview (non-production).
- **Typeface decision applied** (Manrope or Onest), the other removed.

**Dependencies.**

- C-2, C-3 and C-4 confirmed.
- A Mapbox account and tokens (or the react-native-maps decision).
- The founders' typeface choice.
- An Expo account to build on iPhone (already used for the Phase 1 test).

**Tests.**

- Component tests for every screen in EN, FR and RU (no missing keys, plurals).
- Accessibility labels and states.
- Location permission flows: granted, refused, never asked.
- List view reachable without the map.
- Private venues never render an exact pin.
- Demo badge on every demo item.
- Production build refuses the demo source.
- RTL lint and contrast tests (existing).
- **Exit:** iPhone review by the founders, with screenshots in the PR.

### Phase 3 · Accounts (M), the former Phase 2

**Goal.** Members and professionals can create accounts.

**Deliverables.**

- Sign up, sign in and password reset (email).
- 18+ confirmation (D-08).
- Separate, timestamped consents.
- Member onboarding: skippable and editable, with an optional home city.
- Choice of **member or professional** account.
- Profile and language saved to the server.
- Notification preferences moved to the server.
- Account deletion and data export.
- Staff MFA for the portal.
- Supabase client in both apps.

**Dependencies.**

- **Staging Supabase project (EU, paid plan).**
- Legal texts in draft (terms, privacy) for the consent screens.

**Tests.**

- pgTAP RLS matrix for `profiles`, `member_preferences`, `consents` and `notification_preferences`.
- Auth error messages in three languages.
- Deletion cascade and anonymization.
- E2E: sign up, onboarding, Home.

### Phase 4 · Discover backend (M)

**Goal.** Replace Discover's demo data with real data from Supabase and PostGIS.

**Deliverables.**

- **Migrations:** `cities` (with `launch_status`), `organizations`, `organization_members`, `instructors`, `instructor_affiliations`, `venues` (PostGIS point, `address_visibility`, approximate location computed by the server), `specialties`, `follows`. Classes are read-only for now.
- **Public RPCs:**
  - `discover_map_points(bbox, zoom, filters)` returning GeoJSON, with private venues returned only as approximate areas;
  - `search_cities(query, locale)`;
  - `search_classes` (city or near me);
  - `get_organization_profile`;
  - `get_instructor_profile`.
- Storage buckets for profile media, with consent fields.
- The demo seed moves to `supabase/seed/demo/`.
- The mobile app switches Discover and the public profiles to the Supabase source.

**Dependencies.** Phase 3 (staging project, auth). The map provider decision doesn't affect the database.

**Tests.**

- pgTAP:
  - RLS for anonymous and member access to public data only;
  - **no exact coordinates for private venues in any RPC result**;
  - `launch_status` filtering;
  - placeholder guard;
  - bbox and radius queries with GiST indexes (`EXPLAIN` check).
- Performance test: 10,000 venues, map query under 150 ms locally.

### Phase 5 · Professional onboarding (M), requires C-1

**Goal.** Studios and instructors join by themselves, safely.

**Deliverables.**

- In the app and on the web: create an organization (studio, community) or an **independent instructor profile** (an organization of one, P-01).
- Profile content in three languages, with the publishing rule of A-03.
- Specialties, spoken languages, and declared qualifications.
- Photos with consent.
- **Venues:** place a pin on the map, type the address, choose public or private (private means an approximate area only).
- **Affiliations:** an instructor invites, or is invited by, an organization, and both sides accept.
- Submit for review.
- **ORÉVA review queue** in the admin portal: approve, request changes or reject, with an audit log.

**Dependencies.** Phase 3 (pro accounts) and Phase 4 (schema).

**Tests.**

- RLS:
  - a professional edits only their own organization;
  - affiliation requires both sides;
  - `pending_review` profiles are invisible to members;
  - review actions are restricted to staff with MFA.
- Translation requirement enforced at publish time.
- Private address never readable by members.

### Phase 6 · Provider portal: classes and information (M)

**Goal.** Studios run their schedule in ORÉVA.

**Deliverables.**

- Web portal (D-06):
  - dashboard;
  - profile and venue editing;
  - team (managers, instructors);
  - **classes**: create and edit, draft and publish, capacity, level, specialty, language, price display with `payment_mode` free or pay at venue (P-04), private meeting details, recurring sessions generated as individual classes.
- Class translations follow A-03 (source language plus optional translations).
- The mobile Discover shows real classes.

**Dependencies.** Phases 4 and 5.

**Tests.**

- RLS matrix across two organizations, plus an instructor shared by both (P-02).
- Publish rules.
- Time zones: classes entered in local time, stored in UTC, DST cases.
- Recurrence generation.
- Placeholder guard.

### Phase 7 · Booking, step by step (L)

The booking engine designed in Phase 0 (P-04, P-05) arrives in three PRs:

- **7a. Book and cancel:**
  - `create_booking` and `cancel_booking` as RPCs, with an atomic capacity check;
  - "My classes" for members;
  - attendees list for the studio.
  - Free and pay-at-venue only.
- **7b. Waitlist:** timed offers and expiry, with the job that expires them.
- **7c. Class changes:**
  - organizer status updates (weather watch, confirmed, cancelled);
  - **moved classes with reconfirmation** (P-05 rule and its eight tests);
  - attendance.
  - Notifications go to the outbox and appear in the app; push comes in the next phase.

**Dependencies.** Phase 6.

**Tests.**

- Concurrency test (50 attempts for 10 seats gives exactly 10).
- All P-05 tests.
- RLS for bookings.
- E2E: discover, book, cancel.

### After Phase 7 (unchanged from the approved roadmap)

1. Practice backend (video provider decision O-10, signed playback, progress).
2. After Class, Weather & Class Updates, and push notifications.
3. Connect backend (Circles, invitations, chat, moderation).
4. Membership (RevenueCat) and analytics.
5. QA, security review and the Monaco beta.

## 5. Dependencies and accounts

| Needed for        | What                                                                                  | Who                  |
| ----------------- | ------------------------------------------------------------------------------------- | -------------------- |
| Phase 2           | Mapbox account and tokens (or the react-native-maps decision)                         | Founders             |
| Phase 2           | Typeface choice: Manrope or Onest                                                     | Founders             |
| Phase 3           | Supabase staging project (EU, paid), access for engineering                           | Founders             |
| Phase 3           | Draft terms and privacy policy for the consent screens                                | Founders and counsel |
| Phase 5           | Review policy for professional profiles: what ORÉVA checks before approving           | Founders             |
| Before beta       | Legal entity, domain, trademark, Apple and Google accounts (O-01 to O-04); Mapbox DPA | Founders             |
| Real partner data | Written agreement with Gym & Tonic (O-06)                                             | Founders             |

## 6. What does not change

- Every approved decision in the decision record (D-01 to D-13, A-01 to A-07, P-01 to P-15) applies unchanged, apart from what C-1 and C-2 change once confirmed.
- Supabase, RLS on every table, PostGIS, business rules in RPC functions, the placeholder guard, EN/FR/RU parity, AA contrast, and RTL-safe layout.
- No invented real partners, instructors, prices or schedules.
- One phase at a time, each started only with the founders' explicit approval.

## 7. Next approvable step

Approve, adjust or reject:

1. **C-4:** Mapbox, react-native-maps, or an iPhone A/B first (note 0002).
2. **C-1:** professional self-signup with ORÉVA review.
3. **C-2:** UI first on demo data (Phase 2 as described).
4. **C-3:** fictional international demo data in development and staging only.
5. This phase order (Phases 2 to 7).

After that approval, **Phase 2** starts with the map validation gate on iPhone.
