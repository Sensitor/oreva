# Visual reference analysis

Status: **design direction approved by the founders on 24 November 2026** (section 0). Sections 1 to 7 are the Phase 0 analysis of the first reference; where they differ from section 0, section 0 wins.

## 0. Design direction (approved 24 Nov 2026)

From bright candy tiles to a warm, editorial calm: cream paper and plum ink carry the brand, lavender is a light rather than a fill, a serif gives ORÉVA its voice for titles and numerals, and one organic line becomes the signature. Source: the founders' moodboard. Implemented in phases A (foundations) to D (motion), each a separate PR.

### Palette

Tokens in `packages/tokens/src/palette.ts` and `colors.ts`. Every pairing used in the UI is in `contrastPairs` and tested for WCAG 2.2 AA.

| Name | Hex | Role | Key ratio |
| --- | --- | --- | --- |
| Cream | `#F7F3EE` | App background | ink 13.88 |
| Paper | `#FFFDFA` | Surfaces, sheets | ink 15.10 |
| Sand | `#E9E1D7` | Sunken areas, placeholders, notices | stone 4.54 |
| Lilac | `#E7DDF4` | Selected chips, soft highlights | ink 11.71 |
| Mist | `#DCCDEB` | Third soft tint for covers | ink 10.20 |
| Lavender | `#A78BC6` | Accent fills, **ink text only** | ink 5.22 |
| Iris | `#6E5390` | Progress, links, active marks | 5.76 on cream |
| Plum | `#4B365D` | Primary actions, serif titles | cream on plum 9.58 |
| Ink | `#2A2230` | Text, icons | |
| Stone | `#6B6170` / `#5A5060` | Secondary text / on tinted surfaces | 5.33 / 5.83 on lilac |
| Sage | `#4E6853` | Success (darkened from `#55705A` to pass on its surface) | 4.99 on `#E3EAE1` |
| Hairline | `#E2D8CC` | Decorative dividers only | |
| Control | `#938779` | Input and chip outlines | 3.18 on cream |

Mint and orchid are removed. Known failures, kept out of the UI: white on lavender (2.94), lavender lines or text on cream (2.66). That is why Iris exists.

### Typography

