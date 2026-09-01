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

export const UNGROUPED = '';

export const groupsOf = (brand, kind, regionName) => uniqueBy(
    (brand?.offers || []).filter((offer) => offer.kind === kind && offer.regionName === regionName),
    (offer) => offer.groupName || UNGROUPED
).map((offer) => ({
    key: offer.groupName || UNGROUPED,
    name: offer.groupName || 'Остальное'
}));

export const offersOf = (brand, kind, regionName, groupKey) => (brand?.offers || [])
    .filter((offer) => offer.kind === kind && offer.regionName === regionName)
    .filter((offer) => (groupKey === null || groupKey === undefined
        ? true
        : (offer.groupName || UNGROUPED) === groupKey));

export const isManual = (offer) => offer?.fulfillment === 'manual';

export const isSellable = (offer) => {
    if (!offer) return false;
    if (isManual(offer)) return true;

    return Number(offer.stock) > 0;
};

export const stockLabel = (offer) => {
    if (isManual(offer)) return 'Оформит менеджер';

    const count = Number(offer?.stock) || 0;
    if (count <= 0) return 'Нет в наличии';
    if (count <= 3) return `Осталось ${count}`;

    return 'В наличии';
};

export const groupLabelOf = (brand) => brand?.groupLabel || 'Тариф';

export const denomLabelOf = (kind) => (kind === 'subscription' ? 'Период' : 'Номинал');

export const priceNoteOf = (kind) => (kind === 'subscription' ? 'Цена за подписку' : 'Цены за 1 код');

export const BRAND_FALLBACKS = ['#4C8DFF', '#A265FF', '#28B67A', '#FF9A3D', '#FF5470'];

const HEX = /^#?([\da-f]{3}|[\da-f]{6})$/i;

const SCREEN_LUMINANCE = 0.0135;
const LIGHT_EDGE = 0.3;
const READABLE = 4.2;
const INK_LIGHT = '#ffffff';
const INK_DARK = '#111419';

const clamp = (value, low, high) => Math.min(high, Math.max(low, value));

const readHex = (value) => {
    const found = HEX.exec(String(value ?? '').trim());
    if (!found) return null;

    const digits = found[1].length === 3
        ? found[1].replace(/./g, (char) => char + char)
        : found[1];

    return [0, 2, 4].map((at) => parseInt(digits.slice(at, at + 2), 16) / 255);
};

const toLinear = (part) => (part <= 0.04045 ? part / 12.92 : Math.pow((part + 0.055) / 1.055, 2.4));

const luminanceOf = ([red, green, blue]) => 0.2126 * toLinear(red)
    + 0.7152 * toLinear(green)
    + 0.0722 * toLinear(blue);

const contrast = (one, two) => (Math.max(one, two) + 0.05) / (Math.min(one, two) + 0.05);

const toHsl = ([red, green, blue]) => {
    const top = Math.max(red, green, blue);
    const low = Math.min(red, green, blue);
    const span = top - low;
    const light = (top + low) / 2;

    if (!span) return [0, 0, light];

    const sat = span / (1 - Math.abs(2 * light - 1));
    const hue = top === red
        ? ((green - blue) / span) % 6
        : top === green
            ? (blue - red) / span + 2
            : (red - green) / span + 4;

    return [(hue * 60 + 360) % 360, sat, light];
};

const fromHsl = ([hue, sat, light]) => {
    const chroma = (1 - Math.abs(2 * light - 1)) * sat;
    const mid = chroma * (1 - Math.abs(((hue / 60) % 2) - 1));
    const lift = light - chroma / 2;
    const wheel = [
        [chroma, mid, 0], [mid, chroma, 0], [0, chroma, mid],
        [0, mid, chroma], [mid, 0, chroma], [chroma, 0, mid]
    ];

    return wheel[Math.floor(hue / 60) % 6].map((part) => clamp(part + lift, 0, 1));
};

const relight = (hsl, light) => fromHsl([hsl[0], hsl[1], clamp(light, 0.03, 0.97)]);

