# ORÉVA photography

Art direction for every photograph in ORÉVA: the interim Unsplash selection (26 November 2026) and, later, the founders' own shoot. One brief for both, so the app never looks like a collection of unrelated stock pictures.

## The idea

**"Morning on the Riviera."** The calm, warm light of a Mediterranean morning, in quiet, beautiful rooms and on terraces by the sea. Pilates as a moment for yourself: concentrated, unhurried, precise. Never a gym, never a performance, never a smile at the camera.

## Rules every photograph follows

| | Yes | No |
| --- | --- | --- |
| Light | Natural daylight: early morning or late afternoon, soft side light through windows, long gentle shadows | Flash, studio strobes, neon, harsh noon sun, coloured gels |
| Colour | Warm whites, cream, sand, stone, linen, pale wood, olive green, a touch of lilac or plum in clothing | Saturated pink, red, electric blue, black gym floors, branded colours |
| Places | Light-filled studios with plaster walls and wood floors, Mediterranean architecture (arches, terraces, shutters, stone), the sea in the distance | Gyms, mirrored walls with fluorescent tubes, busy backgrounds, cars, visible brands or logos |
| People | One person (two at most), in movement, absorbed in the exercise; face turned away, in profile or out of frame | Posing for the camera, crowds, faces in close-up, sweat and strain, "fitness model" clichés |
| Pilates | Real Pilates: reformer, mat work, small props (ring, ball, band), with correct alignment | Yoga poses sold as Pilates, weights, treadmills, HIIT |
| Framing | Generous negative space (for text and the status bar), clear horizon, subject off-centre, details (hands on the reformer straps, a spine, feet on the bar) | Tight crops cutting limbs at the joints, tilted horizons, cluttered frames |
| Authenticity | Real photographs by real photographers | AI-generated images (decision C-8), heavy retouching, composites |

**Coherence:** choose from as few photographers and series as possible. Three photographs from the same shoot look like an art direction; ten from ten photographers look like a stock search.

## Shot list (10 slots, plus 2 spares)

| Slot | Used for | Format | What to look for |
| --- | --- | --- | --- |
| `today` | The Today hero, edge to edge under the status bar | Portrait 3:4 or taller, at least 1600 px wide | The strongest image of the set. A reformer or mat session in a light-filled room or on a terrace, the person small in the frame, **calm and light in the top third** (the status bar and the bell sit there) |
| `pg-foundations` | Program "Beginner foundations" | 4:5 | Mat work, a simple foundational movement, soft window light |
| `pg-on-the-go` | Program "Pilates on the go" | 4:5 | Mat on a terrace, a hotel room or by the sea: travel, outdoors |
| `pg-strong-centre` | Program "Strong centre" | 4:5 | Reformer, a controlled core movement, detail of straps and carriage |
| `wk-morning-reset` | Session "Morning reset" | 4:5 | Gentle stretch at a window, early light |
| `wk-core-foundations` | Session "Core foundations" | 4:5 | Core work on the mat (the hundred, a bridge), from the side |
| `wk-full-body-flow` | Session "Full body flow" | 4:5 | A long, flowing movement: arms and legs extended |
| `wk-hips-legs` | Session "Hips and legs" | 4:5 | Leg work on the reformer or mat |
| `wk-upper-posture` | Session "Upper body and posture" | 4:5 | Shoulders, back, a tall seated posture |
| `wk-travel-stretch` | Session "Travel stretch" | 4:5 | A stretch somewhere unexpected and beautiful (a terrace, a hotel room) |
| spare 1 | Future empty states and Discover | 4:5 or landscape | Architecture alone: an arch, a terrace, light and shadow on a white wall |
| spare 2 | Future Practice header | Landscape 3:2 | A quiet studio without people, reformers in morning light |

Photographs illustrate ORÉVA's own content only. They never stand for a real partner studio, instructor or class: partners appear with their own photographs, with documented permission, or with none.

## The selection of 26 November 2026

Made by Claude on the founders' behalf, on the brief above, through the official Unsplash API (the founders' own developer key).

