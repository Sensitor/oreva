import { LOCALE_INFO, SUPPORTED_LOCALES } from '@oreva/i18n';
import { getTranslator } from '@/lib/i18n';
import { setLocale } from './actions';

export default async function PortalHome() {
  const { t, locale } = await getTranslator();

  return (
    <main className="mx-auto flex w-full max-w-4xl flex-1 flex-col gap-10 px-6 py-12">
      <header className="flex flex-wrap items-center justify-between gap-4">
        <p className="text-lg font-semibold tracking-[0.2em]">{t('app.name')}</p>
        <form action={setLocale} aria-label={t('admin.language')} className="flex gap-2">
          {SUPPORTED_LOCALES.map((code) => (
            <button
              key={code}
              type="submit"
              name="locale"
              value={code}
              lang={code}
              aria-pressed={code === locale}
              className={`min-h-11 rounded-full px-4 text-sm font-medium transition ${
                code === locale
                  ? 'bg-accent text-ink'
                  : 'border border-border-control bg-surface text-ink'
              }`}
            >
              {LOCALE_INFO[code].nativeName}
            </button>
          ))}
        </form>
      </header>

      <section className="flex flex-col gap-4">
        <h1 className="text-4xl font-bold tracking-tight sm:text-5xl">{t('admin.title')}</h1>
        <p className="max-w-2xl text-lg text-ink-secondary">{t('admin.intro')}</p>
      </section>

      <section className="grid gap-4 sm:grid-cols-2">
        <article className="flex flex-col gap-2 rounded-card bg-tile-violet p-6">
          <h2 className="text-xl font-semibold">{t('admin.teamTitle')}</h2>
          <p className="text-ink">{t('admin.teamBody')}</p>
        </article>
        <article className="flex flex-col gap-2 rounded-card bg-tile-mint p-6">
          <h2 className="text-xl font-semibold">{t('admin.providerTitle')}</h2>
          <p className="text-ink">{t('admin.providerBody')}</p>
        </article>
      </section>

      <p className="rounded-card bg-surface p-6 text-ink-secondary shadow-sm">
        {t('admin.signInSoon')}
      </p>

      <footer className="mt-auto text-sm text-ink-secondary">{t('app.tagline')}</footer>
    </main>
  );
}
