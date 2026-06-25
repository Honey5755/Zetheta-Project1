module.exports = {
  root: true,
  env: {
    browser: true,
    es2022: true,
  },
  parserOptions: {
    ecmaVersion: 'latest',
    sourceType: 'module',
    ecmaFeatures: { jsx: true },
  },
  settings: {
    react: { version: 'detect' },
    'import/resolver': {
      node: { extensions: ['.js', '.jsx'] },
    },
  },
  extends: [
    'airbnb',
    'airbnb/hooks',
    'plugin:jsx-a11y/recommended',
  ],
  plugins: ['react', 'react-hooks', 'jsx-a11y', 'import'],
  rules: {
    // New JSX transform (React 17+) — no need to import React in scope.
    'react/react-in-jsx-scope': 'off',
    'react/jsx-uses-react': 'off',
    // Allow JSX in .jsx files (project uses JavaScript + JSDoc, not TS).
    'react/jsx-filename-extension': ['error', { extensions: ['.jsx'] }],
    // RHF's register() relies on prop spreading onto inputs.
    'react/jsx-props-no-spreading': 'off',
    // We use JSDoc, not propTypes/defaultProps, for typing (Spec C2.5).
    'react/prop-types': 'off',
    'react/require-default-props': 'off',
    // Single-export utility/schema modules are intentional.
    'import/prefer-default-export': 'off',
    // Explicit extensions on relative imports (ESM-correct); packages exempt.
    'import/extensions': ['error', 'ignorePackages', { js: 'always', jsx: 'always' }],
    // PII must never reach console in production (Spec B4.4) — warn in dev.
    'no-console': ['warn', { allow: ['warn', 'error'] }],
    'jsx-a11y/label-has-associated-control': [
      'error',
      { assert: 'either' },
    ],
  },
  overrides: [
    {
      files: ['cypress/**/*.{js,jsx}'],
      extends: ['plugin:cypress/recommended'],
      env: { 'cypress/globals': true },
      rules: {
        'import/no-extraneous-dependencies': 'off',
        // Waiting out the simulated verification/lookup/compression delays is
        // intentional, and `.clear().type()` chaining is a documented pattern.
        'cypress/no-unnecessary-waiting': 'off',
        'cypress/unsafe-to-chain-command': 'off',
      },
    },
    {
      files: ['**/*.test.{js,jsx}', 'src/test/**/*.{js,jsx}'],
      globals: {
        describe: 'readonly',
        it: 'readonly',
        expect: 'readonly',
        vi: 'readonly',
        beforeEach: 'readonly',
        afterEach: 'readonly',
        beforeAll: 'readonly',
        afterAll: 'readonly',
      },
      rules: {
        'import/no-extraneous-dependencies': 'off',
        'no-console': 'off',
      },
    },
    {
      files: ['*.config.js', '.eslintrc.cjs', 'cypress.config.js'],
      env: { node: true },
      rules: {
        'import/no-extraneous-dependencies': 'off',
      },
    },
  ],
};
