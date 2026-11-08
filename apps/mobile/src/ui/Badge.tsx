import { colors, radii, spacing, type ColorToken } from '@oreva/tokens';
import type { LucideIcon } from 'lucide-react-native';
import { StyleSheet, View } from 'react-native';
import { AppText } from './AppText';

export interface BadgeProps {
  label: string;
  icon?: LucideIcon;
  tone?: Extract<
    ColorToken,
    'surface' | 'surfaceMuted' | 'backgroundTint' | 'infoSurface' | 'successSurface'
  >;
}

/** Small non-interactive label (specialty, level, "Outdoor"...). */
export function Badge({ label, icon: Icon, tone = 'surface' }: BadgeProps) {
  return (
    <View style={[styles.badge, { backgroundColor: colors[tone] }]}>
      {Icon ? <Icon size={14} color={colors.textPrimary} strokeWidth={2} /> : null}
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
    borderRadius: radii.pill,
    paddingHorizontal: spacing.xs + 2,
    paddingVertical: 4,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: colors.borderSubtle,
  },
});
