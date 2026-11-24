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
 * The "one clear next action" (cahier des charges 1.4): the program chapter
 * as an editorial cover on the plum Voile, with one Start button. Paper text
 * on plum is contrast-tested at every stop of the gradient.
 */
export function TodayCard({ session, onStart }: TodayCardProps) {
  const { t } = useTranslation();
  const { locale } = useLocaleSettings();
  const title = resolveLocalizedText(session.programTitle, locale)?.text ?? '';

  return (
    <EditorialCover
      tint="plum"
      kicker={t('home.today.label')}
      title={t('home.today.programDay', { day: session.day })}
      meta={[
        title,
        t('home.today.exercises', { count: session.exercises }),
        t('common.durationMinutes', { count: session.minutes }),
      ].join(' · ')}
      badge={session.isPlaceholder ? <SampleBadge /> : undefined}
      minHeight={260}
      testID="today-card"
    >
      <Button
        label={t('home.today.start')}
        accessibilityLabel={t('a11y.startSession')}
        variant="paper"
        withArrow
        onPress={onStart}
      />
    </EditorialCover>
  );
}
