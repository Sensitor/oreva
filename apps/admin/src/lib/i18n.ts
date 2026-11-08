import 'server-only';
import { createI18n, type Locale } from '@oreva/i18n';
import { cookies, headers } from 'next/headers';
import { LOCALE_COOKIE, resolveRequestLocale } from './locale';

export async function getRequestLocale(): Promise<Locale> {
  const [cookieStore, headerList] = await Promise.all([cookies(), headers()]);
  return resolveRequestLocale(
    cookieStore.get(LOCALE_COOKIE)?.value,
    headerList.get('accept-language'),
  );
}

export async function getTranslator() {
  const locale = await getRequestLocale();
  const i18n = createI18n({ locale });
  return { locale, t: i18n.t };
}
