import js from '@eslint/js';
import ts from 'typescript-eslint';
import hooks from 'eslint-plugin-react-hooks';
export default ts.config(
  {
    ignores: [
      'dist/**',
      'node_modules/**',
      'src/shared/api/generated/**',
      'test-results/**',
      'playwright-report/**',
      'coverage/**',
      'reports/**',
      '.stryker-tmp/**',
    ],
  },
  js.configs.recommended,
  ...ts.configs.recommended,
  {
    languageOptions: {
      parserOptions: { tsconfigRootDir: import.meta.dirname },
      globals: {
        console: 'readonly',
        process: 'readonly',
        URL: 'readonly',
        globalThis: 'readonly',
        setTimeout: 'readonly',
        clearTimeout: 'readonly',
        Blob: 'readonly',
        FormData: 'readonly',
        window: 'readonly',
        document: 'readonly',
        location: 'readonly',
        localStorage: 'readonly',
        crypto: 'readonly',
        fetch: 'readonly',
        self: 'readonly',
        AbortController: 'readonly',
        DOMException: 'readonly',
        TextEncoder: 'readonly',
        matchMedia: 'readonly',
      },
    },
    rules: {
      '@typescript-eslint/no-unused-vars': [
        'error',
        { argsIgnorePattern: '^_' },
      ],
    },
  },
  {
    files: ['src/**/*.{ts,tsx}'],
    plugins: { 'react-hooks': hooks },
    rules: { 'react-hooks/rules-of-hooks': 'error' },
  },
  {
    files: ['src/**/domain/*.ts', 'src/shared/api/*.ts'],
    ignores: ['**/*.test.ts'],
    rules: { complexity: ['error', { max: 10 }] },
  },
  // Registry source remains upstream-owned; audit it through types and browser integration.
  {
    files: [
      'src/shared/ui/*-node*.tsx',
      'src/shared/ui/*-toolbar*.tsx',
      'src/shared/ui/table-icons.tsx',
      'src/shared/ui/toolbar.tsx',
      'src/shared/ui/block*.tsx',
      'src/shared/lib/suggestion.ts',
    ],
    rules: { '@typescript-eslint/no-explicit-any': 'off' },
  },
);
