import type { ConfigContext, ExpoConfig } from 'expo/config';

/**
 * ORÉVA app configuration, one source for every environment (decision P-10).
 *
 * APP_VARIANT selects development, staging or production. APP_ID_BASE is the
 * production identifier; the store identifiers can no longer change after the
 * first store submission, so keep it configurable until the legal entity,
 * domain and trademark checks are done (decision record, section 5).
 */
export type AppVariant = 'development' | 'staging' | 'production';

export const DEFAULT_APP_ID_BASE = 'com.oreva.app';

export function resolveVariant(value: string | undefined): AppVariant {
  if (value === 'staging' || value === 'production') {
    return value;
  }
  return 'development';
}

export interface VariantIdentity {
  /** iOS bundle identifier and Android application id. */
  applicationId: string;
  /** Name under the icon. */
  displayName: string;
  /** Deep link scheme, e.g. oreva://classes/123 */
  scheme: string;
}

export function identityFor(
  variant: AppVariant,
  base: string = DEFAULT_APP_ID_BASE,
): VariantIdentity {
  if (!/^[a-z][a-z0-9]*(\.[a-z][a-z0-9]*)+$/.test(base)) {
    throw new Error(`APP_ID_BASE "${base}" is not a valid reverse-domain identifier`);
  }
  switch (variant) {
    case 'production':
      return { applicationId: base, displayName: 'ORÉVA', scheme: 'oreva' };
    case 'staging':
      return {
        applicationId: `${base}.staging`,
        displayName: 'ORÉVA Staging',
        scheme: 'oreva-staging',
      };
    case 'development':
      return { applicationId: `${base}.dev`, displayName: 'ORÉVA Dev', scheme: 'oreva-dev' };
  }
}

export default ({ config }: ConfigContext): ExpoConfig => {
  const variant = resolveVariant(process.env.APP_VARIANT);
  const identity = identityFor(variant, process.env.APP_ID_BASE ?? DEFAULT_APP_ID_BASE);

  return {
    ...config,
    name: identity.displayName,
    slug: 'oreva',
    version: '0.1.0',
    scheme: identity.scheme,
    orientation: 'portrait',
    icon: './assets/icon.png',
    userInterfaceStyle: 'light',
    ios: {
      bundleIdentifier: identity.applicationId,
      supportsTablet: false,
      config: { usesNonExemptEncryption: false },
    },
    android: {
      package: identity.applicationId,
      adaptiveIcon: {
        backgroundColor: '#ECE9FC',
        foregroundImage: './assets/android-icon-foreground.png',
        backgroundImage: './assets/android-icon-background.png',
        monochromeImage: './assets/android-icon-monochrome.png',
      },
      predictiveBackGestureEnabled: false,
    },
    web: {
      favicon: './assets/favicon.png',
    },
    plugins: [
      'expo-router',
      [
        'expo-splash-screen',
        {
          image: './assets/splash-icon.png',
          imageWidth: 160,
          backgroundColor: '#F5F4F7',
        },
      ],
      [
        'expo-localization',
        {
          // Lets members pick ORÉVA's language in the phone's per-app language settings.
          supportedLocales: ['en', 'fr', 'ru'],
          supportsRTL: false,
        },
      ],
      'expo-font',
      '@sentry/react-native',
    ],
    extra: {
      variant,
    },
  };
};
