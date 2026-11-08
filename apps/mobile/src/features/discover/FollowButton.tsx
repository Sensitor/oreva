import { colors, radii, spacing, touchTarget } from '@oreva/tokens';
import { Check, Plus } from 'lucide-react-native';
import { useTranslation } from 'react-i18next';
import { Pressable, StyleSheet } from 'react-native';
import { toggleIn, usePrototypeStore } from '@/prototype/PrototypeStore';
import { AppText } from '@/ui';

export interface FollowButtonProps {
  kind: 'organization' | 'instructor';
  id: string;
  name: string;
}

/** Follow / Following toggle (Connect in V1: following instructors and studios, P-13). */
export function FollowButton({ kind, id, name }: FollowButtonProps) {
  const { t } = useTranslation();
  const { state, update } = usePrototypeStore();
  const key = kind === 'organization' ? 'followedOrganizations' : 'followedInstructors';
  const following = state[key].includes(id);
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityState={{ selected: following }}
      accessibilityLabel={following ? t('a11y.unfollow', { name }) : t('a11y.follow', { name })}
      onPress={() => update((s) => ({ ...s, [key]: toggleIn(s[key], id) }))}
      style={({ pressed }) => [
        styles.button,
        following ? styles.following : styles.follow,
        pressed && styles.pressed,
      ]}
      testID={`follow-${id}`}
    >
      {following ? (
        <Check size={16} color={colors.textPrimary} strokeWidth={2.5} />
      ) : (
        <Plus size={16} color={colors.textPrimary} strokeWidth={2.5} />
      )}
      <AppText variant="callout" weight="semibold">
        {following ? t('common.following') : t('common.follow')}
      </AppText>
    </Pressable>
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
  },
  follow: {
    backgroundColor: colors.accent,
  },
  following: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.borderControl,
  },
  pressed: {
    opacity: 0.85,
  },
});
