import { colors, spacing, touchTarget } from '@oreva/tokens';
import type { BottomTabBarProps } from 'expo-router/js-tabs';
import { StyleSheet, View } from 'react-native';
import { haptics } from '@/theme/haptics';
import { AppText } from './AppText';
import {
  ConnectIcon,
  DiscoverIcon,
  PracticeIcon,
  ProfileIcon,
  TodayIcon,
  type IconComponent,
} from './icons';
import { Line } from './Line';
import { PressableScale } from './PressableScale';

const ICONS: Record<string, IconComponent> = {
  index: TodayIcon,
  discover: DiscoverIcon,
  practice: PracticeIcon,
  connect: ConnectIcon,
  profile: ProfileIcon,
};

/** Labels grow with the system text size up to this factor, then stay on one line. */
const LABEL_MAX_SCALE = 1.3;

/**
 * The ORÉVA tab bar (identity C-9): docked like the foot of a printed page,
 * a plum rule above, an ORÉVA icon and a label on every tab. The active tab
 * is plum, heavier, and marked with a short rule; selection is never shown
 * by colour alone and is announced to screen readers.
 */
export function TabBar({ state, descriptors, emitter, navigateToTab, insets }: BottomTabBarProps) {
  return (
    <View
      pointerEvents="box-none"
      style={[styles.wrapper, { paddingBottom: Math.max(insets.bottom, spacing.xs) }]}
    >
      <View style={styles.bar} accessibilityRole="tablist">
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
            <PressableScale
              key={route.key}
              accessibilityRole="tab"
              accessibilityLabel={label}
              accessibilityState={{ selected: focused }}
              testID={`tab-${route.name}`}
              onPress={onPress}
              onLongPress={() => emitter.emit({ type: 'tabLongPress', target: route.key })}
              style={styles.item}
            >
              <View style={styles.indicator}>
                {focused ? <Line variant="tab" testID="tab-line" /> : null}
              </View>
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
            </PressableScale>
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
    borderTopWidth: 1,
    borderTopColor: colors.actionPrimary,
  },
  bar: {
    flexDirection: 'row',
    alignItems: 'stretch',
    paddingHorizontal: spacing.xxs,
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
  // The active tab's rule sits just under the plum line of the bar.
  indicator: {
    height: 6,
    alignSelf: 'stretch',
    alignItems: 'center',
  },
});
