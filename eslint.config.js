import js from '@eslint/js';
import globals from 'globals';
import react from 'eslint-plugin-react';
import reactHooks from 'eslint-plugin-react-hooks';
import prettier from 'eslint-config-prettier';

export default [
  { ignores: ['**/node_modules/**', '**/dist/**', 'server/uploads/**'] },
  js.configs.recommended,

  // Backend: Node.js
  {
    files: ['server/**/*.js'],
    languageOptions: {
      ecmaVersion: 'latest',
      sourceType: 'module',
      globals: globals.node
    },
    rules: {
      'no-unused-vars': ['warn', { argsIgnorePattern: '^(next|req|res|_)' }]
    }
  },

  // Frontend: React in the browser
  {
    files: ['client/**/*.{js,jsx}'],
    plugins: { react, 'react-hooks': reactHooks },
    languageOptions: {
      ecmaVersion: 'latest',
      sourceType: 'module',
      parserOptions: { ecmaFeatures: { jsx: true } },
      globals: globals.browser
    },
    settings: { react: { version: 'detect' } },
    rules: {
      ...react.configs.recommended.rules,
      ...react.configs['jsx-runtime'].rules,
      ...reactHooks.configs.recommended.rules,
      'react/prop-types': 'off',
      // Most pages load data inside useEffect. Kept as a warning for now;
      // the planned useAsync/data-fetching refactor (Phase 5) will clear these.
      'react-hooks/set-state-in-effect': 'warn',
      'no-unused-vars': ['warn', { varsIgnorePattern: '^[A-Z_]' }]
    }
  },

  // Config files and tests
  {
    files: ['*.config.js', 'client/*.config.js', 'server/**/*.test.js'],
    languageOptions: { globals: { ...globals.node } }
  },

  // Must be last: turns off rules that clash with Prettier formatting
  prettier
];
