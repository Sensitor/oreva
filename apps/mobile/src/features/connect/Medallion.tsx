import { colors, elevation, radii, tints, type TintName } from '@oreva/tokens';
import { StyleSheet, View } from 'react-native';
import { AppText, initialsOf } from '@/ui';

export interface MedallionProps {
  /** The Circle's name: its initials sit in the centre, in the serif. */
  name: string;
  /** Members' display names, placed around the ring (up to five). */
  members: readonly string[];
  size?: number;
  tint?: TintName;
}

const MAX_AROUND = 5;

/**
 * A Circle's medallion (editorial direction): the Circle's initials in serif
 * on its tint, a fine iris ring set a little apart, like the monograms of
 * Discover, and its members as small paper seals resting on the ring.
 * Decorative: the row or header that holds it carries the name and members.
 */
export function Medallion({ name, members, size = 72, tint = 'lilac' }: MedallionProps) {
  const seal = Math.round(size * 0.32);
  const box = size + seal;
  const centre = box / 2;
  const ring = size / 2;
  const around = members.slice(0, MAX_AROUND);
  // Seals rest on the ring from about 10 o'clock round to 6, 42° apart, so
  // they never overlap one another (five seals span 168°).
  const angles = around.map((_, i) => (around.length === 1 ? 45 : -80 + i * 42));
  return (
    <View
      style={{ width: box, height: box }}
      accessibilityElementsHidden
      importantForAccessibility="no-hide-descendants"
      testID="medallion"
    >
      <View style={[styles.ring, { width: size, height: size, top: seal / 2, start: seal / 2 }]}>
        <View
          style={[styles.disc, { width: size - 8, height: size - 8, backgroundColor: tints[tint] }]}
        >
          <AppText
            variant={size >= 88 ? 'title1' : 'title2'}
            color="textBrand"
            maxFontSizeMultiplier={1}
          >
            {initialsOf(name)}
          </AppText>
        </View>
      </View>
      {around.map((member, i) => {
        const radians = ((angles[i] ?? 0) * Math.PI) / 180;
        return (
          <View
            key={`${member}-${String(i)}`}
            style={[
              styles.seal,
              {
                width: seal,
                height: seal,
                top: centre + ring * Math.sin(radians) - seal / 2,
                start: centre + ring * Math.cos(radians) - seal / 2,
              },
            ]}
          >
            <AppText variant="caption" weight="bold" color="textBrand" maxFontSizeMultiplier={1}>
              {initialsOf(member).slice(0, 1)}
            </AppText>
          </View>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  ring: {
    position: 'absolute',
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
  seal: {
    position: 'absolute',
    borderRadius: radii.pill,
    backgroundColor: colors.surface,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: colors.borderControl,
    alignItems: 'center',
    justifyContent: 'center',
    boxShadow: elevation.soft,
  },
});
