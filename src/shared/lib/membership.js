const BRANDS = {
    PS_PLUS: {key: 'psplus', style: 'Ps', name: 'PS Plus', catalogSuffix: 'psplus'},
    EA_ACCESS: {key: 'eaplay', style: 'Ea', name: 'EA Play', catalogSuffix: 'eaplay'},
    EA_PLAY: {key: 'eaplay', style: 'Ea', name: 'EA Play', catalogSuffix: 'eaplay'},
    GTA_PLUS: {key: 'gtaplus', style: 'Gta', name: 'GTA+', catalogSuffix: 'gtaplus'}
};

const KIND_ORDER = {included: 0, discount: 1, trial: 2};
const TIER_RE = /\b(Essential|Extra|Deluxe|Premium)\b/i;
const HOURS_RE = /(\d+)[\s-]*hour/i;
const PERCENT_RE = /(\d+)\s*%/;

const MONTHS = ['января', 'февраля', 'марта', 'апреля', 'мая', 'июня', 'июля', 'августа', 'сентября', 'октября', 'ноября', 'декабря'];

const numberOrNull = (value) => {
    if (value === null || value === undefined || value === '') return null;
    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : null;
};

const text = (value) => String(value ?? '').trim();

export const offerKind = (offer) => {
    const kind = text(offer?.kind).toUpperCase();
    const price = numberOrNull(offer?.price);
    const base = numberOrNull(offer?.basePrice);

    if (kind.includes('TRIAL')) return 'trial';
    if (kind.includes('DISCOUNT')) return 'discount';

    if (kind === 'LISTING_UPSELL') {
        return /save|%/i.test(text(offer?.tier)) ? 'discount' : 'included';
    }

    if (kind.includes('FREE') || kind.includes('GAME_CATALOG') || kind.includes('CLASSIC') || price === 0) {
        return 'included';
    }

    if (price !== null && base !== null && price < base) return 'discount';
    return null;
};

const tierOf = (offer) => {
    const kind = text(offer?.kind).toUpperCase();
    const found = text(offer?.tier).match(TIER_RE)?.[1];
    const tier = found ? found[0].toUpperCase() + found.slice(1).toLowerCase() : null;

    if (tier === 'Premium') return 'Deluxe';
    if (tier) return tier;
    if (kind.includes('PS_PLUS_FREE')) return 'monthly';
    if (kind.includes('GAME_CATALOG')) return 'Extra';
    if (kind.includes('CLASSIC') || kind.includes('TRIAL')) return 'Deluxe';
    return null;
};

const percentOf = (offer) => {
    const fromText = text(offer?.discountText).match(PERCENT_RE)?.[1] || text(offer?.tier).match(PERCENT_RE)?.[1];
    if (fromText) return Number(fromText);

    const price = numberOrNull(offer?.price);
    const base = numberOrNull(offer?.basePrice);
    if (price !== null && base && price < base) return Math.round((1 - price / base) * 100);
    return null;
};

export const formatDay = (value) => {
    const date = new Date(typeof value === 'number' ? value : String(value));
    if (Number.isNaN(date.getTime())) return null;
    return `${date.getDate()} ${MONTHS[date.getMonth()]}`;
};

export const membershipOffers = (product, now = Date.now()) => {
    const offers = Array.isArray(product?.subscriptionOffers) ? product.subscriptionOffers : [];
    const result = [];
    const seen = new Set();

    for (const offer of offers) {
        const brand = BRANDS[offer?.branding];
        const kind = brand ? offerKind(offer) : null;
        if (!brand || !kind) continue;

        const endTime = numberOrNull(offer.endTime);
        if (endTime && endTime <= now) continue;

        const key = `${brand.key}:${kind}`;
        if (seen.has(key)) continue;
        seen.add(key);

        result.push({
            brand,
            kind,
            tier: tierOf(offer),
            percent: kind === 'discount' ? percentOf(offer) : null,
            hours: kind === 'trial' ? Number(text(offer.tier).match(HOURS_RE)?.[1]) || null : null,
            priceRub: numberOrNull(offer.priceRub),
            until: endTime
        });
    }

    return result.sort((a, b) => KIND_ORDER[a.kind] - KIND_ORDER[b.kind]);
};

