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
import { TypeHero, type TypeHeroProps } from './TypeHero';

/** The photograph takes a little under half the screen, so the title shows at once. */
const HERO_SHARE = 0.44;
const HERO_MIN = 280;
const HERO_MAX = 440;
/** Without a photograph, a shorter panel: the page gets to its content sooner. */
const TYPE_HERO_SHARE = 0.34;
const TYPE_HERO_MIN = 240;
const TYPE_HERO_MAX = 330;

export type DetailHero =
  | { kind: 'photo'; photo: EditorialPhoto }
  | ({ kind: 'type' } & Pick<TypeHeroProps, 'tone' | 'glyph' | 'children'>);

export interface DetailLayoutProps {
  /** A photograph (ORÉVA's own content) or a typographic panel (a partner, C-8). */
  hero: DetailHero;
  /** A control at the end of the bar over the hero (Follow). */
  trailing?: ReactNode;
  /** The one action of the page (Start), kept within reach at the bottom. */
  action?: ReactNode;
  /** A bar under the page, in the flow (a message composer that grows). */
  footer?: ReactNode;
  children: ReactNode;
  heroTestID?: string;
}

/**
 * A detail page in the editorial direction: the hero edge to edge (a
 * photograph for a program or a session, a typographic panel for a partner)
 * with a back button, a cream sheet laid over it, and the page's one action
 * fixed at the bottom.
 */
export function DetailLayout({
  hero,
  trailing,
  action,
  footer,
  children,
  heroTestID,
}: DetailLayoutProps) {
  const { t } = useTranslation();
  const insets = useSafeAreaInsets();
  const { height: windowHeight } = useWindowDimensions();
  const heroHeight =
    hero.kind === 'photo'
      ? Math.round(Math.min(Math.max(windowHeight * HERO_SHARE, HERO_MIN), HERO_MAX))
      : Math.round(
          Math.min(Math.max(windowHeight * TYPE_HERO_SHARE, TYPE_HERO_MIN), TYPE_HERO_MAX),
        );
  const scrollY = useSharedValue(0);
  const onScroll = useAnimatedScrollHandler((event) => {
    scrollY.value = event.contentOffset.y;
  });
  const bar = (
    <View style={[styles.heroBar, { top: insets.top + spacing.xs }]}>
      <RoundButton
        icon={ChevronLeft}
        accessibilityLabel={t('a11y.back')}
        onPress={() => router.back()}
        testID="detail-back"
      />
      {trailing}
    </View>
  );
  const bottom = action
    ? STICKY_ACTION_CLEARANCE + insets.bottom
    : footer
      ? spacing.lg
      : spacing.xxl + insets.bottom;

  return (
    <View style={styles.screen}>
      <Animated.ScrollView
        onScroll={onScroll}
        scrollEventThrottle={16}
        showsVerticalScrollIndicator={false}
        contentInsetAdjustmentBehavior="never"
        contentContainerStyle={{ paddingBottom: bottom }}
      >
        {hero.kind === 'photo' ? (
          <EditorialHero
            photo={hero.photo}
            height={heroHeight}
            scrollY={scrollY}
            testID={heroTestID}
          >
            {bar}
          </EditorialHero>
        ) : (
          <TypeHero
            tone={hero.tone}
            glyph={hero.glyph}
            height={heroHeight}
            scrollY={scrollY}
            testID={heroTestID}
          >
            {hero.children}
            {bar}
          </TypeHero>
        )}
        <View style={styles.sheet}>{children}</View>
      </Animated.ScrollView>
      {action ? <StickyAction>{action}</StickyAction> : null}
      {footer}
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
    end: spacing.gutter,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
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
