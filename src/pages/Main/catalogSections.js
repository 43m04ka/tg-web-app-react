const CATALOG_TYPES = ['ordinary', 'ordinary-choice'];

// Путь блока исторически хранится то голым, то со старым префиксом роута.
// Каталоги при этом лежат под голым путём, поэтому префикс срезаем.
export const cleanPath = (path) =>
    String(path || '').replace('/catalog/', '').replace('/choice-catalog/', '');

export const isCatalogBlock = (block) => CATALOG_TYPES.includes(block.type);

export const isBannerBlock = (block) => String(block.type || '').includes('banner');

export const buildSections = ({structureBlocks, catalogs, mainPageProducts, pageId}) => {
    if (!Array.isArray(structureBlocks)) return null;

    const catalogByPath = new Map((catalogs || []).map((catalog) => [catalog.path, catalog.id]));

    const productsByCatalog = new Map();
    (mainPageProducts || []).forEach((product) => {
        const list = productsByCatalog.get(product.catalogId);
        if (list) list.push(product);
        else productsByCatalog.set(product.catalogId, [product]);
    });

    return structureBlocks
        .filter((block) => block.structurePageId === pageId && block.group === 'body')
        .sort((a, b) => (a.serialNumber ?? 0) - (b.serialNumber ?? 0))
        .map((block) => {
            if (!isCatalogBlock(block)) return {block, products: []};

            const path = cleanPath(block.path);
            const catalogId = catalogByPath.get(path);

            return {
                block,
                path,
                products: catalogId === undefined ? [] : (productsByCatalog.get(catalogId) || [])
            };
        })
        // Блок каталога без единого товара — это пустая полка с кнопкой в никуда.
        // Баннеры оставляем: им товары и не нужны.
        .filter((section) => isBannerBlock(section.block) || section.products.length > 0);
};

export const discountPercent = (price, oldPrice) => {
    const now = Number(price);
    const before = Number(oldPrice);
    if (!Number.isFinite(now) || !Number.isFinite(before) || before <= now || before <= 0) return 0;
    return Math.round((1 - now / before) * 100);
};

export const formatPrice = (value) => {
    const number = Number(value);
    if (!Number.isFinite(number) || value === null || value === '') return '';
    return `${number.toLocaleString('ru-RU')} ₽`;
};

export const platformList = (platform) => String(platform || '')
    .split(/[,/]/)
    .map((item) => item.trim())
    .filter(Boolean);

export const shortPlatform = (platform) => platformList(platform)[0] || '';

const TERM_PATTERNS = [
    {re: /(\d+)\s*(?:мес(?:\.|яц\w*)?|month?s?|mo)/i, unit: 'мес.'},
    {re: /(\d+)\s*(?:год|года|лет|year?s?|yr)/i, unit: 'г.'},
    {re: /(\d+)\s*(?:дн(?:я|ей)?|день|day?s?)/i, unit: 'дн.'}
];

export const isSubscription = (product) =>
    String(product?.type || '').toUpperCase() === 'SUBSCRIPTION';

export const subscriptionTerm = (product) => {
    if (!isSubscription(product)) return '';

    const sources = [product?.choiceRow, product?.choiceColumn, product?.name];

    for (const source of sources) {
        const text = String(source || '').trim();
        if (!text) continue;

        for (const {re, unit} of TERM_PATTERNS) {
            const match = text.match(re);
            if (match) return `${match[1]} ${unit}`;
        }

        if (source === product?.choiceRow && text.length <= 12) return text;
    }

    return '';
};
