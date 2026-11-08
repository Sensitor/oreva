# Phase 0 decision record

| | |
| --- | --- |
| Status | **All Phase 0 decisions approved** (8 Nov 2026). Final document review in the Phase 0 PR. **Phase 1 starts only after the founders' explicit approval.** |
| Last updated | 8 November 2026 |
| Source documents | *ORÉVA Cahier des charges MVP v1.1*, master development prompt, founders' reviews of the Phase 0 plan (two reviews, 8 Nov 2026), visual reference screenshot |
| Companion documents | [`technical-plan.md`](./technical-plan.md) (revised architecture and roadmap), [`../design/visual-reference.md`](../design/visual-reference.md) |

This record lists every product and architecture decision made in Phase 0, its status, and where the cahier des charges was changed. When a later phase changes one of these decisions, it adds a new entry to `docs/decisions/` and doesn't silently edit this file.

**Status labels**

* **Approved:** confirmed by the founders.
* **Proposed:** my recommendation, waiting for the founders' final approval.
* **Open:** needs information or a decision from outside engineering.

---

## 1. Product direction

### ORÉVA's three pillars (Approved)

| Pillar | Promise | MVP scope (Monaco pilot) | Built to grow into |
| --- | --- | --- | --- |
| **DISCOVER** | Find Pilates instructors, studios and in-person classes near you, wherever you are in the world. | Gym & Tonic and its instructors in Monaco and on the Côte d'Azur. Class list with filters for date, level, specialty and price. Map view (see P-09). Booking. | Any city. Search by location, distance, date, price, level, specialty and availability. Independent instructors and studios. |
| **PRACTICE** | A premium digital library of workouts, programs and guided sessions, anytime and anywhere. | Curated video library, structured programs, resume playback, progress, After Class suggestions, Premium membership. | Larger library, more instructors' content, offline downloads, more languages. |
| **CONNECT** | Relationships with instructors, Pilates communities, private Circles with friends, and sharing your journey. | Private Circles (invite-only chat, class sharing, simple challenges). Follow an instructor or studio to hear about new classes. | Community pages, instructor updates, wider sharing, all with explicit consent. |

Each pillar is a main tab in the app: **Home · Discover · Practice · Connect · Profile** (P-08).

### International marketplace vision (Approved, built progressively)

ORÉVA will become an international Pilates platform. Independent instructors, studios and communities will join and make their classes discoverable worldwide. For example, a subscriber travelling to London, Paris or Dubai opens ORÉVA, finds nearby instructors and books a session.

* **What V1 builds:** Monaco and the Côte d'Azur only, with Gym & Tonic as Founding Partner. Provider accounts are created by ORÉVA staff.
* **What V1 must not block:** multiple cities and countries, location search and maps, independent instructor and studio profiles, multiple currencies and time zones, more languages, and a scalable provider management system.
* **Rule:** the data model, permissions and APIs are global from day one. The *launch scope* is controlled by data (which cities are live), not by code.

### Business model direction (Approved, mostly not built in V1)

Two complementary revenue lines:

1. **Digital ORÉVA membership.** Premium workouts, programs and digital features. Sold through App Store / Google Play in-app purchase via RevenueCat (Phase 8).
2. **Physical classes booked on the platform.** Pricing and instructor compensation are separate from the membership. *Pilot: free booking, or payment handled by the partner at the venue.*

Future options the architecture must allow without a rebuild: booking commissions, instructor subscriptions (B2B), studio partnerships, paid class packages, credits, in-app payment for classes. How this is achieved is described in P-04.

---

## 2. Approved technical decisions

