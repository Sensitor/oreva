# Visual reference analysis

Status: Phase 0 notes. Final tokens are locked in Phase 1, after the founders review them on real screens.

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
