import { spacing } from '@oreva/tokens';
import { router } from 'expo-router';
import { Sparkles } from 'lucide-react-native';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { StyleSheet, View } from 'react-native';
import { mapboxConfigured } from '@/features/discover/map/DiscoverMap';
import { usePrototypeStore, type MapProvider } from '@/prototype/PrototypeStore';
import { AppText, Chip, LinkRow, Button, ToggleRow } from '@/ui';
import { SettingsPage, settingsStyles } from './SettingsPage';

/**
 * Prototype settings for the founders' iPhone tests (development and staging
 * only): map provider A/B (note 0002), 2,000-point performance check,
 * link to the design system, reset.
 */
export function PrototypeScreen() {
  const { t } = useTranslation();
  const { state, update, reset } = usePrototypeStore();
  const [resetDone, setResetDone] = useState(false);
  const providers: MapProvider[] = ['mapbox', 'apple'];

  return (
    <SettingsPage title={t('profile2.prototype')}>
      <AppText variant="footnote" color="textSecondary">
        {t('prototypeScreen.intro')}
      </AppText>
      <View style={styles.group}>
        <AppText variant="headline">{t('prototypeScreen.mapProvider')}</AppText>
        <View style={styles.chips}>
          {providers.map((provider) => (
            <Chip
              key={provider}
              shape="pill"
              label={t(`prototypeScreen.${provider}`)}
              selected={state.mapProvider === provider}
              onPress={() => update((s) => ({ ...s, mapProvider: provider }))}
              testID={`provider-${provider}`}
            />
          ))}
        </View>
        {!mapboxConfigured ? (
          <AppText variant="footnote" color="info">
            {t('discover.mapboxMissing')}
          </AppText>
        ) : null}
      </View>
      <View style={settingsStyles.list}>
        <ToggleRow
          label={t('prototypeScreen.stressTest')}
          value={state.mapStressTest}
          onValueChange={(value) => update((s) => ({ ...s, mapStressTest: value }))}
          testID="toggle-stress"
        />
        <LinkRow
          icon={Sparkles}
          label={t('prototypeScreen.designSystem')}
          onPress={() => router.push('/design-preview')}
        />
      </View>
      <Button
        label={t('prototypeScreen.reset')}
        variant="secondary"
        shape="pill"
        onPress={() => {
          reset();
          setResetDone(true);
        }}
      />
      {resetDone ? (
        <AppText variant="footnote" color="success" accessibilityLiveRegion="polite">
          {t('prototypeScreen.resetDone')}
        </AppText>
      ) : null}
    </SettingsPage>
  );
}

const styles = StyleSheet.create({
  group: {
    gap: spacing.xs,
  },
  chips: {
    flexDirection: 'row',
    gap: spacing.xs,
  },
});