| ID | Decision | Notes |
| --- | --- | --- |
| D-01 | **pnpm + Turborepo monorepo** | `apps/mobile`, `apps/admin`, `packages/*`, `supabase/` |
| D-02 | **Business rules in PostgreSQL RPC functions.** Edge Functions only for external services and secrets. | Changes spec section 6.1, which listed booking under Edge Functions |
| D-03 | **StyleSheet + typed design tokens on mobile** | No NativeWind. Tailwind allowed in the admin web app. |
| D-04 | **JSONB localized content** (`{"en","fr","ru"}`) | Changes the spec's `_en/_fr` columns. Also makes adding languages a data change (P-06). |
| D-05 | **Class lifecycle, organizer/weather update state and computed availability are kept separate** | Changes spec CLS-02 |
| D-06 | **Responsive web portal for instructors in V1** | Same Next.js app as admin |
| D-07 | **Free physical class booking in the pilot** | Subject to Gym & Tonic's agreement. Booking must stay payment-ready (A-02). |
| D-08 | **18+ self-confirmation with a timestamp. No date of birth stored.** | |
| D-09 | **Email + password authentication in V1** | Adding Google sign-in later would also require Sign in with Apple |
| D-10 | **Partner attribution through partner codes and universal links** | No third-party attribution SDK |
| D-11 | **EU hosting** | Supabase EU region (Paris or Frankfurt, chosen when the project is created), PostHog EU, Sentry EU |
| D-12 | **Feedback aggregates shown only from 5 responses** | Threshold is configurable |
| D-13 | **Accessibility improvements that keep the lavender identity** | See `docs/design/visual-reference.md` section 3 |

## 3. Approved adjustments from the founders' review

| ID | Adjustment | How it's implemented |
| --- | --- | --- |
| A-01 | **A significantly moved class requires explicit reconfirmation.** Members are never assumed to still be available. | P-05 defines "significant", the deadline, reminders and what happens with no answer |
| A-02 | **Booking supports future paid classes, packages and in-app payments**, even though the pilot is free | P-04: payment-ready booking states and price snapshots from day one, with payment tables added later |
| A-03 | **Three-language publishing is required for partner and organization profiles, programs and community rules.** Workouts and classes can be published in their source language, with available translations clearly shown. | Publish functions enforce it. Required languages are configured per content type (P-06). |
| A-04 | **Keep the premium visual direction** (minimal, elegant, feminine not childish, soft lavender, generous whitespace, editorial photography) | The visual reference is the main inspiration. See the design notes. |
| A-05 | **App identifier `com.oreva.app`, public name "ORÉVA"**, configurable per environment | Identifiers live in configuration (P-10). Conflict check results are below. |
| A-06 | **No invented Gym & Tonic information in production** | Enforced in the database, not just by convention (P-11) |
| A-07 | **Every phase delivers working tests, type checks, documentation and a reviewable GitHub branch or PR** | Section 6 |

---

## 4. Decisions from the strategic update (Approved)

These came from the strategic update and were **approved by the founders on 8 November 2026**. P-05 was approved with a clarification about short-notice moves. P-09 was approved with the provider to be recommended after a comparison. Details are in [`technical-plan.md`](./technical-plan.md).

