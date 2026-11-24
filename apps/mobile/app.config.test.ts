import { describe, expect, it } from '@jest/globals';
import createConfig, {
  easProjectId,
  identityFor,
  resolveVariant,
  updatesConfig,
} from './app.config';
import appJson from './app.json';

describe('app identifiers per environment (decision P-10)', () => {
  it('derives every variant from one base identifier', () => {
    expect(identityFor('production')).toEqual({
      applicationId: 'com.oreva.app',
      displayName: 'ORÉVA',
      projectName: 'OREVA',
      scheme: 'oreva',
    });
    expect(identityFor('staging')).toEqual({
      applicationId: 'com.oreva.app.staging',
      displayName: 'ORÉVA Staging',
      projectName: 'OREVA Staging',
      scheme: 'oreva-staging',
    });
    expect(identityFor('preview')).toEqual({
      applicationId: 'com.oreva.app.preview',
      displayName: 'ORÉVA Preview',
      projectName: 'OREVA Preview',
      scheme: 'oreva-preview',
    });
    expect(identityFor('development')).toEqual({
      applicationId: 'com.oreva.app.dev',
      displayName: 'ORÉVA Dev',
      projectName: 'OREVA Dev',
      scheme: 'oreva-dev',
    });
  });

  it('lets the base change in one place', () => {
    expect(identityFor('staging', 'app.example.studio').applicationId).toBe(
      'app.example.studio.staging',
    );
  });

  it('rejects malformed identifiers', () => {
    expect(() => identityFor('production', 'ORÉVA app')).toThrow();
    expect(() => identityFor('production', 'oreva')).toThrow();
  });

  it('defaults to development for unknown variants', () => {
    expect(resolveVariant(undefined)).toBe('development');
    expect(resolveVariant('prod')).toBe('development');
    expect(resolveVariant('production')).toBe('production');
    expect(resolveVariant('preview')).toBe('preview');
  });

  it('builds the Expo config from APP_VARIANT', () => {
    const previous = process.env.APP_VARIANT;
    process.env.APP_VARIANT = 'production';
    const config = createConfig({
      config: {},
      projectRoot: '.',
      staticConfigPath: null,
      packageJsonPath: null,
    });
    expect(config.ios?.bundleIdentifier).toBe('com.oreva.app');
    expect(config.android?.package).toBe('com.oreva.app');
    expect(config.name).toBe('OREVA');
    expect(config.ios?.infoPlist?.CFBundleDisplayName).toBe('ORÉVA');
    expect(config.extra?.variant).toBe('production');
    process.env.APP_VARIANT = previous;
  });

  it.each([
    ['development', 'OREVADev', 'ORÉVA Dev'],
    ['preview', 'OREVAPreview', 'ORÉVA Preview'],
    ['staging', 'OREVAStaging', 'ORÉVA Staging'],
    ['production', 'OREVA', 'ORÉVA'],
  ] as const)(
    'gives %s an ASCII Xcode name (%s) and keeps the accent under the icon',
    (variant, xcodeTarget, displayName) => {
      const previous = process.env.APP_VARIANT;
      process.env.APP_VARIANT = variant;
      const config = createConfig({
        config: {},
        projectRoot: '.',
        staticConfigPath: null,
        packageJsonPath: null,
      });
      process.env.APP_VARIANT = previous;
      // Plain ASCII letters, digits and spaces: eas-cli and Expo prebuild then
      // derive the same Xcode target, whatever their version.
      expect(config.name).toMatch(/^[A-Za-z0-9 ]+$/);
      expect(config.name.replace(/ /g, '')).toBe(xcodeTarget);
      expect(config.ios?.infoPlist?.CFBundleDisplayName).toBe(displayName);
    },
  );

  it('keeps the EAS project id that eas init writes to app.json', () => {
    const config = createConfig({
      config: { extra: { eas: { projectId: 'test-project-id' } } },
      projectRoot: '.',
      staticConfigPath: null,
      packageJsonPath: null,
    });
    expect(config.extra?.eas).toEqual({ projectId: 'test-project-id' });
    expect(config.extra?.variant).toBe('development');
  });
});

describe('EAS Update (docs/runbooks/eas-update.md)', () => {
  const projectId = '6b4ab728-b98e-45d8-9eb4-155c979d4d74';

  it('reads the project ID that eas init wrote to app.json', () => {
    expect(easProjectId(appJson.expo.extra)).toBe(projectId);
    expect(appJson.expo.owner).toBe('orevawellness');
    expect(easProjectId(undefined)).toBeUndefined();
  });

  it('ties updates to the native fingerprint, so native changes need a new build', () => {
    expect(updatesConfig('preview', projectId)).toEqual({
      runtimeVersion: { policy: 'fingerprint' },
      updates: {
        url: `https://u.expo.dev/${projectId}`,
        checkAutomatically: 'ON_LOAD',
        fallbackToCacheTimeout: 5000,
      },
    });
  });

  it('applies updates on the next launch outside preview', () => {
    expect(updatesConfig('production', projectId).updates?.fallbackToCacheTimeout).toBe(0);
    expect(updatesConfig('development', projectId).updates?.fallbackToCacheTimeout).toBe(0);
  });

  it('turns updates off when the project is not linked to EAS', () => {
    expect(updatesConfig('preview', undefined).updates).toEqual({ enabled: false });
  });

  it('puts the update URL and owner in the generated config', () => {
    const previous = process.env.APP_VARIANT;
    process.env.APP_VARIANT = 'preview';
    const config = createConfig({
      config: appJson.expo,
      projectRoot: '.',
      staticConfigPath: null,
      packageJsonPath: null,
    });
    process.env.APP_VARIANT = previous;
    expect(config.owner).toBe('orevawellness');
    expect(config.updates?.url).toBe(`https://u.expo.dev/${projectId}`);
    expect(config.runtimeVersion).toEqual({ policy: 'fingerprint' });
    expect(config.ios?.bundleIdentifier).toBe('com.oreva.app.preview');
    expect(config.extra?.variant).toBe('preview');
  });
});
