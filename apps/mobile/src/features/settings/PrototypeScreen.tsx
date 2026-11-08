import { spacing } from '@oreva/tokens';
import { router } from 'expo-router';
import { Sparkles } from 'lucide-react-native';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { StyleSheet, View } from 'react-native';
import { mapboxConfigured } from '@/features/discover/map/DiscoverMap';
import { usePrototypeStore, type MapProvider } from '@/prototype/PrototypeStore';
import { AppText, Card, Chip, LinkRow, PillButton, Screen, ScreenHeader, ToggleRow } from '@/ui';

/**
 * Prototype settings for the founders' iPhone tests (development and staging
 * only): map provider A/B (note 0002), 2,000-point performance check,
 * typeface comparison (P-14), reset.
 */
export function PrototypeScreen() {
  const { t } = useTranslation();
  const { state, update, reset } = usePrototypeStore();
  const [resetDone, setResetDone] = useState(false);
  const providers: MapProvider[] = ['mapbox', 'apple'];

  return (
    <Screen withTabBar={false}>
      <ScreenHeader title={t('profile2.prototype')} />
      <AppText variant="footnote" color="textSecondary">
        {t('prototypeScreen.intro')}
      </AppText>
      <Card style={styles.group}>
        <AppText variant="headline">{t('prototypeScreen.mapProvider')}</AppText>
        <View style={styles.chips}>
          {providers.map((provider) => (
            <Chip
              key={provider}
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
      </Card>
      <Card padded={false}>
        <ToggleRow
          label={t('prototypeScreen.stressTest')}
          value={state.mapStressTest}
          onValueChange={(value) => update((s) => ({ ...s, mapStressTest: value }))}
          testID="toggle-stress"
        />
        <LinkRow
          icon={Sparkles}
          label={t('prototypeScreen.typeface')}
          onPress={() => router.push('/design-preview')}
        />
      </Card>
      <PillButton
        label={t('prototypeScreen.reset')}
        tone="light"
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
    </Screen>
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
