import { colors, elevation, radii, spacing, touchTarget } from '@oreva/tokens';
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
 * The ORÉVA tab bar: a paper capsule floating above the content, an ORÉVA
 * icon and a label on every tab. The active tab is plum, heavier, and marked
 * with the signature line; selection is never shown by color alone and is
 * announced to screen readers.
 */
export function TabBar({ state, descriptors, emitter, navigateToTab, insets }: BottomTabBarProps) {
  return (
    <View
      pointerEvents="box-none"
      style={[styles.wrapper, { paddingBottom: Math.max(insets.bottom, spacing.sm) }]}
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
              <View style={styles.indicator}>
                {focused ? <Line variant="tab" testID="tab-line" /> : null}
              </View>
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
    paddingHorizontal: spacing.sm,
    alignItems: 'center',
  },
  bar: {
    flexDirection: 'row',
    alignItems: 'stretch',
    paddingHorizontal: 0,
    paddingTop: spacing.xs,
    paddingBottom: spacing.xxs,
    borderRadius: radii.xl,
    backgroundColor: colors.surface,
    boxShadow: elevation.floating,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: colors.borderSubtle,
    maxWidth: 480,
    alignSelf: 'stretch',
  },
  item: {
    flex: 1,
    minWidth: touchTarget.min,
    minHeight: touchTarget.comfortable + 4,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 2,
    borderRadius: radii.lg,
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
  indicator: {
    height: 6,
    justifyContent: 'center',
  },
});
