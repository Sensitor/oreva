# 0002 · Discover map provider (P-09 comparison)

Status: **Mapbox preferred by the founders (8 Nov 2026); final choice after the iPhone A/B prototype** (section 7, A/B variant)
Date: 8 November 2026
Related: decision P-09 (interactive map approved, provider chosen after comparison), P-03 (PostGIS), P-12 (location privacy), technical plan section 5.6

## 1. What the map must do

From the founders' brief of 8 November 2026 and the approved decisions:

| Need                                                                         | Source                           |
| ---------------------------------------------------------------------------- | -------------------------------- |
| A large, **worldwide** interactive map at the heart of Discover              | Founders, 8 Nov                  |
| A **premium look identical on iOS and Android**, in ORÉVA's palette          | P-09, visual reference           |
| Many points (studios, venues, classes) across cities, with **clustering**    | International marketplace vision |
| **Approximate areas** for private venues, never exact personal addresses     | P-12, founders, 8 Nov            |
| City search and **Near Me** after permission                                 | P-12, founders, 8 Nov            |
| The same map style in the **web provider portal**, for placing venues        | P-09 deliverable                 |
| Expo SDK 58, React Native 0.88 (New Architecture), EAS builds, pnpm monorepo | Technical plan                   |
| GDPR: minimal data sent to third parties, EU-friendly processors             | Section 6 of the technical plan  |

## 2. Candidates

|                                   | **react-native-maps**                                                                            | **Mapbox** (`@rnmapbox/maps`)                                                             |
| --------------------------------- | ------------------------------------------------------------------------------------------------ | ----------------------------------------------------------------------------------------- |
| Version checked (npm, 8 Nov 2026) | 1.29.11, the version **bundled with Expo SDK 58**                                                | 10.3.17 (released 4 Nov 2026), wraps the Mapbox Maps SDK v11                              |
| Base maps                         | **Apple Maps on iOS**, Google Maps on Android. Google on iOS is also possible with a Google key. | Mapbox vector tiles on both platforms                                                     |
| Maintainers                       | Community (open source), very widely used                                                        | Community wrapper (rnmapbox) around Mapbox's official native SDKs. Releases are frequent. |

A third option exists: **MapLibre** (`@maplibre/maplibre-react-native` 11.5.1). It's an open-source fork of the Mapbox SDK, New Architecture only, and needs a separate tile provider. It's listed in section 6 as an exit plan, not as a first choice.

## 3. Comparison

