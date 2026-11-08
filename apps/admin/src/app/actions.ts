'use server';

import { isSupportedLocale } from '@oreva/i18n';
import { cookies } from 'next/headers';
import { LOCALE_COOKIE } from '@/lib/locale';

export async function setLocale(formData: FormData): Promise<void> {
  const value = formData.get('locale');
  if (!isSupportedLocale(value)) {
    return;
  }
  const cookieStore = await cookies();
  cookieStore.set(LOCALE_COOKIE, value, {
    path: '/',
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
    httpOnly: true,
    maxAge: 60 * 60 * 24 * 365,
  });
}