export const membershipBadge = (product) => {
    const offer = membershipOffers(product).find((item) => item.kind !== 'trial');
    if (!offer) return null;

    if (offer.kind === 'included') {
        return {brand: offer.brand.key, kind: 'included', label: `в ${offer.brand.name}`};
    }

    return {
        brand: offer.brand.key,
        kind: 'discount',
        label: offer.percent ? `−${offer.percent}% ${offer.brand.name}` : `скидка ${offer.brand.name}`
    };
};

const tierPhrase = (offer) => {
    if (offer.brand.key !== 'psplus') return offer.brand.name;
    if (offer.tier === 'Extra') return 'PS Plus Extra и Deluxe';
    if (offer.tier === 'Deluxe') return 'PS Plus Deluxe';
    return 'PS Plus';
};

const hoursLabel = (hours) => {
    const tail = hours % 10 === 1 && hours % 100 !== 11 ? 'час'
        : [2, 3, 4].includes(hours % 10) && ![12, 13, 14].includes(hours % 100) ? 'часа' : 'часов';
    return `${hours} ${tail}`;
};

const describe = (offer) => {
    if (offer.kind === 'included') {
        if (offer.tier === 'monthly') {
            const until = offer.until ? formatDay(offer.until) : null;
            return {
                title: 'Бесплатно в PS Plus',
                note: until ? `Игра месяца — заберите до ${until}, любой уровень` : 'Игра месяца для любого уровня подписки'
            };
        }
        return {
            title: `Входит в ${tierPhrase(offer)}`,
            note: offer.brand.key === 'psplus' ? 'Играйте без покупки, пока действует подписка' : 'Играйте без покупки по подписке'
        };
    }

    if (offer.kind === 'discount') {
        return {
            title: offer.percent ? `Скидка ${offer.percent}% по подписке ${offer.brand.name}` : `Дешевле по подписке ${offer.brand.name}`,
            note: offer.priceRub && offer.priceRub > 0 ? null : 'Скидка для подписчиков'
        };
    }

    return {
        title: `Пробная версия в ${tierPhrase(offer)}`,
        note: offer.hours ? `${hoursLabel(offer.hours)} полной игры бесплатно` : 'Попробуйте игру до покупки'
    };
};

const shortExtra = (offer) => {
    if (offer.kind === 'included') return `входит в ${tierPhrase(offer)}`;
    if (offer.kind === 'discount') return `скидка${offer.percent ? ` ${offer.percent}%` : ''} с ${offer.brand.name}`;
    return `пробная версия${offer.hours ? ` ${hoursLabel(offer.hours)}` : ''} в ${tierPhrase(offer)}`;
};

export const membershipPlaque = (product, now = Date.now()) => {
    const offers = membershipOffers(product, now);
    if (!offers.length) return null;

    const [main, ...rest] = offers;
    const shopPrice = numberOrNull(product?.price);
    if (main.kind === 'discount' && main.priceRub && shopPrice && main.priceRub >= shopPrice && !rest.length) return null;

    const {title, note} = describe(main);
    const extra = rest.filter((item) => item.brand.key !== main.brand.key || item.kind !== main.kind).map(shortExtra);

    return {
        title,
        note: extra.length ? [note, `Также: ${extra.join(', ')}`].filter(Boolean).join('. ') : note,
        brand: main.brand.style,
        catalogSuffix: main.brand.catalogSuffix
    };
};

export const memberPrice = (product, now = Date.now()) => {
    const shopPrice = numberOrNull(product?.price);
    const offer = membershipOffers(product, now)
        .find((item) => item.kind === 'discount' && item.priceRub > 0 && (!shopPrice || item.priceRub < shopPrice));

    return offer
        ? {value: offer.priceRub, brand: offer.brand.key, name: offer.brand.name, label: `с ${offer.brand.name}`}
        : null;
};
