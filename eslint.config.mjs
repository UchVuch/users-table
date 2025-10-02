import { includeIgnoreFile } from '@eslint/compat';
import ESLint from '@eslint/js';
import Vue from 'eslint-plugin-vue';
import Oxlint from 'eslint-plugin-oxlint';
import prettierConfig from '@vue/eslint-config-prettier';
import eslintPluginVueScopedCSS from 'eslint-plugin-vue-scoped-css';
import globals from 'globals';
import path from 'node:path';
import { dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { defineConfigWithVueTs, vueTsConfigs } from '@vue/eslint-config-typescript';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const gitignorePath = path.resolve(__dirname, '.gitignore');

export default defineConfigWithVueTs([
  includeIgnoreFile(gitignorePath),
  {
    ignores: ['{dist,public}/**/*', 'node_modules', 'android', '**/*.scss']
  },
  ESLint.configs.recommended,
  ...Vue.configs['flat/recommended'],
  vueTsConfigs.recommended,
  Oxlint.configs['flat/recommended'],
  ...eslintPluginVueScopedCSS.configs['flat/recommended'],
  prettierConfig,
  {
    files: ['**/*.{js,mjs,cjs,jsx,vue,ts,mts,cts,tsx}'],
    linterOptions: {
      reportUnusedDisableDirectives: true
    },
    languageOptions: {
      globals: {
        ...globals.node,
        ...globals.browser,
        ...globals.es2021
      }
    },
    plugins: {},
    rules: {
      'vue-scoped-css/no-parsing-error': 'off',
      'no-console': ['warn', { allow: ['warn', 'error'] }],
      'no-undef': 'off',
      'no-unused-vars': 'off',
      '@typescript-eslint/no-unused-vars': [
        'error',
        {
          args: 'all',
          argsIgnorePattern: '^_', // Игнорирует аргументы, начинающиеся с _
          caughtErrors: 'all', // Включает проверку для `catch (err)`
          caughtErrorsIgnorePattern: '^_', // Игнорирует `catch (_err)`
          varsIgnorePattern: '^_', // Игнорирует переменные, начинающиеся с _
          destructuredArrayIgnorePattern: '^_'
        }
      ],
      '@typescript-eslint/ban-ts-ignore': 'off',
      'vue/multi-word-component-names': 'off',
      'vue/no-expose-after-await': ['error'],
      'vue/no-lifecycle-after-await': ['error'],
      'vue/no-mutating-props': ['error'],
      'vue/no-duplicate-attributes': [
        'error',
        {
          allowCoexistClass: false,
          allowCoexistStyle: false
        }
      ],
      'vue/require-default-prop': 'off',
      'vue/attribute-hyphenation': ['error'],
      'vue/v-on-event-hyphenation': ['error'],
      'vue/no-use-v-if-with-v-for': ['error'],
      'vue/valid-v-slot': ['error', { allowModifiers: true }],
      'vue/html-self-closing': ['error', { html: { void: 'always', normal: 'any', component: 'always' }, svg: 'always', math: 'always' }],
      quotes: ['error', 'single', { avoidEscape: true }],
      'vue/attributes-order': ['error'],
      'vue/no-lone-template': [
        'error',
        {
          ignoreAccessible: false
        }
      ]
    }
  }
]);
