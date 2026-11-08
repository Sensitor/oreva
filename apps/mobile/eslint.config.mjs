import react from '@oreva/config/eslint/react';

export default [
  { ignores: ['.expo/**', 'dist/**', 'expo-env.d.ts', 'jest.setup.js', 'jest.config.js'] },
  ...react,
  {
    // Tests and configuration may use plain strings.
    files: ['**/*.test.{ts,tsx}', 'src/test-utils.tsx', 'app.config.ts'],
    rules: { 'react/jsx-no-literals': 'off', 'no-restricted-syntax': 'off' },
  },
];
