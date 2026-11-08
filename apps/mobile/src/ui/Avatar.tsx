import { colors, radii, type ColorToken } from '@oreva/tokens';
import { StyleSheet, View } from 'react-native';
import { AppText } from './AppText';

export interface AvatarProps {
  name: string;
  size?: number;
  tone?: Extract<ColorToken, 'tileMint' | 'tileViolet' | 'tileOrchid' | 'backgroundTint'>;
}

export function initialsOf(name: string): string {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part.charAt(0).toUpperCase())
    .join('');
}

/** Initials avatar. No photos until photos with documented consent exist (P-15). */
export function Avatar({ name, size = 44, tone = 'tileViolet' }: AvatarProps) {
  return (
    <View
      accessibilityElementsHidden
      importantForAccessibility="no-hide-descendants"
      style={[styles.avatar, { width: size, height: size, backgroundColor: colors[tone] }]}
    >
      <AppText variant={size >= 64 ? 'title2' : 'callout'} weight="bold">
        {initialsOf(name)}
      </AppText>
    </View>
  );
}

const styles = StyleSheet.create({
  avatar: {
    borderRadius: radii.pill,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
