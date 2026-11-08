import type { AppVariant } from '@/config/env';
import type { DataSourceName } from './types';

/**
 * Chooses where data comes from. Demo data is FICTIONAL (C-3): it is allowed in
 * development and staging only. A production build that asks for it fails at
 * start-up instead of showing invented studios to real members.
 */
export function resolveDataSource(
  variant: AppVariant,
  requested: string | undefined,
): DataSourceName {
  const wanted = requested?.trim() || (variant === 'production' ? 'unavailable' : 'demo');
  if (wanted !== 'demo' && wanted !== 'unavailable') {
    throw new Error(`Unknown data source "${wanted}"`);
  }
  if (variant === 'production' && wanted === 'demo') {
    throw new Error('Demo data is not allowed in production builds (decision C-3).');
  }
  return wanted;
}
