// @ts-check
import eslintReact from '@eslint-react/eslint-plugin'
import eslintJs from '@eslint/js'
import eslintRouter from '@tanstack/eslint-plugin-router'
import eslintTs from 'typescript-eslint'

export default eslintTs.config([
  {
    ignores: [
      'dist',
      '.vinxi',
      '.wrangler',
      '.vercel',
      '.netlify',
      '.output',
      'build/',
      '**/_generated/',
    ],
  },
  {
    extends: [
      eslintJs.configs.recommended,
      eslintTs.configs.recommended,
      eslintReact.configs['recommended-typescript'],
      ...eslintRouter.configs['flat/recommended'],
    ],
    files: ['**/*.ts', '**/*.tsx'],
    languageOptions: {
      parser: eslintTs.parser,
      parserOptions: {
        projectService: true,
      },
    },
    rules: {
      // Put rules you want to override here
      '@eslint-react/prefer-shorthand-boolean': 'warn',
    },
  },
])
