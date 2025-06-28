import js from '@eslint/js';
import tsEslint from 'typescript-eslint';
import importPlugin from 'eslint-plugin-import';
import promisePlugin from 'eslint-plugin-promise';
import globals from 'globals';

export default [
    js.configs.recommended,

    {
        files: ['**/*.ts', '**/*.js'],
        languageOptions: {
            parser: tsEslint.parser,
            parserOptions: {
                project: './tsconfig.json',
            },
            globals: {
                ...globals.es2022,
                ...globals.node,
                ...globals.jest,
            },
        },
        plugins: {
            '@typescript-eslint': tsEslint.plugin,
            import: importPlugin,
            promise: promisePlugin,
        },
        rules: {
            semi: ['error', 'always'],
            quotes: ['error', 'single', { avoidEscape: true }],
            indent: ['error', 4],
            'linebreak-style': ['error', 'windows'],
            'no-trailing-spaces': 'error',
            'eol-last': ['error', 'always'],
            'comma-dangle': ['error', 'always-multiline'],
            'no-console': 'warn',
            'no-debugger': 'error',
            'prefer-const': 'error',
            'arrow-parens': ['error', 'always'],
            curly: ['error', 'all'],
            'no-var': 'error',
            'object-shorthand': ['error', 'always'],
            'prefer-template': 'error',
            'max-len': ['warn', { code: 120, ignoreComments: true }],
            '@typescript-eslint/no-unused-vars': ['warn', { argsIgnorePattern: '^_' }],
            '@typescript-eslint/explicit-function-return-type': 'off',
            '@typescript-eslint/no-explicit-any': 'warn',
            '@typescript-eslint/no-non-null-assertion': 'off',
            'import/order': [
                'error',
                {
                    groups: ['builtin', 'external', 'internal', 'parent', 'sibling', 'index'],
                    'newlines-between': 'never',
                },
            ],
            'promise/always-return': 'error',
            'promise/catch-or-return': 'error',
        },
    },
];
