import * as Haptics from 'expo-haptics';
import { Platform } from 'react-native';

function run(feedback: () => Promise<void>) {
  if (Platform.OS === 'web') {
    return;
  }
  // Haptics are a courtesy: never let a failure reach the member.
  feedback().catch(() => undefined);
}

/**
 * Light, sparing haptics (design direction, motion plan). iOS also applies the
 * member's System Haptics setting.
 */
export const haptics = {
  /** Changing a selection: chip, tab, map marker. */
  selection: () => run(() => Haptics.selectionAsync()),
  /** A primary action: Start, Join, Book. */
  light: () => run(() => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)),
  /** Something finished: a completed session. */
  success: () => run(() => Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success)),
};

export type HapticKind = keyof typeof haptics;
