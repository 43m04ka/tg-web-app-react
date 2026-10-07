import {cleanPath, isCatalogBlock} from '../../pages/Main/catalogSections';

const FAMILIES = {
    ps: 'ps',
    ps_india: 'ps',
    xbox: 'xbox',
    steam: 'steam',
    services: 'services'
};

export const familyOf = (pageType) => FAMILIES[pageType] || String(pageType || 'other');

const normalize = (text) => String(text || '').trim().toLowerCase().replace(/\s+/g, ' ');

const priceOf = (product) => {
    const price = Number(product?.price);
    return Number.isFinite(price) && price > 0 ? price : null;
};

export const offerKey = (product, family) => [
    family,
    normalize(product?.name),
    normalize(product?.choiceRow),
    normalize(product?.choiceColumn)
].join('|');

export const mergeOffers = (products, originOf) => {
    const offers = new Map();

    (products || []).forEach((product) => {
        if (!product) return;

        const origin = originOf?.(product) || null;
        const key = offerKey(product, familyOf(origin?.type));
        const price = priceOf(product);
        const current = offers.get(key);

        if (!current) {
            offers.set(key, {
                key,
                product,
                price,
                oldPrice: product.oldPrice ?? null,
                origins: origin ? [{...origin, price, product}] : []
            });
            return;
        }

        if (origin && !current.origins.some((item) => item.pageId === origin.pageId)) {
            current.origins.push({...origin, price, product});
        }

        if (price !== null && (current.price === null || price < current.price)) {
            current.product = product;
            current.price = price;
            current.oldPrice = product.oldPrice ?? null;
        }
    });

    return [...offers.values()].map((offer) => ({
        ...offer,
        origins: [...offer.origins].sort((a, b) => (a.price ?? Infinity) - (b.price ?? Infinity))
    }));
};

export const buildShelves = ({
    structureBlocks,
    catalogs,
    mainPageProducts,
    originOf,
    pageIds,
    scopeId = null,
    mainPageId = null
} = {}) => {
    if (!Array.isArray(structureBlocks) || !Array.isArray(catalogs)) return null;

    const catalogByPath = new Map(catalogs.map((catalog) => [catalog.path, catalog]));
    const storefronts = new Set(pageIds || []);

    const useMain = scopeId === null && mainPageId !== null && structureBlocks.some((block) =>
        block.structurePageId === mainPageId && block.group === 'body' && isCatalogBlock(block)
        && storefronts.has(catalogByPath.get(cleanPath(block.path))?.structurePageId));

    const allowed = new Set(useMain ? [mainPageId] : (scopeId === null ? (pageIds || []) : [scopeId]));

    const productsByCatalog = new Map();
    (mainPageProducts || []).forEach((product) => {
        const list = productsByCatalog.get(product.catalogId);
        if (list) list.push(product);
        else productsByCatalog.set(product.catalogId, [product]);
    });

    const groups = new Map();

    structureBlocks
        .filter((block) => block.group === 'body' && isCatalogBlock(block))
        .filter((block) => allowed.has(block.structurePageId))
        .forEach((block) => {
            const title = String(block.name || '').trim();
            if (!title) return;

            const catalog = catalogByPath.get(cleanPath(block.path));
            if (!catalog) return;
            if (useMain && !storefronts.has(catalog.structurePageId)) return;

            const catalogId = catalog.id;
            const pageId = useMain ? catalog.structurePageId : block.structurePageId;

            const key = normalize(title);
            const order = block.serialNumber ?? 0;

            if (!groups.has(key)) {
                groups.set(key, {key, title, icon: block.icon || null, order, pages: [], products: []});
            }

            const group = groups.get(key);
            group.order = Math.min(group.order, order);
            if (!group.icon && block.icon) group.icon = block.icon;
            group.pages.push({pageId, path: cleanPath(block.path), type: block.type});
            group.products.push(...(productsByCatalog.get(catalogId) || []));
        });

    return [...groups.values()]
        .map((group) => ({...group, offers: mergeOffers(group.products, originOf)}))
        .filter((group) => group.offers.length > 0)
        .sort((a, b) => a.order - b.order || a.title.localeCompare(b.title, 'ru'));
};

const text = (value) => String(value ?? '').trim();

export const heroItem = (banner, {originOf, productById, originByPage} = {}) => {
    const data = banner?.data || {};
    const override = data.override || {};

    const title = text(override.title) || text(data.title);
    const image = text(override.image) || text(data.image);
    if (!title && !image) return null;

    const productId = data.productId ?? null;
    const product = productId === null ? null : (productById?.get(String(productId)) || null);
    const origin = (product ? originOf?.(product) : null) || originByPage?.get(banner.pageId) || null;

    return {
        id: banner.id,
        pageId: banner.pageId,
        origin,
        title,
        subtitle: text(data.subtitle),
        note: text(data.note),
        image,
        imageFit: text(override.imageFit) || text(data.imageFit) || 'banner',
        price: data.price ?? null,
        oldPrice: data.oldPrice ?? null,
        promoEndDate: data.promoEndDate || null,
        productId,
        product,
        url: text(data.url),
        slot: data.slot === 'side' ? 'side' : 'main',
        gradient: text(data.gradient),
        buttons: (Array.isArray(data.buttons) ? data.buttons : [])
            .map((button) => ({label: text(button?.label), url: text(button?.url)}))
            .filter((button) => button.label)
            .slice(0, 2)
    };
};

