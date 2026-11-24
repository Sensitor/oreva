import { spacing, touchTarget } from '@oreva/tokens';
import { StyleSheet, View } from 'react-native';
import { AppText } from './AppText';
import { Line } from './Line';
import { PressableScale } from './PressableScale';

export interface UnderlineTab<K extends string> {
  key: K;
  label: string;
}

export interface UnderlineTabsProps<K extends string> {
  tabs: readonly UnderlineTab<K>[];
  selected: K;
  onSelect: (key: K) => void;
  testID?: string;
}

/**
 * Two or three views of one screen (Programs, Sessions): text tabs, the
 * active one in plum, heavier, with La Ligne beneath it. Announced as tabs.
 */
export function UnderlineTabs<K extends string>({
  tabs,
  selected,
  onSelect,
  testID,
}: UnderlineTabsProps<K>) {
  return (
    <View style={styles.row} accessibilityRole="tablist" testID={testID}>
      {tabs.map((tab) => {
        const active = tab.key === selected;
        return (
          <PressableScale
            key={tab.key}
            accessibilityRole="tab"
            accessibilityLabel={tab.label}
            accessibilityState={{ selected: active }}
            haptic={active ? undefined : 'selection'}
            onPress={() => onSelect(tab.key)}
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
            <View style={styles.indicator}>{active ? <Line width={56} /> : null}</View>
          </PressableScale>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    gap: spacing.lg,
  },
  tab: {
    minHeight: touchTarget.min,
    justifyContent: 'flex-end',
    gap: 2,
  },
  indicator: {
    height: 10,
  },
});
