import Constants from 'expo-constants';

export type AppVariant = 'development' | 'staging' | 'production';

function readVariant(): AppVariant {
  const value: unknown = Constants.expoConfig?.extra?.variant;
  return value === 'staging' || value === 'production' ? value : 'development';
}

export const appVariant: AppVariant = readVariant();

/** Sample data labels and the design preview are only visible outside production. */
export const isProduction = appVariant === 'production';

export const appVersion: string = Constants.expoConfig?.version ?? '0.0.0';