export const buildHero = ({
    banners,
    mainPageProducts,
    originOf,
    originByPage,
    pageIds,
    scopeId = null,
    mainPageId = null,
    limit = 3
} = {}) => {
    if (!Array.isArray(banners)) return [];

    const useMain = scopeId === null && mainPageId !== null
        && banners.some((banner) => banner.type === 'product' && banner.pageId === mainPageId);

    const allowed = new Set(useMain ? [mainPageId] : (scopeId === null ? (pageIds || []) : [scopeId]));
    const productById = new Map((mainPageProducts || []).map((product) => [String(product.id), product]));

    const picked = [];
    const usedPages = new Set();
    const usedOffers = new Set();

    const candidates = [...banners]
        .filter((banner) => banner.type === 'product' && allowed.has(banner.pageId))
        .sort((a, b) => (a.serialNumber ?? 0) - (b.serialNumber ?? 0));

    const take = (banner) => {
        const item = heroItem(banner, {originOf, productById, originByPage});
        if (!item) return;

        const key = [familyOf(item.origin?.type), normalize(item.title)].join('|');
        if (usedOffers.has(key)) return;

        picked.push(item);
        usedOffers.add(key);
        usedPages.add(banner.pageId);
    };

    candidates.forEach((banner) => {
        if (picked.length >= limit || usedPages.has(banner.pageId)) return;
        take(banner);
    });

    candidates.forEach((banner) => {
        if (picked.length >= limit) return;
        if (picked.some((item) => item.id === banner.id)) return;
        take(banner);
    });

    return picked;
};

export const SIDE_BANNERS = 2;

export const splitHero = (items) => {
    const list = items || [];
    const side = list.filter((item) => item.slot === 'side').slice(0, SIDE_BANNERS);
    const main = list.filter((item) => item.slot !== 'side');

    if (side.length || main.length <= SIDE_BANNERS) return {main, side};

    return {main: main.slice(0, -SIDE_BANNERS), side: main.slice(-SIDE_BANNERS)};
};

const PLATFORM_FILTERS = [
    {key: 'ps5', label: 'PS5', test: (offer) => /ps\s?5/i.test(offer.product?.platform)},
    {key: 'ps4', label: 'PS4', test: (offer) => /ps\s?4/i.test(offer.product?.platform)},
    {key: 'xbox', label: 'Xbox', test: (offer) => offer.origins.some((origin) => familyOf(origin.type) === 'xbox')}
];

const REGION_FILTERS = [
    {key: 'ps', label: 'PS Турция', flag: 'tr'},
    {key: 'ps_india', label: 'PS Индия', flag: 'in'}
];

export const SHELF_SORTS = [
    {key: 'default', label: 'По умолчанию'},
    {key: 'discount', label: 'Сначала скидка'},
    {key: 'priceAsc', label: 'Сначала дешевле'},
    {key: 'priceDesc', label: 'Сначала дороже'}
];

export const shelfFilters = (offers) => {
    const list = offers || [];

    const platforms = PLATFORM_FILTERS
        .filter((filter) => list.some(filter.test))
        .map(({key, label}) => ({key, label}));

    const regions = REGION_FILTERS
        .filter((filter) => list.some((offer) => offer.origins.some((origin) => origin.type === filter.key)))
        .map(({key, label, flag}) => ({key: `region:${key}`, label, flag}));

    return [...platforms, ...regions];
};

const narrowToRegion = (offer, type) => {
    const origin = offer.origins.find((item) => item.type === type);
    if (!origin) return null;

    return {
        ...offer,
        product: origin.product || offer.product,
        price: origin.price,
        oldPrice: origin.product?.oldPrice ?? null,
        origins: [origin]
    };
};

export const filterOffers = (offers, key) => {
    const list = offers || [];
    if (!key || key === 'all') return list;

    if (key.startsWith('region:')) {
        const type = key.slice('region:'.length);
        return list.map((offer) => narrowToRegion(offer, type)).filter(Boolean);
    }

    const filter = PLATFORM_FILTERS.find((item) => item.key === key);
    return filter ? list.filter(filter.test) : list;
};

const discountOf = (offer) => {
    const price = Number(offer.price);
    const before = Number(offer.oldPrice);
    return Number.isFinite(price) && Number.isFinite(before) && before > price ? 1 - price / before : 0;
};

const priceValue = (offer) => {
    const price = Number(offer.price);
    return offer.price !== null && Number.isFinite(price) ? price : null;
};

const byPrice = (direction) => (a, b) => {
    const left = priceValue(a);
    const right = priceValue(b);

    if (left === null) return right === null ? 0 : 1;
    if (right === null) return -1;
    return (left - right) * direction;
};

export const sortOffers = (offers, sorting) => {
    const list = [...(offers || [])];

    if (sorting === 'discount') return list.sort((a, b) => discountOf(b) - discountOf(a));
    if (sorting === 'priceAsc') return list.sort(byPrice(1));
    if (sorting === 'priceDesc') return list.sort(byPrice(-1));
    return list;
};
