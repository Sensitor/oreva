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
