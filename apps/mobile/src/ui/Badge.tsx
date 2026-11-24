import { colors, radii, spacing, type ColorToken } from '@oreva/tokens';
import type { IconComponent } from './icons';
import { StyleSheet, View } from 'react-native';
import { AppText } from './AppText';

export interface BadgeProps {
  label: string;
  icon?: IconComponent;
  tone?: Extract<
    ColorToken,
    'surface' | 'surfaceMuted' | 'backgroundTint' | 'infoSurface' | 'successSurface'
  >;
}

/** Small non-interactive label (specialty, level, "Outdoor"...): softly square, hairline on paper. */
export function Badge({ label, icon: Icon, tone = 'surface' }: BadgeProps) {
  return (
    <View
      style={[styles.badge, { backgroundColor: colors[tone] }, tone === 'surface' && styles.edge]}
    >
      {Icon ? <Icon size={14} color={colors.textPrimary} strokeWidth={1.5} /> : null}
      <AppText variant="caption" numberOfLines={1}>
        {label}
      </AppText>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    gap: spacing.xxs,
    borderRadius: radii.xs,
    paddingHorizontal: spacing.xs,
    paddingVertical: 3,
  },
  edge: {
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: colors.borderSubtle,
  },
});
