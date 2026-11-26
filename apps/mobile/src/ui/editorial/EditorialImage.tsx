import { colors } from '@oreva/tokens';
import { Image } from 'expo-image';
import { StyleSheet, View, type StyleProp, type ViewStyle } from 'react-native';
import { useReduceMotion } from '@/theme/useReduceMotion';
import type { EditorialPhoto } from './photos';

export interface EditorialImageProps {
  photo: EditorialPhoto;
  style?: StyleProp<ViewStyle>;
  /** Load first (the hero); the rest loads as it comes into view. */
  priority?: 'high' | 'normal' | 'low';
  testID?: string;
}

/**
 * An editorial photograph: decoded off the main thread, cached on disk, faded
 * in over 250 ms once loaded (at once with Reduce Motion), cropped around its
 * subject. Decorative for VoiceOver: the text next to it carries the meaning.
 * Without a photograph, a quiet sand surface: never a stand-in picture.
 */
export function EditorialImage({ photo, style, priority = 'normal', testID }: EditorialImageProps) {
  const reduceMotion = useReduceMotion();
  if (!photo.source) {
    return (
      <View
        style={[styles.empty, style]}
        accessibilityElementsHidden
        importantForAccessibility="no-hide-descendants"
        testID={testID}
      />
    );
  }
  const focus = photo.focus ?? { x: 0.5, y: 0.5 };
  return (
    <View style={[styles.frame, style]} testID={testID}>
      <Image
        source={photo.source}
        style={StyleSheet.absoluteFill}
        contentFit="cover"
        // expo-image's crop anchor, measured from the image's own edges (not a layout style).
        // eslint-disable-next-line no-restricted-syntax
        contentPosition={{ left: `${String(focus.x * 100)}%`, top: `${String(focus.y * 100)}%` }}
        transition={reduceMotion ? 0 : 250}
        priority={priority}
        cachePolicy="memory-disk"
        accessible={false}
        accessibilityElementsHidden
        importantForAccessibility="no-hide-descendants"
      />
    </View>
  );
}

const styles = StyleSheet.create({
  frame: {
    overflow: 'hidden',
    backgroundColor: colors.surfaceMuted,
  },
  empty: {
    backgroundColor: colors.surfaceMuted,
  },
});
