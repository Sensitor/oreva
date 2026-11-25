import { resolveLocalizedText, type LocalizedText } from '@oreva/core';
import { useTranslation } from 'react-i18next';
import { useLocaleSettings } from '@/i18n/I18nProvider';
import { Button, EditorialCover, SampleBadge } from '@/ui';

export interface TodaySession {
  isPlaceholder: boolean;
  programTitle: LocalizedText;
  day: number;
  exercises: number;
  minutes: number;
}

export interface TodayCardProps {
  session: TodaySession;
  onStart: () => void;
}

/**
 * The "one clear next action" (cahier des charges 1.4): the one plum block of
 * the screen, the day as a large serif numeral, the cut-paper shapes settling
 * in the corner, and one Start bar. Paper on plum passes AA (8.6:1).
 */
export function TodayCard({ session, onStart }: TodayCardProps) {
  const { t } = useTranslation();
  const { locale } = useLocaleSettings();
  const title = resolveLocalizedText(session.programTitle, locale)?.text ?? '';

  return (
    <EditorialCover
      tone="plum"
      shapes
      kicker={`${t('home.today.label')} · ${t('home.today.programDay', { day: session.day })}`}
      numeral={String(session.day).padStart(2, '0')}
      title={title}
      meta={[
        t('home.today.exercises', { count: session.exercises }),
        t('common.durationMinutes', { count: session.minutes }),
      ].join(' · ')}
      badge={session.isPlaceholder ? <SampleBadge /> : undefined}
      testID="today-card"
    >
      <Button
        label={t('home.today.start')}
        accessibilityLabel={t('a11y.startSession')}
        variant="paper"
        withArrow
        fullWidth
        onPress={onStart}
      />
    </EditorialCover>
  );
}