| ID | Decision | Why |
| --- | --- | --- |
| P-01 | **Every class provider is an *organization*.** Studios, communities and brands are organizations. **An independent instructor gets an "organization of one".** In the database, the spec's "partners" become `organizations`; the UI still says "Partners" or "Studios" where it makes sense. Partner tier (Founding Partner, Partner) is a separate field from organization type. | One permission model for every provider, so marketplace growth doesn't need a second system. Gym & Tonic is simply the first organization with tier `founding_partner`. |
| P-02 | **Instructors are first-class public profiles** that can teach for several organizations (`instructor_affiliations`). | A traveller searches for *instructors*, not only studios. Instructors move between studios. |
| P-03 | **Location model built on PostGIS from day one**, with `cities`, `venues` (geographic point, address, timezone, address visibility) and classes linked to a venue. A city's `launch_status` (`hidden`, `coming_soon`, `live`) controls what Discover shows. | Distance search, maps and new cities become data changes. PostGIS is included with Supabase. |
| P-04 | **Payment-ready booking.** Classes have a `payment_mode` (`free`, `pay_at_venue` now; `in_app` and `package_credit` later). Bookings keep a price and currency snapshot, a `payment_status`, and a `pending_payment` state with a seat hold. Orders, payments, refunds, packages, credits, payouts and commission rules are **documented now and built later**. | Adding paid classes later only means adding tables and a payment provider. The booking engine and its tests stay the same. Physical class payments can't use App Store in-app purchase, so a payment provider with marketplace payouts (for example Stripe Connect) is the likely future path. Not decided now. |
| P-05 | **Moved-class reconfirmation rule.** A change is *significant* when the date changes, the start time moves by more than 30 minutes, or the venue changes. Members then must reconfirm, and their seat is held until a deadline:<br><br>`reconfirm_by = max(min(notice + 24 h, new start − 3 h), notice + minimum window)`<br><br>The **minimum response window** defaults to **60 min**. A significant move must be saved at least **2 h** before the new start; otherwise it's refused, and the organizer is offered *cancel* or *publish a new class* instead. This guarantees the deadline is never already past when the notification is sent, the member always has at least the minimum window, and the deadline is always at least 30 min before the class. One reminder is sent halfway through. Move notifications are urgent and are delivered during quiet hours. With no answer, the seat is released and offered to the waitlist. All values are configurable per organization within safe ranges. Tests, including the short-notice edge case, are listed in technical plan section 5.5. | Implements A-01 without leaving seats blocked forever, and without impossible deadlines. **Founders' clarification (8 Nov):** handle moves less than 3 hours before the new start, with a configurable minimum response window and tests. |
| P-06 | **Languages and regions are configuration, not code.** Supported locales and "required for publishing" rules live in config and a `locales` table. Mobile layouts use `start`/`end`, never `left`/`right`, from Phase 1. | Adding Spanish, German or Arabic later is mostly translation work. Arabic (relevant for Dubai) needs right-to-left layout, which costs almost nothing if we prepare now and a lot if we retrofit. |
| P-07 | **Multi-currency without currency conversion.** Prices are stored in minor units with an ISO 4217 currency and displayed with the user's locale formatting. Price filters work within a city's currency. No FX conversion in V1. | Correct and simple. Conversion can be added for display later. |
| P-08 | **Navigation by pillar:** tabs **Home · Discover · Practice · Connect · Profile**. "My classes" (bookings) is reached from Home's Today card and from Profile. | The pillars become visible in the product. It matches the reference's floating pill tab bar (the compass icon becomes Discover). |
| P-09 | **Interactive map in Discover (approved).** The provider is chosen after a documented comparison at the start of Phase 4: `react-native-maps` (Apple Maps on iOS, Google Maps on Android) vs Mapbox (`@rnmapbox/maps`). The comparison covers premium visual fit and brand styling on both platforms, consistency, performance, privacy, cost, keys, accessibility and localization (technical plan section 5.6). A recommendation with screenshots goes to the founders before integration. A list view always exists next to the map. | The map must match ORÉVA's premium visual identity. Costs, keys and privacy differ between providers. |
| P-10 | **App identifiers per environment**, from a single base value: production `com.oreva.app` / "ORÉVA" / scheme `oreva`; staging `com.oreva.app.staging` / "ORÉVA Staging" / `oreva-staging`; development `com.oreva.app.dev` / "ORÉVA Dev" / `oreva-dev`. Defined once in `app.config.ts` through `APP_ID_BASE` and `APP_VARIANT`. | All three can sit on one phone. Changing the base later is one value, but only until the first store submission (see O-03). |
| P-11 | **Placeholder guard.** Every partner, instructor, class and media row has `is_placeholder`. Each database knows its environment through a setting (`app.environment`). In production, a trigger refuses to publish or activate any placeholder row. Seed data only runs locally and in staging. Non-production builds show a visible "Sample data" label on placeholder content. | Implements A-06 with a hard technical stop, not just a convention. |
| P-12 | **Location privacy.** Location is only requested when the user taps "Near me", with "while using the app" permission. Coordinates are rounded to about 1 km before the search call, and they're never stored or logged. Choosing a city is always an alternative. Private meeting points (outdoor classes) show only an approximate area on the map until booking. | Location is sensitive data under GDPR. Discover works without it. |
| P-13 | **Connect in V1 = Circles + following instructors and studios.** "Sharing your journey" in V1 means sharing inside a Circle, or exporting a share card through the phone's share sheet. Public feeds and member↔instructor direct messages stay out of V1, as the spec says. They're post-MVP decisions with their own moderation design. | Keeps the spec's privacy and moderation scope while making the instructor relationship visible. |
| P-14 | **Typography.** Test Manrope and Onest as the main typeface, and optionally Cormorant or Playfair Display as an editorial accent. All have full Cyrillic support and an OFL license. Founders choose on real EN/FR/RU screens in Phase 1. | The reference's typeface probably lacks Cyrillic. An editorial accent helps ORÉVA not look like a generic fitness template. |
| P-15 | **Reference content we won't copy:** no calorie tile, no appearance-based categories ("Butt & Leg", "Face Yoga"), no invented "156K joined" social proof, no non-Pilates stock photos. | Spec rules on calories, appearance and invented data. Details in the design notes, section 5. |

