const js = require('@eslint/js');
const tsEslint = require('typescript-eslint');
const parser = require('@angular-eslint/template-parser');
const angularEslintTemplate = require('@angular-eslint/eslint-plugin-template');
const importPlugin = require('eslint-plugin-import');
const promisePlugin = require('eslint-plugin-promise');
const globals = require('globals');

module.exports = [
    js.configs.recommended,

    {
        files: ['**/*.html'],
        languageOptions: {
            parser: parser,
        },
        plugins: {
            '@angular-eslint/template': angularEslintTemplate,
        },
        rules: {
            '@angular-eslint/template/no-negated-async': 'error',
            '@angular-eslint/template/eqeqeq': 'error',
            '@angular-eslint/template/banana-in-box': 'warn',
            '@angular-eslint/template/no-any': 'warn',
            '@angular-eslint/template/conditional-complexity': ['warn', { maxComplexity: 5 }],
            'quotes': ['error', 'single', { avoidEscape: true }],
            'linebreak-style': ['error', 'unix'],
            'eol-last': ['error', 'always'],
            'no-trailing-spaces': 'error',
        },
    },
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
                ...globals.browser,
                ...globals.jasmine,
            },
        },
        plugins: {
            '@typescript-eslint': tsEslint.plugin,
            import: importPlugin,
            promise: promisePlugin,
        },
        rules: {
            'template-curly-spacing': ['error', 'never'],
            semi: ['error', 'always'],
            quotes: ['error', 'single', { avoidEscape: true }],
            indent: ['error', 4],
            'linebreak-style': ['error', 'unix'],
            'no-trailing-spaces': 'error',
            'eol-last': ['error', 'always'],
            'comma-dangle': ['error', 'always-multiline'],
            'no-console': ['warn', { allow: ['error', 'info'] }],
            'no-debugger': 'error',
            'prefer-const': 'error',
            'arrow-parens': ['error', 'always'],
            curly: ['error', 'all'],
            'no-var': 'error',
            'object-shorthand': ['error', 'always'],
            'prefer-template': 'error',
            'max-len': ['warn', { code: 120, ignoreComments: true }],
            'no-unused-vars': 'off',
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
    {
        files: ['*.component.ts'],
        languageOptions: {
            parser: tsEslint.parser,
            parserOptions: {
                project: './tsconfig.json',
            },
            globals: {
                ...globals.es2022,
                ...globals.browser,
            },
        },
        plugins: {
            '@typescript-eslint': tsEslint.plugin,
        },
        rules: {
            'no-unused-vars': 'off',
            '@typescript-eslint/no-unused-vars': 'off',
        }
    },
];
