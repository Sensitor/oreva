const fs = require('node:fs');
const path = require('node:path');

// lucide-react-native resolves to an .mjs build under the "react-native" condition;
// point Jest at its CommonJS build instead.
const lucideRoot = fs.realpathSync(path.join(__dirname, 'node_modules/lucide-react-native'));

/** @type {import('jest').Config} */
module.exports = {
  preset: 'jest-expo',
  setupFiles: ['./jest.setup.js'],
  testPathIgnorePatterns: ['/node_modules/', '/.expo/'],
  moduleNameMapper: {
    '^lucide-react-native$': path.join(lucideRoot, 'dist/cjs/lucide-react-native.js'),
  },
  // pnpm keeps packages under node_modules/.pnpm/<name@version>/node_modules/<name>.
  transformIgnorePatterns: [
    'node_modules/(?!(\\.pnpm|((jest-)?react-native|@react-native(-community)?)|expo(nent)?|@expo(nent)?/.*|@expo-google-fonts/.*|react-navigation|@react-navigation/.*|standard-navigation|@sentry/react-native|react-native-svg|lucide-react-native|@oreva/.*))',
  ],
};