---

## 5. App identifier and name check (A-05)

What I checked on 8 November 2026. The App Store and Google Play hosts are blocked from this cloud session's network, so these come from public web searches rather than direct store queries.

| Check | Result | Risk |
| --- | --- | --- |
| Bundle / package ID `com.oreva.app` in public listings | **No public app found** using it | Low, but **only App Store Connect and the Play Console can confirm availability**. Both are first-come, first-served, and the ID **can never change after the first store submission**. Register it as soon as the developer accounts exist. |
| Domain `oreva.com` | **Owned by an unrelated company**: an Indian industrial group that sells lighting, tiles and solar products under the **"OREVA" brand** ([oreva.com, "Our Journey"](https://oreva.com/oreva/our-journey)) | **Medium.** Reverse-domain IDs like `com.oreva.*` conventionally imply owning `oreva.com`. The stores don't verify this, so the ID is technically allowed. But universal links and the partner QR landing pages **need a domain ORÉVA controls**. |
| "OREVA" as an existing brand | The same industrial group uses "OREVA" as a brand (different sector). I found no Pilates or fitness app called ORÉVA or Oreva. | **Needs a legal check**, as spec section 17 already requires: INPI (France), EUIPO, WIPO, and Monaco's industrial property office, in the relevant classes (9 software, 41 fitness services, 44 if relevant). |
| Similar app names in the stores | Names found: "OREVE" (EV charging), "Orevas", "Orevital", "Oresa". None are fitness apps, and none is "ORÉVA". | Low confusion risk. Store name availability is confirmed when the listing is created. |

**Recommendation:** keep `com.oreva.app` as the configured base (P-10). Before the first TestFlight or Play internal upload:

1. confirm the legal entity
2. secure a domain ORÉVA controls for universal links
3. get the trademark clearance opinion
4. register the bundle ID in App Store Connect and the package name in the Play Console

If the trademark check advises it, the identifier can still change at no cost until then. (O-01 to O-04)

---

## 6. Development rules (Approved)

* Work phase by phase. Never build the whole application in one step.
* Every phase ends with lint, type checks and tests passing, EN/FR/RU keys in sync, updated docs, and a **reviewable GitHub branch and PR**. The report says plainly what works, what doesn't, and what couldn't be tested here (for example device-only behaviour).
* No invented Gym & Tonic information in production (A-06, P-11).
* Security, privacy, accessibility and the three-language requirement are never traded for speed.
* Product experience and visual quality come first in every decision.
* Major scope or architecture changes are proposed and approved before they're implemented.

---

## 7. Open items (outside engineering)

| ID | Item | Owner | Blocks |
| --- | --- | --- | --- |
| O-01 | **Legal entity** that owns ORÉVA (accounts, contracts, store listings) | Founders | Apple and Google developer enrollment, RevenueCat, processor agreements (DPAs) |
| O-02 | **Domain** controlled by ORÉVA, for universal links, partner landing pages and email sender | Founders | Phase 3 (QR landing), Phase 7 (invite links) |
| O-03 | **Trademark clearance** for "ORÉVA" (see section 5) | Founders + counsel | Final bundle ID registration, store listing |
| O-04 | **Apple Developer and Google Play organization enrollment.** On hold until O-01. D-U-N-S can take weeks. | Founders | First TestFlight / Play internal build (end of Phase 2 at the latest) |
| O-05 | ~~GitHub repository~~ **Resolved 8 Nov 2026:** `Sensitor/oreva` is approved for the Phase 0 documents. Long-term account ownership will follow the legal entity (O-01). | Founders | |
| O-06 | **Gym & Tonic written agreement:** logo, photos, instructor details, class data, payment model, cancellation policy | Founders | Production content (staging uses placeholders) |
| O-07 | **Russian (and French) native reviewer** for UI and legal texts | Founders | Public beta |
| O-08 | **Legal review:** feedback data classification, terms, privacy policy, refund and cancellation policy, insurance, Monaco data protection rules | Founders + counsel | Public beta |
| O-09 | **Weather provider** (commercial licence) | Engineering proposal, founders approve | Phase 6 |
| O-10 | **Video provider** (Mux vs Cloudflare Stream spike) | Engineering proposal, founders approve | Phase 5 |
| O-11 | **Map provider** (P-09). The map itself is approved; the provider will be recommended after the comparison. | Engineering proposal, founders approve | Phase 4 map integration |

---

## 8. Changes to the cahier des charges (summary)

| Spec section | Change |
| --- | --- |
| 0 / 3.2 "Ne pas construire une marketplace nationale" | Still true for **V1 features**. The **architecture** is now marketplace-ready and international (approved strategic update). |
| 2 Personas | "Partner" generalized to **organization** (studio, independent instructor, community, brand). Platform roles (admin, support) are separate from organization roles (owner, manager, instructor). |
| 4.3 CLS-02 | Status split into lifecycle, update state and computed availability (D-05). Booking states extended for waitlist offers, reconfirmation and future payment (P-04, P-05). |
| 4.4 "Report… demander confirmation" | Explicit reconfirmation for significant moves, with a guaranteed minimum response window and a minimum notice for significant moves (A-01, P-05) |
| 6.1 Edge Functions for booking | Booking logic moved to Postgres RPC (D-02) |
| 7 Data model | `_en/_fr` columns become JSONB localized fields (D-04). `partners` becomes `organizations`. New: `cities`, `venues`, `instructor_affiliations`, `specialties`, payment-ready booking fields, plus other tables listed in the technical plan. |
| 10 Navigation | Tabs renamed by pillar (P-08) |
| Addendum A | Locales are configuration, and RTL is prepared (P-06) |

---

## 9. Amendments after Phase 0

Decisions approved after Phase 0 that change or extend this record. Details are in the linked documents.

| ID | Decision | Status | Date | Changes |
| --- | --- | --- | --- | --- |
| C-1 | **Professional self-signup** for studios and instructors, with **mandatory ORÉVA review before a profile is published** | Approved | 8 Nov 2026 | Replaces "provider accounts are created by ORÉVA staff" for V1 (section 1). Brings the onboarding and verification part of horizon H3 forward. Instructor subscriptions and payouts stay post-MVP. |
| C-2 | **UI first on demo data**: real interfaces on all five tabs before each backend slice, with demo data strictly separated from production | Approved | 8 Nov 2026 | Replaces the phase order in technical plan section 7 with [roadmap revision 4](../roadmap/revision-4.md) |
| C-3 | **Fictional international demo data** (Monaco and the Côte d'Azur, Paris, London, Dubai, New York) in development and staging only, every fictional profile clearly identified | Approved | 8 Nov 2026 | Extends A-06 and P-11 (demo data never in production) |
| C-4 | **Map provider: Mapbox preferred**, confirmed only after an A/B prototype on iPhone (Mapbox vs Apple Maps) | Pending the iPhone A/B | 8 Nov 2026 | Resolves O-11 once confirmed. See [note 0002](../decisions/0002-discover-map-provider.md). |
| P-14 | Typeface: compare Manrope and Onest **on the real Phase 2 screens** before choosing | Pending | 8 Nov 2026 | Both typefaces stay bundled until the choice |
