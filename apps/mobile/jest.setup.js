jest.mock('@react-native-async-storage/async-storage', () =>
  require('@react-native-async-storage/async-storage/jest/async-storage-mock'),
);

// expo-video has no native player in Jest: a minimal stand-in.
jest.mock('expo-video', () => {
  const { View } = require('react-native');
  return {
    useVideoPlayer: () => ({ play: jest.fn(), pause: jest.fn(), loop: false, muted: false }),
    VideoView: (props) =>
      require('react').createElement(View, { testID: 'video-view', style: props.style }),
  };
});

// Haptics have no native module in Jest: record the calls.
jest.mock('expo-haptics', () => ({
  selectionAsync: jest.fn(() => Promise.resolve()),
  impactAsync: jest.fn(() => Promise.resolve()),
  notificationAsync: jest.fn(() => Promise.resolve()),
  ImpactFeedbackStyle: { Light: 'light', Medium: 'medium', Heavy: 'heavy' },
  NotificationFeedbackType: { Success: 'success', Warning: 'warning', Error: 'error' },
}));

// Reanimated 4 needs a native worklet runtime that Jest does not have, and its
// published mocks expect a DOM that would make Expo modules think they run on
// the web. Tests use a small local mock instead: animations land on their end
// value at once (see test-mocks/reanimated.js for what it covers).
jest.mock('react-native-reanimated', () => require('./test-mocks/reanimated'));
jest.mock('react-native-worklets', () => ({ scheduleOnRN: (fn, ...args) => fn(...args) }));
