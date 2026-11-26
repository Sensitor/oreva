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

## How the founders send the selection

For each slot, on unsplash.com:

1. Check the photo page says **"Free to use under the Unsplash License"** (not Unsplash+).
2. Send the **photo page link** (for the credit).
3. Right-click the large image, **"Copy image address"**, and send that link too (it starts with `https://images.unsplash.com/photo-`).

Downloading is done from those links; the photo pages themselves cannot be read from the development environment.

## Processing (done once per photograph, then bundled in the app)

* **One grade for the whole set**, so photographs from different sources look like one series: white balance nudged warm, contrast slightly lowered, blacks lifted towards ink (#2A2230), saturation lowered about 10%. No filter look, no fake grain.
* **Crops** around the subject (the `focus` point is stored with each photograph), at 3x the size shown: hero 1290 x 1720, covers 1080 x 1350.
* **JPEG, quality about 78**, around 150 to 300 KB each, about 2.5 MB for the whole set.
* Bundled with the app (no network needed), loaded by `expo-image` with disk caching and a 250 ms fade.

## Credits

Unsplash does not require credit, but ORÉVA credits every photographer. The list lives in `apps/mobile/src/ui/editorial/photos.ts` and is filled with the selection.

| Slot | Photographer | Photo page |
| --- | --- | --- |
| (to be filled with the founders' selection) | | |

## Replacing with ORÉVA's own photographs

The same slots, the same brief, the same grade. Written consent from every person photographed and from every place shown, kept with the original files. Replace a file and its credit in `photos.ts`; nothing else changes.
