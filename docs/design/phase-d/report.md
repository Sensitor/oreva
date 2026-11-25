# Design phase D report · New identity and motion

Branch: `phase-d/print-identity` · Date: 25 November 2026
Scope: the founders' review of phase C on iPhone, then phase D (motion) of the design direction.

## Why the identity changed

After phase C, the founders found the look "too AI": the smoky gradients of the Voile, the wave behind the Today card, the soft rounded cards. Three directions were drawn as mockups (cut paper, arch and awning, printed programme). The founders chose **C, the printed programme, with the cut-paper shapes of A** (decision C-9, 25 November 2026). Palette, typefaces, content, navigation, data and accessibility rules are unchanged.

## What the new identity is

| Element | Before (phase C) | Now (C-9) |
| --- | --- | --- |
| Imagery | Voile: layered gradients with a faint wave | None pretending to be real. Flat **cut-paper shapes** (sun, leaf, seed, stone), hand-cut and slightly irregular, at strong moments only. **No gradient anywhere**: a test fails if one appears. |
| Page top | Kicker, serif title, a wave underneath | **Masthead**: a heavy rule, ORÉVA and the context (date), a fine rule; then the serif title |
| Section titles | Serif title | Serif title on a **plum rule**, like a printed programme |
| Today | Plum Voile cover | One flat plum block: "TODAY · DAY 1", a large **"01"** in serif, the program, the shapes laid in the corner, a white Start bar |
| Classes | Paper tickets in boxes | **Timetable lines**: day and time in serif, a dashed rule, what, who, where; price and places below; headed by the day |
| Programs | Cover rail | **Chapters** 01, 02, 03 with title, length and level |
| Sessions (library) | 4:5 Voile thumbnail | The **minutes in serif** in a stub, then focus, title, level |
| Facts (class, studio, instructor, session, completion) | Hairline row of tiles | **Dotted leaders**: label ……… value |
| Progress | A wave with dots | A **straight rule that fills**, with a **square stamped** per step done |
| Profile | Lilac cover, invitation | A sand member block with the shapes, and the **week as seven stones**: empty outlines, filled for each day a session was finished on this phone |
| Corners | 10 to 28 pt | 2 to 8 pt: almost square, like paper |
| Tab bar | Floating paper capsule with a shadow | **Docked** under a plum rule, the active tab marked by a short rule |
| Session complete | Ring and "Session complete" | Shapes laid down one after the other, "SESSION COMPLETE", **Bravo** in serif, the real numbers |

## Motion (phase D)

| Moment | Motion | With Reduce Motion |
| --- | --- | --- |
| Screen entrance | The header and the first sections fade in and rise 8 pt, 240 ms, 40 ms apart, first five only | Shown at once |
| Cut paper | Each shape settles like paper laid on a table: fades in, turns 8° and grows from 90%, 320 ms, one after the other | Already in place |
| Progress (program, session, challenge, Continue) | The rule fills to its value in 600 ms, eased | Drawn at its value |
| Week stones | A stone filled this week settles in | Already filled |
| Session completed | The shapes are laid down, then Bravo; one **success haptic** | Shown at once; the haptic stays (it is not motion) |
| Press (from phase B) | Scale to 0.98, 120 ms | A slight dim |

Every animation uses the native driver except the progress fill (width), which runs once for 600 ms.

## Honest data

The week stones, the session counts and program progress come only from sessions finished on this phone. The week runs Monday to Sunday in the phone's time zone; day initials follow the language (L M M J V S D, П В С Ч П С В). Nothing is shown before the first session except empty stones and an invitation.

## Removed

`Voile`, the voile tokens and their tests, La Ligne's wave geometry, `FactsRow` (replaced by `FactList`). `expo-linear-gradient` is no longer used by any screen; it stays installed for now, because removing a native module changes the fingerprint and would force a new ORÉVA Preview build. It can go with the next native change.

## Tests and checks

| Check | Result |
| --- | --- |
| `pnpm check` (lint, typecheck, tests, 18 turbo tasks) and `pnpm format:check` | Pass |
| Mobile tests | 139 (were 127): printed blocks, masthead, dotted facts, no gradient in the app, cut paper settling and still with Reduce Motion, entrances staggered (first five) and skipped with Reduce Motion, progress growing or drawn at once, stamps filled only when done, week stones, the week counted from Monday in the phone's time zone, completion with Bravo, real numbers and the success haptic |
| Token tests | 59 (were 65: the six Voile tests are gone with the Voile) |
| i18n | 36, EN / FR / RU parity |
| Web export | Bundles, no console errors |

## Screenshots (web build, iPhone width)

The web build has no map, so Discover shows the list. Entrances are captured at rest.

| | EN | FR | RU |
| --- | --- | --- | --- |
| Today | ![](screenshots/today-en.webp) | ![](screenshots/today-fr.webp) | ![](screenshots/today-ru.webp) |
| Discover (list) | ![](screenshots/discover-en.webp) | ![](screenshots/discover-fr.webp) | ![](screenshots/discover-ru.webp) |
| Class | ![](screenshots/class-en.webp) | ![](screenshots/class-fr.webp) | ![](screenshots/class-ru.webp) |
| Studio | ![](screenshots/studio-en.webp) | ![](screenshots/studio-fr.webp) | ![](screenshots/studio-ru.webp) |
| Practice | ![](screenshots/practice-en.webp) | ![](screenshots/practice-fr.webp) | ![](screenshots/practice-ru.webp) |
| Session | ![](screenshots/session-en.webp) | ![](screenshots/session-fr.webp) | ![](screenshots/session-ru.webp) |
| Connect | ![](screenshots/connect-en.webp) | ![](screenshots/connect-fr.webp) | ![](screenshots/connect-ru.webp) |
| Circle | ![](screenshots/circle-en.webp) | ![](screenshots/circle-fr.webp) | ![](screenshots/circle-ru.webp) |
| Profile | ![](screenshots/profile-en.webp) | ![](screenshots/profile-fr.webp) | ![](screenshots/profile-ru.webp) |

Also in English: [Sessions tab](screenshots/practice-sessions-en.webp), [program](screenshots/program-en.webp), [instructor](screenshots/instructor-en.webp).

## Not verified here

* Motion and the haptic on the iPhone itself (timing, smoothness, the feel of the shapes settling). The animations are covered by tests, not seen in motion.
* The map, the player and the completion screen on a device.
* Android: not built.

## Not done in this phase (from the phase D plan)

* **Tab switch cross-fade:** tabs switch instantly, with the selection haptic. A cross-fade needs a custom tab transition; left out to keep the docked bar simple.
* **Map marker selection animation:** the selected marker is larger, but does not animate yet.
* **Circle join animation:** there is no join flow in the prototype yet (joining needs accounts).
* **Loading:** the existing gentle pulse is kept; the "breathing Voile" placeholder is gone with the Voile.
* A VoiceOver pass and a performance check on the iPhone: for the founders' review.
