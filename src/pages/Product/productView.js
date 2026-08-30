const EXCEL_EPOCH = Date.UTC(1899, 11, 30);
const DAY_MS = 24 * 60 * 60 * 1000;

const SUBSCRIPTION_BRANDS = {
    PS_PLUS: {catalogSuffix: 'psplus', brand: 'Ps', name: 'PS Plus', freeTitle: 'Бесплатно в PS Plus'},
    EA_ACCESS: {catalogSuffix: 'eaplay', brand: 'Ea', name: 'EA Play', freeTitle: 'Включено в EA Play'},
    EA_PLAY: {catalogSuffix: 'eaplay', brand: 'Ea', name: 'EA Play', freeTitle: 'Включено в EA Play'}
};

export const hasValue = (value) => {
    if (value === null || value === undefined) return false;
    if (typeof value === 'number') return !Number.isNaN(value);

    const text = String(value).trim().toLowerCase();
    return text !== '' && text !== 'null' && text !== 'none' && text !== 'undefined';
};

export const parseReleaseDate = (value) => {
    if (!hasValue(value)) return null;

    const direct = new Date(value);
    const serial = Number(value);

    if (!Number.isNaN(serial) && (Number.isNaN(direct.getTime()) || direct.getFullYear() < 1980)) {
        return new Date(EXCEL_EPOCH + serial * DAY_MS);
    }

    return Number.isNaN(direct.getTime()) ? null : direct;
};

export const releaseInfo = (product) => {
    const date = parseReleaseDate(product?.releaseDate);
    if (!date) return {date: null, isPreOrder: false, label: null};

    const isPreOrder = date.getTime() > Date.now();

    return {
        date,
        isPreOrder,
        label: isPreOrder ? date.toLocaleDateString('ru-RU') : 'Уже в продаже'
    };
};

export const promotionLabel = (product) => {
    const raw = product?.endDatePromotion;
    if (!hasValue(raw)) return null;

    const asNumber = Number(raw);
    const date = Number.isNaN(asNumber) ? new Date(raw) : new Date(asNumber);

    return Number.isNaN(date.getTime()) ? String(raw) : date.toLocaleDateString('ru-RU');
};

export const isRussianLanguage = (language) =>
    String(language || '').includes('Русск');

export const buildChips = (product) => {
    const chips = [];

    if (hasValue(product.platform)) {
        String(product.platform)
            .split(',')
            .map((item) => item.trim())
            .filter(Boolean)
            .forEach((item) => chips.push(item));
    }

    if (hasValue(product.numberPlayers)) {
        const players = String(product.numberPlayers).trim();
        chips.push(`${players} ${players.includes('-') ? 'игрока' : 'игрок'}`);
    }

    if (hasValue(product.language)) {
        chips.push(isRussianLanguage(product.language) ? 'Русский текст' : 'На английском');
    }

    (product.bubbles || []).filter(hasValue).forEach((bubble) => chips.push(String(bubble)));

    return chips;
};

export const buildSpecs = (product) => {
    const release = releaseInfo(product);

    return [
        {label: 'Регион активации', value: product.regionActivate},
        {label: 'Жанр', value: product.genre},
        {label: 'Язык в игре', value: product.language},
        {label: 'Издатель', value: product.publisherName},
        {label: 'Тип', value: product.typeLabel},
        {label: 'Дата выхода', value: release.label}
    ].filter((row) => hasValue(row.value));
};

export const eyebrow = (product) =>
    [product.typeLabel, product.publisherName].filter(hasValue).join(' · ');

export const descriptionLines = (description) =>
    String(description || '')
        .split(/<br\s*\/?>/i)
        .map((line) => line.trim())
        .filter(Boolean);

const words = (name) => String(name || '').trim().split(/\s+/).filter(Boolean);

export const editionLabels = (names) => {
    const parts = names.map(words);
    if (parts.length === 0) return [];

    const shortest = Math.min(...parts.map((item) => item.length));

    let common = 0;
    while (
        common < shortest - 1 &&
        parts.every((item) => item[common].toLowerCase() === parts[0][common].toLowerCase())
        ) {
        common += 1;
    }

    return parts.map((item) => item.slice(common).join(' ') || item.join(' '));
};

const numberOrNull = (value) => {
    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : null;
};

const isActiveOffer = (offer, now) =>
    Boolean(SUBSCRIPTION_BRANDS[offer?.branding]) && (!offer.endTime || offer.endTime > now);

const offerWeight = (offer) => {
    const rub = numberOrNull(offer.priceRub);
    if (rub !== null) return rub;

    const price = numberOrNull(offer.price);
    return price !== null ? price : Number.POSITIVE_INFINITY;
};

export const subscriptionOffer = (product) => {
    const offers = product?.subscriptionOffers;
    if (!Array.isArray(offers) || offers.length === 0) return null;

    const now = Date.now();
    const active = offers.filter((item) => isActiveOffer(item, now));
    if (active.length === 0) return null;

    const offer = active.reduce((best, item) => (offerWeight(item) < offerWeight(best) ? item : best));
    const meta = SUBSCRIPTION_BRANDS[offer.branding];

    const rub = numberOrNull(offer.priceRub);
    const price = numberOrNull(offer.price);
    const isFree = rub === 0 || (rub === null && price === 0);

    if (isFree) {
        return {
            title: meta.freeTitle,
            brand: meta.brand,
            note: null,
            catalogSuffix: meta.catalogSuffix
        };
    }

    const shopPrice = numberOrNull(product.price);
    if (rub !== null && shopPrice !== null && shopPrice > 0 && rub >= shopPrice) return null;

    const title = rub !== null && rub > 0
        ? `${rub.toLocaleString('ru-RU')} ₽ по подписке ${meta.name}`
        : `Дешевле по подписке ${meta.name}`;

    return {
        title,
        brand: meta.brand,
        note: hasValue(offer.discountText) ? String(offer.discountText).trim() : null,
        catalogSuffix: meta.catalogSuffix
    };
};

export const isPurchasable = (product) =>
    Boolean(product?.onSale) && Number(product?.price) > 0;

const BOT_APP_URL = 'https://t.me/gwstore_bot/app';

export const productLink = (product, isTg) => (isTg
    ? `${BOT_APP_URL}?startapp=${product.id}`
    : `${window.location.origin}?startapp=${product.id}`);

export const shareText = (product, specs, link) => {
    const lines = [`${product.name} — ${Number(product.price).toLocaleString('ru-RU')} ₽`];

    const until = promotionLabel(product);
    if (until && hasValue(product.oldPrice)) {
        lines.push(`скидка действует до ${until}`);
    }

    lines.push('');
    specs.forEach((row) => lines.push(`${row.label}: ${row.value}`));
    lines.push('', `Купить можно в приложении Геймворд — ${link}`);

    return lines.join('\n');
};
