export const KIND_LABELS = {
    gift_card: 'Подарочная карта',
    subscription: 'Подписка'
};

export const kindLabel = (kind) => KIND_LABELS[kind] || 'Код';

export const uniqueBy = (list, pick) => {
    const seen = new Set();
    const result = [];

    (list || []).forEach((item) => {
        const key = pick(item);
        if (key === null || key === undefined || seen.has(key)) return;
        seen.add(key);
        result.push(item);
    });

    return result;
};

export const kindsOf = (brand) => uniqueBy(brand?.offers || [], (offer) => offer.kind)
    .map((offer) => offer.kind);

export const regionsOf = (brand, kind) => uniqueBy(
    (brand?.offers || []).filter((offer) => offer.kind === kind),
    (offer) => offer.regionName
).map((offer) => ({name: offer.regionName, flag: offer.regionFlag, icon: offer.regionIcon}));

export const offersOf = (brand, kind, regionName) => (brand?.offers || [])
    .filter((offer) => offer.kind === kind && offer.regionName === regionName);

export const stockLabel = (stock) => {
    const count = Number(stock) || 0;
    if (count <= 0) return 'Нет в наличии';
    if (count <= 3) return `Осталось ${count}`;

    return 'В наличии';
};

export const BRAND_TONES = [
    {from: 'oklch(0.56 0.17 250)', to: 'oklch(0.28 0.07 255)', ring: 'oklch(0.72 0.17 250 / 0.55)'},
    {from: 'oklch(0.56 0.18 300)', to: 'oklch(0.28 0.07 295)', ring: 'oklch(0.74 0.18 300 / 0.55)'},
    {from: 'oklch(0.58 0.18 148)', to: 'oklch(0.28 0.07 158)', ring: 'oklch(0.74 0.18 148 / 0.55)'},
    {from: 'oklch(0.62 0.17 40)', to: 'oklch(0.3 0.07 40)', ring: 'oklch(0.76 0.17 40 / 0.55)'},
    {from: 'oklch(0.58 0.19 15)', to: 'oklch(0.28 0.08 15)', ring: 'oklch(0.74 0.2 15 / 0.55)'}
];

export const toneOf = (brand, index) => {
    if (brand?.accent) {
        return {
            from: brand.accent,
            to: `color-mix(in oklch, ${brand.accent} 34%, oklch(0.22 0.02 264))`,
            ring: `color-mix(in oklch, ${brand.accent} 62%, transparent)`
        };
    }

    return BRAND_TONES[index % BRAND_TONES.length];
};

export const servicesFaq = (brand, regionName) => {
    const name = brand?.name || 'сервиса';
    const where = regionName ? ` с регионом ${regionName}` : '';

    return [
        {
            question: 'Куда придёт код?',
            answer: 'Сразу после оплаты код придёт сообщением в чат бота, а копия вместе с чеком — на указанную почту.'
                + ' Код закрепляется за вами ещё до оплаты, так что другому покупателю он не достанется.'
        },
        {
            question: 'Как активировать?',
            answer: `Код активируется в аккаунте ${name}${where}: откройте пополнение баланса или ввод кода в самом сервисе и вставьте выданную комбинацию. `
                + (brand?.activationNote || 'VPN для активации не нужен.')
        },
        {
            question: 'Как быстро придёт код?',
            answer: 'Мгновенно: сервер отдаёт свободный код со склада сразу, как подтвердится оплата. Ждать ответа оператора не нужно.'
        },
        {
            question: 'Что если оплата не прошла?',
            answer: 'Деньги не спишутся: неоплаченный счёт закрывается сам, а забронированный код возвращается на склад. Заказ можно оформить заново.'
        },
        {
            question: 'Код не подошёл — что делать?',
            answer: 'Напишите в поддержку и укажите номер заказа. Если код оказался нерабочим, мы заменим его на другой.'
        }
    ];
};
