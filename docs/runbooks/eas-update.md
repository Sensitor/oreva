# Runbook · ORÉVA Preview and EAS Update

Every pull request merged into `main` reaches the founders' iPhones automatically, through a separate internal app, **ORÉVA Preview**. No `git pull`, `pnpm install` or `pnpm dev:mobile` is needed to test merged work.

## How it works

1. A pull request is merged into `main`.
2. The **CI** workflow runs (lint, typecheck, tests, bundles).
3. If CI passes, **EAS Update (preview)** (`.github/workflows/eas-update-preview.yml`) runs:
   - it computes the app's **native fingerprint** (the runtime version);
   - if an ORÉVA Preview build with that fingerprint exists, it **publishes an iOS update** to the `preview` channel;
   - if the native code changed (new module, permission, plugin or native setting), the fingerprint is new: it **starts a new preview build** instead, because the installed app could not run that update;
   - merges that do not touch the app (docs only, for example) publish nothing.
4. Open ORÉVA Preview on the iPhone. It checks for an update at launch and waits up to 5 seconds for it, so the change usually shows straight away. On a slow connection, it shows at the next launch.

Each run writes a summary in the **Actions** tab: commit, fingerprint, what happened, and a link to the update or build on expo.dev. A failed run is red and GitHub emails the person who merged.

## The three apps

| App                | Bundle ID               | Gets EAS Updates                            | Used for                  |
| ------------------ | ----------------------- | ------------------------------------------- | ------------------------- |
| ORÉVA Dev          | `com.oreva.app.dev`     | No: loads JavaScript from `pnpm dev:mobile` | Development on a computer |
| **ORÉVA Preview**  | `com.oreva.app.preview` | **Yes, from `main`, automatically**         | Testing what was merged   |
| ORÉVA (production) | `com.oreva.app`         | Not from this workflow                      | The store, later          |

ORÉVA Preview shows sample data with its labels, like ORÉVA Dev (it is not production). Both apps can sit side by side on the same iPhone.

## Safety rules built in

- The workflow can only publish to the `preview` channel. The channel, build profile and app variant are fixed in the workflow, and a guard step stops the run if they or the `preview` profile in `eas.json` change.
- It runs only after CI passed on `main` (never on a pull request or another branch), or by hand on `main` (Actions tab → EAS Update (preview) → Run workflow).
- One run at a time, never cancelled halfway.
- Builds started by the workflow use `--freeze-credentials`: CI never creates or changes certificates or provisioning profiles.
- Updates are tied to the native fingerprint (`runtimeVersion: { policy: 'fingerprint' }`), so an update never reaches a build it cannot run.
- `EXPO_TOKEN` lives only in GitHub's repository secrets. It is never printed.

## One-time setup

1. **Expo token:** expo.dev → account settings → Access tokens → Create token. Add it on GitHub: Settings → Secrets and variables → Actions → New repository secret, named `EXPO_TOKEN`.
2. **Mapbox:** `EXPO_PUBLIC_MAPBOX_ACCESS_TOKEN` must exist in the EAS **preview** environment (done on 24 November 2026).
3. **First ORÉVA Preview build, by hand** (the new bundle ID needs an Apple sign-in, which CI cannot do). From your computer, after pulling `main`:

   ```bash
   pnpm install
   ```

   ```bash
   cd apps/mobile && npx eas-cli@latest build --profile preview --platform ios
   ```

   Sign in with the Apple ID of the developer account and let EAS create the certificate and the ad hoc provisioning profile, with both iPhones selected. Install the build from the link or QR code.

4. **ORÉVA Dev:** rebuild it once (`--profile development`) when convenient, because `expo-updates` adds native code. Until then it keeps working as before.

Until step 3 is done, the workflow stops with "No ORÉVA Preview build exists yet". That is expected.

## When a new build is needed

| Change                                                                                  | What the workflow does     | What you do                                                                                                                  |
| --------------------------------------------------------------------------------------- | -------------------------- | ---------------------------------------------------------------------------------------------------------------------------- |
| Screens, text, translations, data, styles (JavaScript only)                             | Publishes an update        | Open the app                                                                                                                 |
| New native module, permission, plugin, `app.config.ts` native setting, Expo SDK upgrade | Starts a new preview build | Install it from the link in the summary                                                                                      |
| A new iPhone to test on                                                                 | Nothing                    | Register it (`npx eas-cli@latest device:create`), then run a preview build by hand: the provisioning profile must include it |

## Troubleshooting

- **"The EXPO_TOKEN secret is missing":** add it (setup step 1).
- **A build is started on every merge:** the fingerprint computed in CI differs from the build's. Compare them: `cd apps/mobile && npx eas-cli@latest fingerprint:compare`. The usual cause is an environment variable read by `app.config.ts` that is set in one place and not the other.
- **The update does not show:** close ORÉVA Preview completely and open it again. Check on expo.dev (project → Updates) that the update is on the `preview` branch and has the same runtime version as the installed build.
- **Roll back:** publish the previous good commit by running the workflow by hand from it, or republish with `npx eas-cli@latest update:republish` (see `eas update:republish --help`).

## Files

- `.github/workflows/eas-update-preview.yml`: the workflow
- `apps/mobile/eas.json`: the `preview` build profile (channel `preview`, environment `preview`)
- `apps/mobile/app.config.ts`: the `preview` variant, `runtimeVersion` and `updates`
- `apps/mobile/app.json`: the EAS project ID and owner, written by `eas init` (not secrets)
