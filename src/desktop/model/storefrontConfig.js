export const DEFAULT_STOREFRONT = Object.freeze({
    title: 'Игры всех витрин',
    subtitle: 'Каталоги PlayStation, Xbox и Steam в одном списке',
    sorting: 'discount',
    allChipLabel: 'Все витрины'
});

export const storefrontConfig = (settings) => ({
    ...DEFAULT_STOREFRONT,
    ...(settings?.desktopStorefront || null)
});
