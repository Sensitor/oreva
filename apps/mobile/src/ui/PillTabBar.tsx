import { colors, elevation, radii, spacing, touchTarget } from '@oreva/tokens';
import type { BottomTabBarProps } from 'expo-router/js-tabs';
import {
  CirclePlay,
  Compass,
  House,
  UserRound,
  UsersRound,
  type LucideIcon,
} from 'lucide-react-native';
import { LayoutAnimation, Pressable, StyleSheet, View } from 'react-native';
import { useFontScale } from '@/theme/useFontScale';
import { useReduceMotion } from '@/theme/useReduceMotion';
import { AppText } from './AppText';

const ICONS: Record<string, LucideIcon> = {
  index: House,
  discover: Compass,
  practice: CirclePlay,
  connect: UsersRound,
  profile: UserRound,
};

/** Above this system text scale, every tab shows its label, not only the active one. */
const LARGE_TEXT_SCALE = 1.3;

/**
 * Floating pill tab bar from the visual reference: icon-only items, the active
 * item expands into a lavender pill with its label. Every item has a spoken label
 * and selected state; with large text sizes all labels are shown.
 */
export function PillTabBar({
  state,
  descriptors,
  emitter,
  navigateToTab,
  insets,
}: BottomTabBarProps) {
  const fontScale = useFontScale();
  const reduceMotion = useReduceMotion();
  const showAllLabels = fontScale >= LARGE_TEXT_SCALE;

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
          const Icon = ICONS[route.name] ?? House;
          const showLabel = focused || showAllLabels;

          const onPress = () => {
            const event = emitter.emit({
              type: 'tabPress',
              target: route.key,
              canPreventDefault: true,
            });
            if (!focused && !event.defaultPrevented) {
              if (!reduceMotion) {
                // Short, soft expansion of the active pill (220 ms, tokens.motion.duration.base).
                LayoutAnimation.configureNext(
                  LayoutAnimation.create(220, 'easeInEaseOut', 'scaleXY'),
                );
              }
              navigateToTab(route.key);
            }
          };

          return (
            <View key={route.key} style={focused ? styles.activeSlot : styles.slot}>
              <Pressable
                accessibilityRole="tab"
                accessibilityLabel={label}
                accessibilityState={{ selected: focused }}
                testID={`tab-${route.name}`}
                onPress={onPress}
                onLongPress={() => emitter.emit({ type: 'tabLongPress', target: route.key })}
                style={({ pressed }) => [
                  styles.item,
                  focused && styles.itemActive,
                  showAllLabels && !focused && styles.itemStacked,
                  pressed && styles.pressed,
                ]}
              >
                <Icon size={22} color={colors.textPrimary} strokeWidth={focused ? 2 : 1.75} />
                {showLabel ? (
                  <AppText
                    variant={focused ? 'footnote' : 'caption'}
                    weight={focused ? 'bold' : 'medium'}
                    numberOfLines={1}
                    style={styles.label}
                    importantForAccessibility="no"
                  >
                    {label}
                  </AppText>
                ) : null}
              </Pressable>
            </View>
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
    paddingHorizontal: spacing.md,
    alignItems: 'center',
  },
  bar: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
    padding: spacing.xs - 2,
    borderRadius: radii.pill,
    backgroundColor: colors.surface,
    boxShadow: elevation.floating,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: colors.borderSubtle,
    maxWidth: 480,
    alignSelf: 'stretch',
    justifyContent: 'space-between',
  },
  slot: {
    flexShrink: 0,
  },
  activeSlot: {
    flexShrink: 1,
  },
  item: {
    minWidth: touchTarget.min,
    minHeight: touchTarget.comfortable + 4,
    borderRadius: radii.pill,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    gap: spacing.xs - 2,
    paddingHorizontal: spacing.xs,
  },
  itemActive: {
    backgroundColor: colors.accent,
    paddingHorizontal: spacing.sm,
  },
  itemStacked: {
    flexDirection: 'column',
    gap: 2,
  },
  label: {
    flexShrink: 1,
  },
  pressed: {
    opacity: 0.8,
  },
});
