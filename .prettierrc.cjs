module.exports = {
    plugins: ['@trivago/prettier-plugin-sort-imports'],
    importOrder: ['^react', 'styled-components', '^@/(.*)$', '^[./]'],
    semi: true,
    trailingComma: 'all',
    singleQuote: true,
    tabWidth: 4,
    useTabs: false,
    importOrderSortSpecifiers: true,
};