| Criterion (weight)                                          | react-native-maps                                                                                                                                                                                                                                                                             | Mapbox                                                                                                                                                                                                                            |
| ----------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Premium visual identity, same on iOS and Android** (high) | ✗ **Apple Maps can't be custom-styled**: `customMapStyle` works with the Google provider only. To get one ORÉVA style, we'd have to use Google Maps on iOS too (extra Google SDK and key). Google's JSON styling still works without a map ID, but Google is moving styling to cloud map IDs. | ✓ **One style made in Mapbox Studio, identical on iOS, Android and the web.** Full control over colours, labels, POIs and fonts.                                                                                                  |
| **Clustering many points** (high)                           | ~ No built-in clustering. It needs a JS library (supercluster) and React markers, which slow down beyond a few hundred points.                                                                                                                                                                | ✓ Native clustering on GeoJSON sources. Handles thousands of points smoothly. Circles and symbols are styled like the rest of the map.                                                                                            |
| **Approximate areas for private venues** (high)             | ✓ `Circle` / `Polygon` components                                                                                                                                                                                                                                                             | ✓ Circle and fill layers, styled with the brand                                                                                                                                                                                   |
| **Web portal with the same map** (medium)                   | ✗ Not on the web. The portal would need another library (Google Maps JS is billed per load beyond the free allowance).                                                                                                                                                                        | ✓ Mapbox GL JS for the portal, same style                                                                                                                                                                                         |
| **Expo / stack compatibility** (high)                       | ✓✓ Bundled with Expo SDK 58, config plugin included. **No key on iOS (Apple Maps)**, a Google key on Android.                                                                                                                                                                                 | ✓ Expo config plugin. Needs a **secret download token** (`sk.`, scope `DOWNLOADS:READ`) at build time, stored as an EAS secret, plus a public token (`pk.`) in the app. New Architecture supported.                               |
| **Cost** (medium)                                           | ✓ Apple Maps free. **Google Maps SDK for Android/iOS is free with no usage limit**; other Google services (Places, Geocoding) are billed separately.                                                                                                                                          | ✓ at pilot scale. **Free up to 25,000 monthly active users** (mobile), then about **$4 per 1,000 MAU**, with lower rates at higher volume (see section 4).                                                                        |
| **Privacy / GDPR** (high)                                   | ~ On Android, Google receives map usage. Apple Maps on iOS is privacy-friendly.                                                                                                                                                                                                               | ~ The SDK sends **de-identified location and usage telemetry** to Mapbox. Its terms **require an in-app telemetry opt-out**: the attribution control has one, or we provide our own in Profile. US processor, so a DPA is needed. |
| **Maintenance** (medium)                                    | ✓ Follows Expo SDK upgrades closely                                                                                                                                                                                                                                                           | ~ Each Expo upgrade needs a check of rnmapbox and Mapbox SDK compatibility. Pin versions.                                                                                                                                         |
| **Offline areas for travellers** (low, later)               | ✗                                                                                                                                                                                                                                                                                             | ✓ Offline packs                                                                                                                                                                                                                   |
| **Lock-in** (medium)                                        | Low                                                                                                                                                                                                                                                                                           | Medium. The way out is MapLibre: similar API and style format, see section 6.                                                                                                                                                     |

## 4. Cost estimates

These come from public pricing pages and secondary sources checked on 8 November 2026. **Re-check on the official pages before committing a budget.** Amounts in US dollars, per month.

| Scenario                                      | react-native-maps (Apple + Google)                     | Mapbox mobile                                                              |
| --------------------------------------------- | ------------------------------------------------------ | -------------------------------------------------------------------------- |
| Pilot: Monaco, ~2,000 monthly active users    | $0                                                     | $0 (under 25,000 MAU)                                                      |
| Growth: ~50,000 MAU                           | $0                                                     | ≈ $100 (25,000 billable × $4/1,000)                                        |
| Scale: ~250,000 MAU                           | $0                                                     | ≈ $700 to $800 (lower per-MAU bands apply; confirm thresholds with Mapbox) |
| Web portal maps (providers only, low traffic) | Google Maps JS: 10,000 loads free, then about $7/1,000 | Mapbox GL JS: 50,000 loads free                                            |

**Geocoding** (turning an address into coordinates) has rules of its own. Mapbox only allows storing results with **permanent geocoding** (paid, card on file). Temporary results must not be saved. Google has similar storage limits. **Recommendation, whatever the provider:** providers **place their venue pin on the map** and type the address themselves, so we store our own data. City search uses ORÉVA's `cities` table, so no third-party geocoding and no cost. With a few hundred venues, permanent geocoding would cost a few dollars anyway if we add it later.

## 5. Recommendation

**Mapbox (`@rnmapbox/maps`)** is the better fit for ORÉVA. It's the only option of the two that gives one premium map style across iOS, Android and the web portal, plus native clustering for a worldwide map. It's free during the pilot, and about $100 per month at 50,000 monthly active users.

Conditions attached to the recommendation:

1. **Telemetry opt-out** in Profile → Privacy (required by Mapbox's terms), disclosed in the privacy policy and the App Store / Play privacy labels. A Mapbox DPA is signed before the beta.
2. **Tokens:** the secret download token (`sk.`) only lives in EAS / CI secrets. The public token (`pk.`) is scoped to map display, with separate tokens for development, staging and production, rotated if exposed. Nothing is committed.
3. **Provider-independent data:** the app gets map points as GeoJSON from our own PostGIS RPC, so the map library can be swapped without touching the database.
4. **List view always available** next to the map (accessibility, no network, location refused).
5. **Validation gate on iPhone** at the start of the next phase, before building more on top. Criteria are in section 7.

If the founders put the **lowest cost and least setup** first and accept a different look on iPhone (Apple Maps) and Android (Google), react-native-maps is the fallback. It doesn't meet the "identical premium look" criterion.

## 6. Exit plan: MapLibre

`@maplibre/maplibre-react-native` (v11, New Architecture only, actively released in 2026) has an API and style format very close to Mapbox's. Tiles would come from a separate provider, possibly European, or from self-hosted tiles. That would remove the per-user SDK cost and the Mapbox telemetry. **Not recommended as the first choice:** the styling tools are less polished and it adds a tile-hosting decision. It stays a realistic way out if Mapbox costs, terms or the legal review become a problem.

## 7. Validation gate (iPhone, about one day)

A development build of the Discover map on Mapbox with the ORÉVA style and demo data. It passes if:

| Check           | Pass criterion                                                                        |
| --------------- | ------------------------------------------------------------------------------------- |
| Brand style     | Founders approve the look on iPhone (screenshots in the PR)                           |
| Performance     | Smooth pan and zoom with 2,000 clustered demo points on a recent iPhone               |
| Privacy display | Private demo venues show only an approximate circle, never a pin, at every zoom level |
| Accessibility   | VoiceOver can reach every result through the list view; map controls have labels      |
| Telemetry       | The opt-out works and persists                                                        |
| Build           | EAS development build succeeds with the download token as a secret                    |

If the founders prefer, the gate can be a **side-by-side A/B**: the same screen with Apple Maps through react-native-maps (no key needed on iPhone) and with Mapbox. That adds about one day.

## 8. What the founders need to provide

- A **Mapbox account** in the company's name. It needs a public token for development (`pk.`) and a secret download token (`sk.`, scope `DOWNLOADS:READ`), entered as EAS secrets, never in chat.
- A decision: **Mapbox** (recommended), **react-native-maps**, or **an A/B on iPhone first**.

## Sources (checked 8 November 2026)

- Expo SDK 58 bundled module versions: `expo/bundledNativeModules.json` (react-native-maps 1.29.11)
- npm registry: `react-native-maps` 1.29.11, `@rnmapbox/maps` 10.3.17, `@maplibre/maplibre-react-native` 11.5.1
- [Mapbox pricing](https://www.mapbox.com/pricing); secondary summaries: [StoreRocket](https://storerocket.io/learn/mapbox-pricing), [Superdupr](https://superdupr.com/blog/mapbox-pricing), [apis.io transcription](https://apis.io/plans/mapbox/mapbox-plans-pricing/)
- [Google Maps Platform core services pricing](https://developers.google.com/maps/billing-and-pricing/pricing), [Google Maps Platform pricing](https://mapsplatform.google.com/intl/en_uk/pricing/)
- [Google cloud-based maps styling, legacy overview](https://developers.google.cn/maps/documentation/ios-sdk/cloud-customization/legacy-overview?hl=en)
- [rnmapbox Expo installation](https://www.github.com/rnmapbox/maps/blob/main/plugin/install.md)
- [Mapbox: temporary vs permanent geocoding](https://docs.mapbox.com/help/dive-deeper/understand-temporary-vs-permanent-geocoding/)
- [Mapbox Android SDK attribution / telemetry opt-out](https://docs.mapbox.com/android/maps/api/latest/mapbox-maps-android/com.mapbox.maps.extension.compose.ornaments.attribution/-map-attribution-scope/-attribution-control.html)
- [Expo map view docs](https://docs.expo.dev/versions/latest/sdk/map-view.md)
- [MapLibre newsletter, April 2026](https://maplibre.org/news/2026-05-02-maplibre-newsletter-april-2026/), [maplibre-react-native releases](https://github.com/maplibre/maplibre-react-native/releases)
