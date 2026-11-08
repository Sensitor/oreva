import * as Sentry from '@sentry/react-native';
import { appVariant } from '@/config/env';

let started = false;

/**
 * Crash and error reporting. Off unless EXPO_PUBLIC_SENTRY_DSN is set (EU region).
 * No personal data is sent: no default PII, no request bodies, no screenshots.
 */
export function initSentry(): void {
  const dsn = process.env.EXPO_PUBLIC_SENTRY_DSN;
  if (started || !dsn) {
    return;
  }
  Sentry.init({
    dsn,
    environment: appVariant,
    sendDefaultPii: false,
    attachScreenshot: false,
    attachViewHierarchy: false,
    tracesSampleRate: appVariant === 'production' ? 0.1 : 1,
  });
  started = true;
}
