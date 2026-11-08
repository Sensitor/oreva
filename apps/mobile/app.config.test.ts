import { describe, expect, it } from '@jest/globals';
import createConfig, { identityFor, resolveVariant } from './app.config';

describe('app identifiers per environment (decision P-10)', () => {
  it('derives every variant from one base identifier', () => {
    expect(identityFor('production')).toEqual({
      applicationId: 'com.oreva.app',
      displayName: 'ORÉVA',
      scheme: 'oreva',
    });
    expect(identityFor('staging')).toEqual({
      applicationId: 'com.oreva.app.staging',
      displayName: 'ORÉVA Staging',
      scheme: 'oreva-staging',
    });
    expect(identityFor('development')).toEqual({
      applicationId: 'com.oreva.app.dev',
      displayName: 'ORÉVA Dev',
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
    expect(config.name).toBe('ORÉVA');
    expect(config.extra?.variant).toBe('production');
    process.env.APP_VARIANT = previous;
  });
});
