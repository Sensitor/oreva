# Testing Phase 2 on iPhone

This version adds native modules: maps (Mapbox and Apple Maps), location and video. **A new development build is required.** A JavaScript update alone isn't enough.

## 1. One-time setup: the Mapbox token

The Mapbox side of the A/B needs a **public** token (it starts with `pk.`). It's designed to live inside the app, so it isn't a secret. Still, it never goes in git or in the chat.

1. Create the account on mapbox.com in the company's name. Under **Tokens**, create a public token for development (default scopes are enough).
2. Add it to EAS as an environment variable for the **development** environment. Either use the expo.dev dashboard (Project → Environment variables) or run:

   ```bash
   cd apps/mobile && npx eas-cli@latest env:create --name EXPO_PUBLIC_MAPBOX_ACCESS_TOKEN --environment development --visibility plaintext
   ```

   The command asks for the value. Paste the `pk.` token there.

3. Optional: if you design an ORÉVA style in Mapbox Studio, add `EXPO_PUBLIC_MAPBOX_STYLE_URL` (`mapbox://styles/...`) the same way. Without it, the map uses Mapbox's light base style.

Without a token, the app still works. Discover shows Apple Maps and a notice saying the Mapbox token is missing.

Notes:

- iOS doesn't need a secret token any more: rnmapbox 10.3.17 marks the download token as no longer required.
- If an **Android** build fails while downloading the Mapbox SDK, add a secret token (`sk.`, scope `DOWNLOADS:READ`) as the EAS secret `RNMAPBOX_MAPS_DOWNLOAD_TOKEN`.
- The Android build hasn't been tested in this phase.

## 2. Build and install

```bash
cd apps/mobile && npx eas-cli@latest build --profile development --platform ios
```

Install the build on the iPhone from the link or QR code EAS shows. Then start the development server:

```bash
pnpm dev:mobile
```

## 3. What to test

### Discovery journey (founders' priority 3)

1. **Discover** opens on Monaco. Tap a place:
   - a filled lavender dot is a public place;
   - a hollow ring is a private studio, shown only as an approximate area.
2. The preview card shows the studio, the place and the next class. Tap **View profile** to open the studio profile, then **Instructors**, an instructor (for example Léa M., affiliated with three organizations), then a class.
3. Search **Лондон**, **Londres** or **London**. Also try Paris, Dubai and New York.
4. **Near me** shows an explanation first, then the iOS prompt. Refusing it offers Settings or city search instead.
5. **Filters** (for example Reformer) leaves only the matching studios on the map. **List** shows the same results as cards.

### Map A/B (decision C-4)

Profile → **Prototype settings** → **Map provider**: switch between **Mapbox** and **Apple Maps**. Compare them using the criteria in note 0002, section 7:

| Check       | Pass criterion                                                                        |
| ----------- | ------------------------------------------------------------------------------------- |
| Brand look  | Which one feels like ORÉVA?                                                           |
| Performance | Turn on **Show 2,000 test points**, then pan and zoom around the world. Is it smooth? |
| Privacy     | Private studios show only an approximate area at every zoom level                     |
| VoiceOver   | Every result can be reached with the **List** view                                    |
| Telemetry   | Profile → **Privacy** → Mapbox switch: turning it off persists                        |

### Practice, Connect, Profile

- **Practice:** open a program, a session, then **Start**. Pause, next, previous. Leave and come back: **Resume** starts where you stopped. Finish a session: it then counts in Profile.
- **Connect:** open _Morning crew_. Look at the challenge, then send a message. Long-press a message from someone else to see Report / Block. Also try **Create a Circle**.
- **Profile:** language, notifications (news is off by default), privacy, accessibility, about.

### Typeface (decision P-14)

Profile → **Design preview**: choose Manrope or Onest. **The choice applies to the whole app**, so you can compare on the real screens in all three languages.

## 4. Sending feedback

For each point, note the screen, the language, what you expected and what you saw. Include a screenshot if possible. Then tell us:

- **C-4:** Mapbox or Apple Maps
- **P-14:** Manrope or Onest
