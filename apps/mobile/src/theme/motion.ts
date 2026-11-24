import { motion } from '@oreva/tokens';
import { Easing, Platform } from 'react-native';

/** Easing curves from the motion tokens. */
export const easing = {
  standard: Easing.bezier(...motion.easing.standard),
  out: Easing.bezier(...motion.easing.out),
};

/** The native driver is unavailable on the web build. */
export const useNativeDriver = Platform.OS !== 'web';
