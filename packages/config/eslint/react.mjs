// Shared ESLint flat config for React and React Native code.
//
// Two ORÉVA rules are enforced here:
// 1. No hardcoded interface text: every user-facing string goes through i18n
//    (cahier des charges, AUTH-03 and Addendum A).
// 2. RTL-safe layout: use start/end style properties, never left/right
//    (decision P-06), so right-to-left languages can be added later.
import react from 'eslint-plugin-react';
import reactHooks from 'eslint-plugin-react-hooks';
import base from './base.mjs';

const TRANSLATABLE_PROPS =
  /^(accessibilityLabel|accessibilityHint|aria-label|placeholder|title|alt|label)$/;
const PHYSICAL_DIRECTION_STYLES =
  /^(marginLeft|marginRight|paddingLeft|paddingRight|left|right|borderLeftWidth|borderRightWidth|borderLeftColor|borderRightColor|borderTopLeftRadius|borderTopRightRadius|borderBottomLeftRadius|borderBottomRightRadius)$/;

export default [
  ...base,
  {
    files: ['**/*.{ts,tsx}'],
    plugins: { react, 'react-hooks': reactHooks },
    settings: { react: { version: 'detect' } },
    rules: {
      ...reactHooks.configs.recommended.rules,
      'react/jsx-key': 'error',
      'react/self-closing-comp': 'error',
      'react/jsx-no-literals': [
        'error',
        { noStrings: true, ignoreProps: true, allowedStrings: ['·', '•', '/', '%', ':', '+'] },
      ],
      'no-restricted-syntax': [
        'error',
        {
          selector: `JSXAttribute[name.name=${TRANSLATABLE_PROPS}] > Literal`,
          message: 'User-facing text must come from i18n (t("...")), not a hardcoded string.',
        },
        {
          selector: `Property[key.name=${PHYSICAL_DIRECTION_STYLES}]`,
          message:
            'Use logical start/end style properties (marginStart, paddingEnd, start, end, borderStartWidth...) so layouts work right-to-left.',
        },
      ],
    },
  },
];
