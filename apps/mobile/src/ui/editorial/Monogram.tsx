import { colors, radii, tints, type TintName } from '@oreva/tokens';
import { StyleSheet, View } from 'react-native';
import { AppText } from '../AppText';
import { initialsOf } from '../Avatar';

/**
 * A partner's portrait until a photograph used with permission exists (P-15,
 * C-8): serif initials on their tint, inside a fine iris ring set a little
 * apart, like a seal. Decorative: the name next to it carries the meaning.
 */
export function Monogram({
  name,
  size = 56,
  tone = 'lilac',
}: {
  name: string;
  size?: number;
  tone?: TintName;
}) {
  const inner = size - 8;
  return (
    <View
      accessibilityElementsHidden
      importantForAccessibility="no-hide-descendants"
      style={[styles.ring, { width: size, height: size }]}
    >
      <View style={[styles.disc, { width: inner, height: inner, backgroundColor: tints[tone] }]}>
        <AppText
          variant={size >= 64 ? 'title1' : 'title2'}
          color="textBrand"
          maxFontSizeMultiplier={1}
          style={size < 64 ? { fontSize: Math.max(22, inner * 0.42) } : undefined}
        >
          {initialsOf(name)}
        </AppText>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  ring: {
    borderRadius: radii.pill,
    borderWidth: 1,
    borderColor: colors.progress,
    alignItems: 'center',
    justifyContent: 'center',
  },
  disc: {
    borderRadius: radii.pill,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
