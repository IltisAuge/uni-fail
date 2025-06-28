/** @type {import('stylelint').Config} */
export default {
    extends: 'stylelint-config-standard',
    plugins: ['@stylistic/stylelint-plugin'],
    rules: {
        '@stylistic/indentation': 4,
        '@stylistic/string-quotes': 'single',
        'property-no-vendor-prefix': null,
        'selector-class-pattern': null,
        'declaration-empty-line-before': null,
        'no-empty-source': null,
        'custom-property-empty-line-before': null,
        'alpha-value-notation': null,
    },
};