const toCss = (rgb) => `#${rgb.map((part) => Math.round(part * 255).toString(16).padStart(2, '0')).join('')}`;

const toRgba = (rgb, alpha) => `rgba(${rgb.map((part) => Math.round(part * 255)).join(', ')}, ${alpha})`;

const liftForScreen = (rgb, hsl) => {
    let light = hsl[2];
    let lifted = rgb;

    while (contrast(luminanceOf(lifted), SCREEN_LUMINANCE) < READABLE && light < 0.94) {
        light += 0.02;
        lifted = relight(hsl, light);
    }

    return lifted;
};

const holdSide = (hsl, light, isLight) => {
    let level = clamp(light, 0.06, 0.95);
    let shifted = relight(hsl, level);

    while (isLight && luminanceOf(shifted) < LIGHT_EDGE + 0.04 && level < 0.95) {
        level += 0.02;
        shifted = relight(hsl, level);
    }

    while (!isLight && luminanceOf(shifted) > LIGHT_EDGE - 0.04 && level > 0.06) {
        level -= 0.02;
        shifted = relight(hsl, level);
    }

    return shifted;
};

export const themeOf = (brand, index) => {
    const source = readHex(brand?.accent)
        || readHex(BRAND_FALLBACKS[index % BRAND_FALLBACKS.length]);
    const hsl = toHsl(source);
    const isLight = luminanceOf(source) > LIGHT_EDGE;
    const darker = hsl[2] - (isLight ? 0.14 : 0.17);
    const keepsSide = !isLight || luminanceOf(relight(hsl, darker)) > LIGHT_EDGE + 0.04;
    const edge = holdSide(hsl, keepsSide ? darker : hsl[2] + 0.14, isLight);
    const text = liftForScreen(source, hsl);

    return {
        base: toCss(source),
        edge: toCss(edge),
        ink: isLight ? INK_DARK : INK_LIGHT,
        text: toCss(text),
        ring: toRgba(text, 0.55),
        glow: toRgba(source, 0.5),
        isLight
    };
};

export const themeVars = (theme) => ({
    '--svc': theme.base,
    '--svc-edge': theme.edge,
    '--svc-ink': theme.ink,
    '--svc-text': theme.text,
    '--svc-ring': theme.ring,
    '--svc-glow': theme.glow
});

const codeFaq = (brand, regionName) => {
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

const manualFaq = (brand, regionName) => {
    const name = brand?.name || 'сервиса';
    const where = regionName ? ` региона ${regionName}` : '';

    return [
        {
            question: 'Как проходит оформление?',
            answer: `Кода здесь нет: ${(brand?.deliveryNote || 'подписку оформляет менеджер').toLowerCase()}.`
                + ' Сразу после оплаты он получает заказ и пишет вам в этот же чат, чтобы уточнить детали'
                + ' и включить подписку. Чек уходит на указанную почту.'
        },
        {
            question: 'Сколько ждать?',
            answer: 'В рабочее время обычно до часа. Если оплата прошла ночью, менеджер ответит утром —'
                + ' заказ никуда не денется и оплата закреплена за вами.'
        },
        {
            question: 'Что нужно от меня?',
            answer: `Аккаунт ${name}${where}. ` + (brand?.activationNote
                ? `Активация: ${brand.activationNote}.`
                : 'Менеджер подскажет, что понадобится, когда напишет.')
        },
        {
            question: 'Что если оплата не прошла?',
            answer: 'Деньги не спишутся: неоплаченный счёт закрывается сам. Заказ можно оформить заново.'
        },
        {
            question: 'Что-то пошло не так — куда писать?',
            answer: 'Напишите в поддержку и укажите номер заказа. Разберёмся и доведём оформление до конца.'
        }
    ];
};

export const servicesFaq = (brand, regionName, offer) => (isManual(offer)
    ? manualFaq(brand, regionName)
    : codeFaq(brand, regionName));
