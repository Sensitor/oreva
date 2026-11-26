import { colors, radii, spacing } from '@oreva/tokens';
import { router } from 'expo-router';
import { ChevronLeft } from 'lucide-react-native';
import type { ReactNode } from 'react';
import { useTranslation } from 'react-i18next';
import { StyleSheet, useWindowDimensions, View } from 'react-native';
import Animated, { useAnimatedScrollHandler, useSharedValue } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { EditorialHero } from './EditorialHero';
import type { EditorialPhoto } from './photos';
import { RoundButton } from './RoundButton';
import { STICKY_ACTION_CLEARANCE, StickyAction } from './StickyAction';

/** The photograph takes a little under half the screen, so the title shows at once. */
const HERO_SHARE = 0.44;
const HERO_MIN = 280;
const HERO_MAX = 440;

export interface DetailLayoutProps {
  photo: EditorialPhoto;
  /** The one action of the page (Start), kept within reach at the bottom. */
  action?: ReactNode;
  children: ReactNode;
  heroTestID?: string;
}

/**
 * A detail page in the editorial direction (a program, a session): the
 * photograph edge to edge with a back button, a cream sheet laid over it, and
 * the page's one action fixed at the bottom.
 */
export function DetailLayout({ photo, action, children, heroTestID }: DetailLayoutProps) {
  const { t } = useTranslation();
  const insets = useSafeAreaInsets();
  const { height: windowHeight } = useWindowDimensions();
  const heroHeight = Math.round(Math.min(Math.max(windowHeight * HERO_SHARE, HERO_MIN), HERO_MAX));
  const scrollY = useSharedValue(0);
  const onScroll = useAnimatedScrollHandler((event) => {
    scrollY.value = event.contentOffset.y;
  });
  const bottom = action ? STICKY_ACTION_CLEARANCE + insets.bottom : spacing.xxl + insets.bottom;

  return (
    <View style={styles.screen}>
      <Animated.ScrollView
        onScroll={onScroll}
        scrollEventThrottle={16}
        showsVerticalScrollIndicator={false}
        contentInsetAdjustmentBehavior="never"
        contentContainerStyle={{ paddingBottom: bottom }}
      >
        <EditorialHero photo={photo} height={heroHeight} scrollY={scrollY} testID={heroTestID}>
          <View style={[styles.heroBar, { top: insets.top + spacing.xs }]}>
            <RoundButton
              icon={ChevronLeft}
              accessibilityLabel={t('a11y.back')}
              onPress={() => router.back()}
              testID="detail-back"
            />
          </View>
        </EditorialHero>
        <View style={styles.sheet}>{children}</View>
      </Animated.ScrollView>
      {action ? <StickyAction>{action}</StickyAction> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: colors.background,
  },
  heroBar: {
    position: 'absolute',
    start: spacing.gutter,
  },
  sheet: {
    marginTop: -radii.sheet,
    borderTopStartRadius: radii.sheet,
    borderTopEndRadius: radii.sheet,
    backgroundColor: colors.background,
    paddingTop: spacing.xl,
    paddingHorizontal: spacing.gutter,
    gap: spacing.xl,
  },
});
