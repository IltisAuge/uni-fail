module.exports = [
    {
        files: ['**/*.ts', '**/*.js'],
        languageOptions: {
            parser: require('@typescript-eslint/parser'),
            parserOptions: {
                project: './tsconfig.json',
                sourceType: 'module',
                ecmaVersion: 'latest',
            },
        },
        plugins: {
            '@typescript-eslint': require('@typescript-eslint/eslint-plugin'),
            'import': require('eslint-plugin-import'),
            'promise': require('eslint-plugin-promise')
        },
        rules: {
            "semi": ["error", "always"],
            "quotes": ["error", "single", { "avoidEscape": true }],
            "indent": ["error", 4, { "SwitchCase": 1 }],
            "linebreak-style": ["error", "windows"],
            "no-trailing-spaces": "error",
            "eol-last": ["error", "always"],
            "comma-dangle": ["error", "always-multiline"],
            "no-console": "warn",
            "no-debugger": "error",
            "prefer-const": "error",
            "arrow-parens": ["error", "always"],
            "curly": ["error", "all"],
            "no-var": "error",
            "object-shorthand": ["error", "always"],
            "prefer-template": "error",
            "max-len": ["warn", { "code": 120, "ignoreComments": true }],
            "@typescript-eslint/no-unused-vars": ["warn", { "argsIgnorePattern": "^_" }],
            "@typescript-eslint/explicit-function-return-type": "off",
            "@typescript-eslint/no-explicit-any": "warn",
            "@typescript-eslint/no-non-null-assertion": "off",
            "import/order": [
                "error",
                {
                    "groups": ["builtin", "external", "internal", "parent", "sibling", "index"],
                    "newlines-between": "never"
                }
            ],
            "promise/always-return": "error",
            "promise/catch-or-return": "error"
        }
    }
];
