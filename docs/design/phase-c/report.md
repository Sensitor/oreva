# Design phase C report · Screens

Branch: `phase-c/screens` · Date: 24 November 2026
Scope: phase C of the design direction approved on 24 November 2026 (decision P-14), in the approved order: Discover, Practice and the player, Today, Connect and Circle, Profile, then sheets and states. Phase D (motion and polish) starts only after the founders' review on iPhone.

Every screen keeps its data, navigation, repositories, demo and production separation, tests and accessibility. What changes is hierarchy, surfaces, type and imagery. No dependency, native module, permission or EAS setting changed.

## What changed

| Screen | Change |
| --- | --- |
| **Today** (was Home) | The tab is renamed Today, Aujourd'hui, Сегодня (decision C-6; the route is still `index`). Editorial header: the date as a kicker, the greeting by time of day in the serif, La Ligne, the bell. The Today card is one plum editorial cover with the program chapter and a paper Start button, instead of a violet slab with circles. New **Continue** row when a session was left halfway on this phone, with La Ligne showing the real progress. Classes stay a rail, now of tickets; programs become a rail of covers. |
| **Discover map** | Public places: a plum dot in a paper ring. Private studios: a hollow iris ring over a faint iris area, never a pin. Groups: paper discs with a number (serif on Apple Maps). Near me uses the ORÉVA icon on a floating paper button. Filters read like a selected chip when active (lilac, iris edge, count). The bottom summary is a paper sheet with a serif count. |
| **Discover list** | Classes as **tickets**: a stub with the day and the time in serif numerals, a perforated edge, then what, who and where; tags, price and places in a band below. Grouped under a heading per day ("lundi 30 novembre"), in the class's own time zone. With large text the stub moves above the details. |
| **Class page** | The ticket at full size: title, studio and teacher, the time in large serif numerals with the local time zone, the duration. Then place (private-address rule unchanged), level, language, price paid at the venue, places, as hairline rows. The booking button is a plum outline, disabled, with its explanation underneath. |
| **Studio** | A 3:2 Voile cover with type, name and city (no photo until one is used with permission). The fictional-profile notice is a quiet sand band. Facts on a hairline row: specialties, teaching languages, number of places. Instructors as round portraits (initials). Classes as tickets. |
| **Instructor** | A large initials portrait, the name in the serif, La Ligne, facts row (specialties, languages). "Declared qualifications" kept word for word. Studios as a plain list. |
| **Sheets** | Paper, serif plum titles, hairline footer. iOS draws the rounded top of the page sheet itself. City list on hairlines with an iris check. |
| **Practice** | Editorial header, then two underline tabs, **Programs** and **Sessions** (no Favourites tab: the feature does not exist). Programs as chapter covers. The library as rows with a 4:5 Voile thumbnail, focus kicker, title, duration and level; filters as chips. |
| **Program** | Cover, description, La Ligne with a dot per session day, Start, then the schedule with serif day numbers; rest days are quiet; a finished day shows a sage check. |
| **Session** | Cover, description, a facts row (level, duration, equipment) instead of three coloured tiles, exercises as a numbered list with serif numerals ("01") and hairlines. No calories. |
| **Player** | Exercise count as a kicker, "up next", the timer in large serif numerals, La Ligne with a dot per exercise, and the controls on one paper bar with a plum play button (ORÉVA play and pause icons). |
| **Completion** | The ring closed with "Bravo", "Session complete" in the serif, La Ligne, and the real numbers of the session (exercises, duration). Never calories. |
| **Connect** | Editorial header; Circles as cards with a **medallion** (the Circle's initials, members' initials around the arc); followed instructors and studios as a portrait rail. "Create a Circle" in plum, "Join with a code" outlined. |
| **Circle** | Medallion header with the Circle's name in the serif and the members. The challenge on paper with La Ligne per member who shares activity, a dot per session; hidden activity stays a plain line of text. Bubbles: paper for others, lilac for you. Report and block unchanged. Plum send button. |
| **Profile** | Editorial header. The guest state is a lilac cover with the account invitation (disabled, outlined). Before the first session: an invitation to choose one, instead of two tiles reading "0". After: the real counts on this phone, in serif numerals. Settings rows unchanged. |

### Shared pieces added in this phase

`FactsRow` (facts on hairlines, each read as "label, value"), `UnderlineTabs` (text tabs with La Ligne, announced as tabs), `Medallion`, `formatDayHeading` and `dayKey` in `@oreva/i18n` (day headings in each language and grouping by the class's own day). `EditorialCover` takes an aspect ratio. `Avatar` initials are plum (serif from 64 pt). The page rhythm between sections grows from 24 to 32 pt.

## Honest data

* Program progress and the Continue row use only what happened on this phone (finished sessions, saved position). A program day counts as done when its session has been finished at least once; a session that appears twice in a program marks both days.
* Profile shows no number before the first session.
* No member counts, ratings, credentials or availability were invented. Places left, prices and challenge figures are the existing sample data, still labelled "Sample data".

## Accessibility

* 43 colour pairings tested (were 39): plum initials on sand, mist and lilac, and the sage check on cream.
* Tickets, covers, rows and portraits are each one button with a full spoken label. Day headings, screen titles and sheet titles are headers. The Practice tabs are announced as tabs with their selected state. Medallions and icons are decorative.
* Large text: tickets stack, fact labels and values wrap, tab labels stay on one line.
* La Ligne dots fill only once a step is done: nothing is shown as complete at 0%.

## Tests and checks

| Check | Result |
| --- | --- |
| `pnpm check` (lint, typecheck, tests, 18 turbo tasks) | Passes |
| `pnpm format:check` | Passes |
| Mobile tests | 127 (were 114): day-grouped list, ticket label and large-text layout, Practice tabs, program progress from finished sessions only, facts row, Today header and Continue row (shown and hidden), Profile invitation instead of zeros, Circle challenge lines and decorative medallion, La Ligne step filling |
| Token tests | 65 (were 61) |
| i18n tests | 36 (were 34): day headings in EN, FR and RU, grouping across midnight in the class's time zone |
| EN / FR / RU parity | Passes. New keys only, plus the tab key `tabs.home` renamed `tabs.today` with its new labels. |
| Web export | Bundles, no console errors |

## Screenshots (web build, iPhone width)

The web build has no map, so Discover shows the list.

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

* **The map:** markers, clusters, private areas and the bottom sheet were changed for Mapbox and Apple Maps but can only be seen on the iPhone (the web build has no map).
* **The player:** video, controls bar and completion screen run only on a device; their logic is covered by tests.
* Sheets on iOS (the native page sheet), haptics and press feel.
* Android: not built in this phase.

## Differences from the direction, and why

* **Active filters** show as one lilac control with a count, not one chip per filter. Separate chips need a short label for every filter and a way to remove each one: a small follow-up, not done here.
* **The map's bottom sheet** shows the serif count and the List button, without the first ticket peeking. That belongs with the sheet motion in phase D.
* **Mapbox cluster numbers** use Mapbox's own font: the serif needs a custom glyph set in a Mapbox style (decision C-4 still open).
* **The place preview** on the map (after tapping a marker) keeps its layout with the new components; its redesign goes with marker selection in phase D.
* **Studio covers** have no initials monogram; the serif name on the Voile carries it.
* The guest title keeps its existing translations ("Welcome to ORÉVA") rather than a new "Votre espace ORÉVA".

## Not in phase C (planned for D)

Entrances, the ring closing and "Bravo" fading in, the success haptic at the end of a session, the Circle join animation, marker selection, the breathing loading state, the cross-fade between tabs, and a full VoiceOver and performance pass on the iPhone.
