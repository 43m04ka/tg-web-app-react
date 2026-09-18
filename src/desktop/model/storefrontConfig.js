export const DEFAULT_STOREFRONT = Object.freeze({
    title: 'Игры всех витрин',
    subtitle: 'PlayStation Турция, PlayStation Индия и Xbox в одном списке',
    allChipLabel: 'Все витрины',
    catalogTitle: 'Весь каталог',
    pageSubtitle: 'Подборки и скидки этой площадки',
    sorting: 'default',
    shelfSize: 6,
    heroSize: 3
});

export const storefrontConfig = (settings) => ({
    ...DEFAULT_STOREFRONT,
    ...(settings?.desktopStorefront || null)
});