* **One series at the core:** five photographs by **Roxana Popovici**, one shoot in one studio: warm cream walls, mirrors set in arches, pale reformers, a beige outfit, soft light. They carry the Today hero, two programs and two sessions.
* **Five photographs chosen for the same light:** an arch opening onto the sea, morning light on a cream wall, a hand on a mat, a Pilates ring in lilac, a stone arcade. No people where the brief allows a place.
* **Left out on purpose:** gyms, black or green studios, saturated mats (pink, blue, purple), photographs where the person poses for the camera, and every Unsplash+ photograph.
* **Verification, for each photograph:** its record from the Unsplash API (`GET /photos/:id`) shows a free photograph served from `images.unsplash.com` (Unsplash+ photographs are served from `plus.unsplash.com`), with its photographer and page; several records carry the camera model (Sony A7R IV, Canon EOS R5, Sony A6000, iPhone 12). Unsplash does not accept AI-generated images in its free library; the Popovici photographs are several frames of one session. Each download was recorded with Unsplash through the API's download link, as its guidelines require.
* **Two retouches, both on plain walls** (`tools/photography/retouch.py`): an air-conditioning unit on the Today photograph, and a small security camera on `pg-on-the-go` (removed on 26 November 2026, when the photograph became a full-width cover in Practice). Nothing else is altered beyond the shared grade and the crops.

## Processing (done once per photograph, then bundled in the app)

* **One grade for the whole set**, so photographs from different sources look like one series: white balance nudged warm, contrast slightly lowered, blacks lifted towards ink (#2A2230), saturation lowered about 10%. No filter look, no fake grain.
* **Crops** around the subject (the `focus` point is stored with each photograph), at 3x the size shown: hero 1290 x 1720, covers 1080 x 1350.
* **JPEG, quality 78**, 72 to 325 KB each, **1.4 MB for the whole set**.
* Tools: `tools/photography/grade.py` (crop and grade, parameters per slot) and `tools/photography/retouch.py`, run with Python 3 and Pillow on the downloaded originals.
* Bundled with the app (no network needed), loaded by `expo-image` with disk caching and a 250 ms fade.

## Credits

Unsplash does not require credit, but ORÉVA credits every photographer. The list lives in `apps/mobile/src/ui/editorial/photos.ts` and is filled with the selection.

| Slot | Photographer | Photo page | Licence |
| --- | --- | --- | --- |
| `today` (retouched) | Roxana Popovici | [Unsplash](https://unsplash.com/photos/woman-performs-pilates-on-a-reformer-machine-lKe5jm-Sypw) | Unsplash License |
| `pg-foundations` | Roxana Popovici | [Unsplash](https://unsplash.com/photos/woman-doing-pilates-workout-on-a-reformer-machine-hiHBILFNah4) | Unsplash License |
| `pg-strong-centre` | Roxana Popovici | [Unsplash](https://unsplash.com/photos/woman-doing-pilates-on-a-reformer-machine-Zp4APUiwEsM) | Unsplash License |
| `pg-on-the-go` (retouched) | Ositadinma Onyeobi | [Unsplash](https://unsplash.com/photos/archway-framing-bridge-over-water-JHGPC0NLv8s) | Unsplash License |
| `wk-morning-reset` | Huma Kabakci | [Unsplash](https://unsplash.com/photos/black-metal-window-frame-during-daytime-mnnAa1CBrM8) | Unsplash License |
| `wk-core-foundations` | David (dcube91) | [Unsplash](https://unsplash.com/photos/a-person-with-their-hands-on-a-yoga-mat-u87cFacgTNg) | Unsplash License |
| `wk-full-body-flow` | Roxana Popovici | [Unsplash](https://unsplash.com/photos/JvYE9bdyDG4) | Unsplash License |
| `wk-hips-legs` | Roxana Popovici | [Unsplash](https://unsplash.com/photos/woman-does-pilates-exercise-on-a-reformer-machine-aY5uOJ2o96g) | Unsplash License |
| `wk-upper-posture` | Amine Ben Mohamed | [Unsplash](https://unsplash.com/photos/a-woman-sitting-on-the-floor-holding-a-steering-wheel-Opuuyk1cn-o) | Unsplash License |
| `wk-travel-stretch` | Grigorii Shcheglov | [Unsplash](https://unsplash.com/photos/a-row-of-stone-pillars-in-a-building-LippfI8zkZM) | Unsplash License |

## Replacing with ORÉVA's own photographs

The same slots, the same brief, the same grade. Written consent from every person photographed and from every place shown, kept with the original files. Replace a file and its credit in `photos.ts`; nothing else changes.
