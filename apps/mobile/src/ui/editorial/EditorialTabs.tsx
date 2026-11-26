import { colors, motion, radii, spacing } from '@oreva/tokens';
import { useState } from 'react';
import { Pressable, StyleSheet, View, type LayoutChangeEvent } from 'react-native';
import Animated, { useAnimatedStyle, withSpring, withTiming } from 'react-native-reanimated';
import { haptics } from '@/theme/haptics';
import { useReduceMotion } from '@/theme/useReduceMotion';
import { AppText } from '../AppText';

export interface EditorialTab<K extends string> {
  key: K;
  label: string;
}

export interface EditorialTabsProps<K extends string> {
  tabs: readonly EditorialTab<K>[];
  selected: K;
  onSelect: (key: K) => void;
  testID?: string;
}

/**
 * Two views of one screen (Programs, Sessions): the active label in plum, and
 * a short iris rule that slides under it on a spring. Announced as tabs, with
 * their selected state; with Reduce Motion the rule moves at once.
 */
export function EditorialTabs<K extends string>({
  tabs,
  selected,
  onSelect,
  testID,
}: EditorialTabsProps<K>) {
  const reduceMotion = useReduceMotion();
  const [frames, setFrames] = useState<Record<string, { x: number; width: number }>>({});
  const frame = frames[selected];

  const indicator = useAnimatedStyle(() => {
    if (!frame) {
      return { opacity: 0 };
    }
    const to = (value: number) =>
      reduceMotion ? withTiming(value, { duration: 0 }) : withSpring(value, motion.springs.gentle);
    return { opacity: 1, width: to(frame.width), transform: [{ translateX: to(frame.x) }] };
  });

  return (
    <View style={styles.row} accessibilityRole="tablist" testID={testID}>
      {tabs.map((tab) => {
        const active = tab.key === selected;
        return (
          <Pressable
            key={tab.key}
            accessibilityRole="tab"
            accessibilityLabel={tab.label}
            accessibilityState={{ selected: active }}
            onPress={() => {
              if (!active) {
                haptics.selection();
                onSelect(tab.key);
              }
            }}
            onLayout={(event: LayoutChangeEvent) => {
              const { x, width } = event.nativeEvent.layout;
              setFrames((current) => ({ ...current, [tab.key]: { x, width } }));
            }}
            style={styles.tab}
            testID={testID ? `${testID}-${tab.key}` : undefined}
          >
            <AppText
              variant="headline"
              weight={active ? 'bold' : 'medium'}
              color={active ? 'textBrand' : 'textSecondary'}
            >
              {tab.label}
            </AppText>
          </Pressable>
        );
      })}
      <Animated.View style={[styles.indicator, indicator]} pointerEvents="none" />
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    gap: spacing.lg,
    paddingBottom: spacing.xs,
  },
  tab: {
    minHeight: 44,
    justifyContent: 'center',
  },
  indicator: {
    position: 'absolute',
    bottom: 0,
    start: 0,
    height: 2,
    borderRadius: radii.pill,
    backgroundColor: colors.progress,
  },
});
