import { useSyncExternalStore } from 'react';
import { AccessibilityInfo } from 'react-native';

/**
 * One shared subscription to the system Reduce Motion setting, so every button
 * and card can ask without each starting its own listener.
 */
let current = false;
let started = false;
const listeners = new Set<() => void>();

function set(value: boolean) {
  if (value !== current) {
    current = value;
    listeners.forEach((listener) => listener());
  }
}

function subscribe(listener: () => void) {
  listeners.add(listener);
  if (!started) {
    started = true;
    AccessibilityInfo.isReduceMotionEnabled()
      .then(set)
      .catch(() => undefined);
    AccessibilityInfo.addEventListener('reduceMotionChanged', set);
  }
  return () => {
    listeners.delete(listener);
  };
}

const snapshot = () => current;

/** True when the member has asked the system to reduce motion. Every animation must check it. */
export function useReduceMotion(): boolean {
  return useSyncExternalStore(subscribe, snapshot, snapshot);
}
