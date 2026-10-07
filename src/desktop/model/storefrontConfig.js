export const DEFAULT_STOREFRONT = Object.freeze({
    title: 'Игры всех витрин',
    subtitle: 'PlayStation Турция, PlayStation Индия и Xbox в одном списке',
    allChipLabel: 'Все витрины',
    catalogTitle: 'Весь каталог',
    pageSubtitle: 'Подборки и скидки этой площадки',
    sorting: 'default',
    shelfSize: 6,
    heroSize: 3,
    steps: [
        {
            title: 'Выбираете игру и регион покупки',
            text: 'Мы показываем лучшую цену среди доступных региональных аккаунтов.'
        },
        {
            title: 'Оплачиваете свой заказ в рублях',
            text: 'Карта, СБП или оплата частями — без иностранных карт и комиссий банка.'
        },
        {
            title: 'Играете ≈ через 15 минут после покупки',
            text: 'Оформим бесплатно на новый аккаунт, если нет своего, выдадим код активации с пошаговой инструкцией. Просто, быстро, безопасно.'
        }
    ]
});

export const storefrontConfig = (settings) => ({
    ...DEFAULT_STOREFRONT,
    ...(settings?.desktopStorefront || null)
});
