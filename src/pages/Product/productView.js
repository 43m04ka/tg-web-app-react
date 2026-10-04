import {discountPercent, isSubscription} from '../Main/catalogSections';
import {membershipPlaque} from '../../shared/lib/membership';

const EXCEL_EPOCH = Date.UTC(1899, 11, 30);
const DAY_MS = 24 * 60 * 60 * 1000;

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

export const promotionEnd = (product) => {
    const raw = product?.endDatePromotion;
    if (!hasValue(raw)) return null;

    const asNumber = Number(raw);
    const date = Number.isNaN(asNumber) ? new Date(raw) : new Date(asNumber);

    return Number.isNaN(date.getTime()) ? null : date;
};

export const promotionLabel = (product) => {
    const raw = product?.endDatePromotion;
    if (!hasValue(raw)) return null;

    const date = promotionEnd(product);

    return date ? date.toLocaleDateString('ru-RU') : String(raw);
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
        {label: 'Срок подписки', value: isSubscription(product) ? product.choiceRow : null},
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

export const subscriptionOffer = (product) => membershipPlaque(product);

export const isPurchasable = (product) =>
    Boolean(product?.onSale) && Number(product?.price) > 0;

const BOT_APP_URL = 'https://t.me/gwstore_bot/app';

export const productLink = (product, isTg) => (isTg
    ? `${BOT_APP_URL}?startapp=${product.id}`
    : `${window.location.origin}/card/${product.id}`);

export const shareText = (product, specs, link) => {
    const price = Number(product.price);
    const lines = [price > 0 ? `${product.name} — ${price.toLocaleString('ru-RU')} ₽` : product.name];

    const percent = discountPercent(product.price, product.oldPrice);
    if (percent > 0) {
        const until = promotionLabel(product);
        lines.push(until ? `Скидка −${percent}% до ${until}` : `Скидка −${percent}%`);
    }

    lines.push('');
    specs.forEach((row) => lines.push(`${row.label}: ${row.value}`));
    lines.push('', `Купить можно в приложении Геймворд — ${link}`);

    return lines.join('\n');
};