Manrope for the interface, **Cormorant Garamond** for editorial titles and numerals (decision P-14). Both OFL, both cover Latin and Cyrillic (every glyph of the app's FR and RU strings checked in the font files). The serif is never used below 22pt and never lighter than Medium.

| Style | Face | Size / line |
| --- | --- | --- |
| display | Cormorant Garamond Medium | 40 / 48 |
| title1 | Cormorant Garamond SemiBold | 30 / 36 |
| title2 | Cormorant Garamond SemiBold | 24 / 30 |
| headline | Manrope SemiBold | 17 / 23 |
| body / bodyStrong | Manrope Regular / SemiBold | 16 / 24 |
| callout | Manrope Medium | 15 / 21 |
| footnote / caption | Manrope Regular / Medium | 13 / 18, 12 / 16 |
| kicker | Manrope SemiBold, uppercase, +1.8 tracking | 12 / 16 |
| numeral / numeralSmall | Cormorant Garamond Medium | 48 / 58, 28 / 34 |

### Shape, depth, motion

* **Spacing:** 4-point grid, screen gutter 20, section rhythm 40 / 56.
* **Radii:** 4 tags, 10 inputs, 14 tickets and rows, 22 images and sheets, 28 hero covers, pill for buttons and chips only.
* **Elevation:** mostly tone and hairlines; one warm plum-tinted shadow for things that float (tab bar, sheets, map preview).
* **Motion:** press 120 ms, tab 180 ms, entrance 240 ms with a 40 ms stagger, progress 600 ms; eased, never bouncy. With Reduce Motion, instant or a simple fade.

### Imagery

Real photography only, licensed or shot with documented written permission. Never AI-generated images presented as real people, studios or classes. Until real photos exist, there is no placeholder imagery: screens are typographic (printed programme), with flat **cut-paper shapes** (sun, leaf, seed, stone) at strong moments only (`apps/mobile/src/ui/CutShape.tsx`). No gradients (decision C-9).

### Living style guide

Profile → Design system (development and staging builds) shows the tokens as the app renders them, with type samples in English, French and Russian.

### Components and signatures (phase B)

* **Buttons:** primary (plum, cream label), secondary (plum outline), paper (on plum or tinted backgrounds), accent (lavender, ink label, at most once per screen), quiet (sand), text (iris link). One primary action per screen.
* **Chips and tabs:** selection shown by weight and edge as well as color, and announced.
* **Printed programme (C-9):** a masthead between two rules (ORÉVA and the context), serif titles, section titles on a plum rule, facts with dotted leaders, large serif numerals (time, day, chapter), flat blocks with almost square corners, a docked tab bar under a plum rule.
* **Rules and stamps:** straight rules under titles and above the active tab; progress as a rule that fills, with a square stamped for each step.
* **Cut paper:** hand-cut flat shapes laid at strong moments only (Today, a finished session, the week as seven stones). Never a gradient, never a copy of an artwork.
* **Icons:** ORÉVA icons on a 24 grid, single 1.5 stroke, round ends, for navigation and practice; Lucide only for utilities.
* **Press:** 0.98 scale in 120 ms; a dim instead with Reduce Motion. Haptics stay rare: selection on chips and tabs, a light tap on primary buttons.

The founders' reference is a three-screen Pilates app concept: a Home screen, a session overview ("Pilates Primer") and an exercise player. It's the main design inspiration for ORÉVA. We follow its spirit and layout language, and refine it for accessibility, three languages and ORÉVA's own content rules.

> The reference image is not committed to this repository. It appears to be a third-party concept shot with stock photography. If the founders hold the rights and the repo stays private, it can be added under `docs/design/reference/` later.

## 1. What makes the reference work

* **Calm, light canvas.** A near-white neutral background (`#F5F5F5`) and pure white sheets for content. A very pale lavender (`#ECE9FC`) frames the screens.
* **One confident accent.** A blue-leaning lavender (`#9B86FA` to `#9E8AF5`) is used for the primary action only: the active tab, the play/pause button and the arrow chip.
* **Pastel "tiles" with a job.** Mint `#BAEABE`, soft violet `#C1B2FF` and orchid pink `#F0C7FF`. Each tile carries one fact (level, duration…) or one challenge card.
* **Very round geometry.** Cards around 28 to 32 px radius. Pill-shaped chips and buttons. Circular icon buttons for back, notifications and music.
* **Soft depth.** Light neumorphic shadows on chips, buttons and the floating tab bar, instead of borders.
* **Big, friendly type.** A two-line bold welcome headline. A geometric grotesk with open, rounded letterforms. Clear size jumps between title, section header and meta text.
* **Photography first.** Full-bleed or large rounded photos carry the emotion. UI chrome stays quiet.
* **Floating pill tab bar.** Icon-only items. The active item expands into a lavender pill with its label.
* **Player layout.** Large photo or video, a "Completed" card with a progress ring, a big timer and three large controls.

## 2. Sampled palette

Colors sampled from the reference image, as an average of 5×5 pixels:

| Role in reference | Sampled | Notes |
| --- | --- | --- |
| Frame / canvas | `#ECE9FC` | pale lavender wash |
| Screen background | `#F5F5F5` / `#F1F1F1` | neutral, slightly cool |
| Sheets and list rows | `#FFFFFF` / `#F6F6F6` | |
| Primary accent (active tab, pause) | `#9B86FA` to `#9E8AF5` | more saturated and bluer than the spec's `#A88AF0` |
| Hero card | `#A993D3` | muted lavender |
| Mint tile | `#BAEABE` to `#BFEEC4` | |
| Violet tile | `#C1B2FF` | |
| Pink tile | `#F0C7FF` to `#F1C9FD` | |
| Progress ring | `#B2A3F2` | |

## 3. Accessibility check (WCAG 2.2 AA)

Text needs at least 4.5:1 contrast (3:1 for large text). Icons and component boundaries need at least 3:1.

| Pair as used in the reference | Ratio | Result |
| --- | --- | --- |
| White "Day 1" text on hero card `#A993D3` | 2.69 | **fails** (even large text) |
| White pause icon on `#9B86FA` | 2.92 | **fails** the 3:1 icon minimum |
| Lavender `#9B86FA` as text or icon on `#F5F5F5` | 2.68 | **fails** |
| Grey meta text `#77717E` on mint tile | 3.51 | **fails** for body text |
| Dark text `#26232D` on `#9B86FA` | 5.28 | passes |
| Dark text `#26232D` on mint / violet / pink tiles | 11.5 / 8.1 / 10.5 | passes |
| Dark text `#26232D` on `#F5F5F5` | 14.2 | passes |
| Deep lavender `#6B4FCF` text on `#F5F5F5` | 5.29 | passes |
| White text on deep lavender `#6B4FCF` | 5.76 | passes |
| Secondary text `#6F6977` on `#F5F5F5` / white | 4.86 / 5.30 | passes |

### How we keep the look and pass AA

1. **The lavender accent stays.** We'll pick the final hue between the spec's `#A88AF0` and the reference's `#9B86FA` on real screens. It's used for fills, the active tab pill, progress and selection.
2. **Content on lavender is dark, not white.** Text and icons on lavender use the ink color `#26232D`. Where we want white on purple (a hero card or a premium moment), we use a deeper lavender around `#6B4FCF`.
3. **A deep lavender for text accents and links**, around `#6B4FCF`.
4. **Meta text on pastel tiles uses a tinted dark** (for example ink at 75%, checked to at least 4.5:1), not the generic grey.
5. **Soft shadows get help.** Neumorphic shadows alone don't meet the 3:1 boundary rule for interactive controls. Chips and secondary buttons get a hairline border (around 1 px at a 3:1 tone), or sit on a contrasting surface. The visual softness stays.
6. **Icon-only tabs have labels.** Every tab has an accessibility label. With large text sizes on, labels appear under the icons.
7. **Reduce Motion is respected everywhere**, including the rain animation.

## 4. Typography

The reference uses a geometric grotesk. ORÉVA needs **full Cyrillic support**, an open license (OFL), and good weights from 400 to 700. Candidates to test in Phase 1 with real EN, FR and RU strings:

| Role | Candidates | Why |
| --- | --- | --- |
| UI and headings (primary) | **Manrope**, **Onest** | closest in feel to the reference; excellent Cyrillic |
| Optional editorial accent | **Cormorant** or **Playfair Display** | for a few brand moments, such as onboarding, the tagline or partner stories. Gives ORÉVA an editorial voice the reference doesn't have, which helps it avoid looking like a generic fitness template. |

Russian strings are 20 to 30% longer than English, so the headline sizes are tested with RU first.

## 5. Content in the reference we will NOT copy

The reference is a generic fitness concept. Some of its content conflicts with the ORÉVA specification:

| In the reference | Problem | ORÉVA version |
| --- | --- | --- |
| "50.4 **Kcal**" stat tile | The spec bans calories, weight and appearance metrics | Third tile shows **Equipment** or **Focus** (for example "Mat only", "Core") |
| Categories "Butt & Leg", "Abs", "Arm", "Face Yoga" | Appearance-driven, and face yoga isn't Pilates | Movement-based: Core, Full body, Lower body, Upper body, Mobility & stretch, Breath & relax (final list approved by an instructor) |
| "users joined 156K" | Invented social proof | Only real numbers. Hidden below a threshold, or replaced by "3 friends from your Circle joined". |
| Dumbbell and water-bottle studio stock photos | Not Pilates, not ORÉVA, rights unknown | Editorial photography with documented rights: outdoor Monaco classes, real instructors with consent |
| Music button in the player | Music licensing is out of scope for V1 | Replaced by captions or audio-language selection |

## 6. Mapping to ORÉVA screens

| Reference element | ORÉVA use |
| --- | --- |
| Greeting + avatar + bell | Home header: localized greeting by time of day, notification center |
| "Welcome to your Pilates session" headline | Home headline, contextual: "Your class is tomorrow at 8:00", "A little rain today…" |
| "Day 1" hero card | **Today card**: next booked class, or the current program day, or the After Class suggestion. One clear next action (spec principle 1.4). |
| Category chips | Practice library filters, Discover filters |
| Challenges carousel | Circle challenges (Connect) and programs (Practice) |
| Stat tiles trio | Workout and class facts: level · duration · equipment / specialty |
| Exercise rows | Program days and workout chapters |
| Full-width "Start" | Primary action: Start session, Book class, Join Circle |
| Player with progress ring | Practice player. The ring shows session progress, never "calories". |
| Floating pill tab bar | **Home · Discover · Practice · Connect · Profile**. The reference's compass icon is the natural Discover icon. |

## 7. Motion

Short and soft, between 150 and 300 ms, using spring or ease-out curves. The pill tab moves between items. Cards lift slightly when pressed. The progress ring fills. The weather "rain" state is a gentle, looping illustration that falls back to a still image when Reduce Motion is on. No confetti, no bouncing badges.
