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
        {size >= SERIF_FROM ? (
          <AppText
            variant={size >= 64 ? 'title1' : 'title2'}
            color="textBrand"
            maxFontSizeMultiplier={1}
            style={size < 64 ? styles.serifSmall : undefined}
          >
            {initialsOf(name)}
          </AppText>
        ) : (
          // The serif is never set under 22 pt: small seals use the sans.
          <AppText
            variant="caption"
            weight="bold"
            color="textBrand"
            maxFontSizeMultiplier={1}
            style={{ fontSize: Math.round(inner * 0.34), lineHeight: Math.round(inner * 0.42) }}
          >
            {initialsOf(name)}
          </AppText>
        )}
      </View>
    </View>
  );
}

/** From this size the initials fit in the serif at 22 pt or more. */
const SERIF_FROM = 52;

const styles = StyleSheet.create({
  // Two serif initials at the serif's smallest size fit inside a 52 pt seal.
  serifSmall: {
    fontSize: 22,
    lineHeight: 28,
  },
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
