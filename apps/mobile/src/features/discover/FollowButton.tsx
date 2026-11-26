import { colors, elevation, radii, spacing, touchTarget } from '@oreva/tokens';
import { Check, Plus } from 'lucide-react-native';
import { useTranslation } from 'react-i18next';
import { StyleSheet } from 'react-native';
import { toggleIn, usePrototypeStore } from '@/prototype/PrototypeStore';
import { AppText } from '@/ui';
import { SpringPressable } from '@/ui/editorial';

export interface FollowButtonProps {
  kind: 'organization' | 'instructor';
  id: string;
  name: string;
}

/**
 * Follow / Following (Connect in V1, P-13): a plum pill that turns to paper
 * with a check once followed. Announced with its selected state.
 */
export function FollowButton({ kind, id, name }: FollowButtonProps) {
  const { t } = useTranslation();
  const { state, update } = usePrototypeStore();
  const key = kind === 'organization' ? 'followedOrganizations' : 'followedInstructors';
  const following = state[key].includes(id);
  const Icon = following ? Check : Plus;
  return (
    <SpringPressable
      accessibilityRole="button"
      accessibilityState={{ selected: following }}
      accessibilityLabel={following ? t('a11y.unfollow', { name }) : t('a11y.follow', { name })}
      onPress={() => update((s) => ({ ...s, [key]: toggleIn(s[key], id) }))}
      haptic="selection"
      pressedScale={0.95}
      style={[styles.button, following ? styles.following : styles.follow]}
      testID={`follow-${id}`}
    >
      <Icon
        size={16}
        color={following ? colors.textPrimary : colors.textOnAction}
        strokeWidth={2.25}
      />
      <AppText
        variant="callout"
        weight="semibold"
        color={following ? 'textPrimary' : 'textOnAction'}
      >
        {following ? t('common.following') : t('common.follow')}
      </AppText>
    </SpringPressable>
  );
}

const styles = StyleSheet.create({
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xxs,
    minHeight: touchTarget.min,
    paddingHorizontal: spacing.md,
    borderRadius: radii.pill,
    boxShadow: elevation.raised,
  },
  follow: {
    backgroundColor: colors.actionPrimary,
  },
  following: {
    backgroundColor: colors.surface,
  },
});
