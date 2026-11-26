import { colors, motion, radii, spacing, touchTarget } from '@oreva/tokens';
import type { BottomTabBarProps } from 'expo-router/js-tabs';
import { useState } from 'react';
import { StyleSheet, View, type LayoutChangeEvent } from 'react-native';
import Animated, { useAnimatedStyle, withSpring, withTiming } from 'react-native-reanimated';
import { haptics } from '@/theme/haptics';
import { useReduceMotion } from '@/theme/useReduceMotion';
import { AppText } from './AppText';
import { SpringPressable } from './editorial/SpringPressable';
import {
  ConnectIcon,
  DiscoverIcon,
  PracticeIcon,
  ProfileIcon,
  TodayIcon,
  type IconComponent,
} from './icons';

const ICONS: Record<string, IconComponent> = {
  index: TodayIcon,
  discover: DiscoverIcon,
  practice: PracticeIcon,
  connect: ConnectIcon,
  profile: ProfileIcon,
};

/** Labels grow with the system text size up to this factor, then stay on one line. */
const LABEL_MAX_SCALE = 1.3;
/** The active mark: a short iris rule above the icon. */
const MARK_WIDTH = 20;

/**
 * The ORÉVA tab bar (editorial direction): cream, a hairline above, an ORÉVA
 * icon and a label on every tab. The active tab is plum and heavier, and a
 * short iris rule slides to it on a spring, like the Programs and Sessions
 * views of Practice. Selection is never shown by colour alone and is
 * announced to screen readers; with Reduce Motion the rule moves at once.
 */
export function TabBar({ state, descriptors, emitter, navigateToTab, insets }: BottomTabBarProps) {
  const reduceMotion = useReduceMotion();
  const [barWidth, setBarWidth] = useState(0);
  const count = Math.max(state.routes.length, 1);
  const itemWidth = barWidth / count;
  const target = itemWidth * state.index + (itemWidth - MARK_WIDTH) / 2;

  const mark = useAnimatedStyle(() => {
    if (barWidth === 0) {
      return { opacity: 0 };
    }
    return {
      opacity: 1,
      transform: [
        {
          translateX: reduceMotion
            ? withTiming(target, { duration: 0 })
            : withSpring(target, motion.springs.gentle),
        },
      ],
    };
  });

  return (
    <View
      pointerEvents="box-none"
      style={[styles.wrapper, { paddingBottom: Math.max(insets.bottom, spacing.xs) }]}
    >
      <View
        style={styles.bar}
        accessibilityRole="tablist"
        onLayout={(event: LayoutChangeEvent) => setBarWidth(event.nativeEvent.layout.width)}
      >
        <Animated.View
          style={[styles.mark, mark]}
          pointerEvents="none"
          accessibilityElementsHidden
          importantForAccessibility="no-hide-descendants"
          testID="tab-line"
        />
        {state.routes.map((route, index) => {
          const focused = index === state.index;
          const options = descriptors[route.key]?.options;
          const label = options?.title ?? route.name;
          const Icon = ICONS[route.name] ?? TodayIcon;
          const tint = focused ? colors.textBrand : colors.textSecondary;

          const onPress = () => {
            const event = emitter.emit({
              type: 'tabPress',
              target: route.key,
              canPreventDefault: true,
            });
            if (!focused && !event.defaultPrevented) {
              haptics.selection();
              navigateToTab(route.key);
            }
          };

          return (
            <SpringPressable
              key={route.key}
              accessibilityRole="tab"
              accessibilityLabel={label}
              accessibilityState={{ selected: focused }}
              testID={`tab-${route.name}`}
              onPress={onPress}
              onLongPress={() => emitter.emit({ type: 'tabLongPress', target: route.key })}
              pressedScale={0.92}
              style={styles.item}
            >
              <Icon size={24} color={tint} strokeWidth={focused ? 1.75 : 1.5} />
              <AppText
                variant="caption"
                weight={focused ? 'bold' : 'medium'}
                color={focused ? 'textBrand' : 'textSecondary'}
                numberOfLines={1}
                adjustsFontSizeToFit
                minimumFontScale={0.85}
                maxFontSizeMultiplier={LABEL_MAX_SCALE}
                style={styles.label}
                importantForAccessibility="no"
              >
                {label}
              </AppText>
            </SpringPressable>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    position: 'absolute',
    start: 0,
    end: 0,
    bottom: 0,
    backgroundColor: colors.background,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: colors.borderControl,
  },
  bar: {
    flexDirection: 'row',
    alignItems: 'stretch',
    maxWidth: 560,
    alignSelf: 'center',
    width: '100%',
  },
  item: {
    flex: 1,
    minWidth: touchTarget.min,
    minHeight: touchTarget.comfortable + 8,
    alignItems: 'center',
    justifyContent: 'flex-start',
    gap: 3,
    paddingTop: spacing.xs + 2,
    paddingBottom: spacing.xxs,
  },
  // 11pt like the system tab bar, so the longest labels fit at 320pt wide
  // ("Сообщество", "Communauté").
  label: {
    fontSize: 11,
    lineHeight: 14,
    letterSpacing: 0,
    textAlign: 'center',
    alignSelf: 'stretch',
  },
  // The active mark rests on the hairline, above the active icon. ORÉVA's
  // languages (EN, FR, RU) read left to right; an RTL language would need the
  // offset mirrored.
  mark: {
    position: 'absolute',
    top: 0,
    start: 0,
    width: MARK_WIDTH,
    height: 2,
    borderRadius: radii.pill,
    backgroundColor: colors.progress,
  },
});
