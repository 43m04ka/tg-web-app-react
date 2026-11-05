import {buildChips, buildSpecs, hasValue, localizeFeature, parseReleaseDate} from '../../../pages/Product/productView';

const clean = (value) => hasValue(value) ? String(value).trim() : null;

export const gameCriteria = (product) => {
    const bubbles = (product.bubbles || []).filter(hasValue).map(localizeFeature);
    const size = clean(product.gameSize || product.sizeGame || product.downloadSize)
        || bubbles.find((text) => /^(?:≈\s*)?\d+(?:[.,]\d+)?\s*(?:ГБ|МБ|ТБ|GB|MB|TB)$/i.test(text));
    const online = bubbles.find((text) => /(?:до\s*\d+.*(?:в сети|по сети|онлайн)|(?:в сети|онлайн).*\d+)/i.test(text));
    const onlineCount = online?.match(/(?:до\s*|игроков\s*[:：]\s*)(\d+)|(?:в сети|онлайн)\s*[:：]?\s*(\d+)/i);
    const onlineLabel = onlineCount ? `онлайн до ${onlineCount[1] || onlineCount[2]}` : online;
    return [
        {label: 'Количество игроков', value: [clean(product.numberPlayers), onlineLabel].filter(Boolean).join(' · ') || null, icon: 'players'},
        {label: 'Размер игры', value: size || null, icon: 'storage'},
        {label: 'Платформа', value: clean(product.platform)?.replace(/\bPS\s*([45])\b/gi, 'PlayStation $1') || null, icon: 'controller'},
        {label: 'Наличие русского языка', value: clean(product.language), icon: 'language', russian: /русск/i.test(product.language || '')}
    ];
};

export const fullGameSpecs = (product) => {
    const criteria = gameCriteria(product);
    const rows = [...buildSpecs(product), ...criteria.filter((item) => item.label !== 'Наличие русского языка' && item.value)];
    const release = parseReleaseDate(product.releaseDate);
    if (release) rows.find((item) => item.label === 'Дата выхода').value = release.toLocaleDateString('ru-RU', {day: 'numeric', month: 'long', year: 'numeric'});
    const average = Number(product.starRating?.averageRating);
    const count = Number(product.starRating?.totalRatingsCount);
    const rating = average > 0 && count > 0 ? `${average.toLocaleString('ru-RU')} ★ · ${count.toLocaleString('ru-RU')} оценок` : null;
    if (rating) rows.push({label: 'Рейтинг в магазине', value: rating, icon: 'trophy'});
    const known = new Set([...criteria.map((item) => item.value), ...rows.map((item) => item.value)]);
    const extras = [...new Set(buildChips(product).slice(String(product.platform || '').split(',').filter(Boolean).length))]
        .filter((text) => !known.has(text) && !/^\d+(?:[-–]\d+)? игрок/i.test(text)
            && !/^(Русский текст|На английском)$/i.test(text));
    if (extras.length) rows.push({label: 'Возможности игры', value: extras.join(' · '), icon: 'controller'});
    return rows;
};

export const relatedPurchases = (product, originOf) => {
    if (!product) return [];
    const current = originOf(product);
    const seen = new Set([Number(product.id)]);
    return [...(product.conceptProducts || []), ...(product.conceptAddOns || [])].filter((item) => {
        if (!item?.id || seen.has(Number(item.id)) || item.isHidden || item.onSale === false || Number(item.price) <= 0) return false;
        const origin = originOf(item);
        if (current && origin && current.pageId !== origin.pageId) return false;
        if (current && !origin && item.catalogId !== product.catalogId) return false;
        const platforms = String(product.platform || '').split(',').map((value) => value.trim().toLowerCase()).filter(Boolean);
        const candidate = String(item.platform || '').split(',').map((value) => value.trim().toLowerCase()).filter(Boolean);
        if (platforms.length && candidate.length && !candidate.some((value) => platforms.includes(value))) return false;
        seen.add(Number(item.id));
        return true;
    });
};
