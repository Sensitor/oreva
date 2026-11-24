import { colors, radii, type TintName } from '@oreva/tokens';
import { StyleSheet, View } from 'react-native';
import { AppText, initialsOf, toneColor } from '@/ui';

export interface MedallionProps {
  /** The Circle's name: its initials sit in the centre, in the serif. */
  name: string;
  /** Members' display names, placed around the arc (up to five). */
  members: readonly string[];
  size?: number;
  tint?: TintName;
}

const MAX_AROUND = 5;

/**
 * A Circle's medallion: the Circle's initials in a tinted disc, and its
 * members' initials on the arc around it. Decorative: the row or header
 * that holds it carries the spoken name and member count.
 */
export function Medallion({ name, members, size = 72, tint = 'lilac' }: MedallionProps) {
  const dot = Math.round(size * 0.34);
  const box = size + dot;
  const center = box / 2;
  const around = members.slice(0, MAX_AROUND);
  // Spread the members over the upper arc, from about 8 to 4 o'clock.
  const angles = around.map((_, i) =>
    around.length === 1 ? -90 : -200 + (i * 220) / (around.length - 1),
  );
  return (
    <View
      style={{ width: box, height: box }}
      accessibilityElementsHidden
      importantForAccessibility="no-hide-descendants"
      testID="medallion"
    >
      <View
        style={[
          styles.disc,
          {
            width: size,
            height: size,
            top: dot / 2,
            start: dot / 2,
            backgroundColor: toneColor(tint),
          },
        ]}
      >
        <AppText variant={size >= 88 ? 'title1' : 'title2'} color="textBrand">
          {initialsOf(name)}
        </AppText>
      </View>
      {around.map((member, i) => {
        const radians = ((angles[i] ?? 0) * Math.PI) / 180;
        return (
          <View
            key={`${member}-${String(i)}`}
            style={[
              styles.member,
              {
                width: dot,
                height: dot,
                top: center + (size / 2) * Math.sin(radians) - dot / 2,
                start: center + (size / 2) * Math.cos(radians) - dot / 2,
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
  disc: {
    position: 'absolute',
    borderRadius: radii.pill,
    alignItems: 'center',
    justifyContent: 'center',
  },
  member: {
    position: 'absolute',
    borderRadius: radii.pill,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.borderControl,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
