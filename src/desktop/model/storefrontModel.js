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
                origins: origin ? [{...origin, price}] : []
            });
            return;
        }

        if (origin && !current.origins.some((item) => item.pageId === origin.pageId)) {
            current.origins.push({...origin, price});
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
    scopeId = null
} = {}) => {
    if (!Array.isArray(structureBlocks) || !Array.isArray(catalogs)) return null;

    const allowed = new Set(scopeId === null ? (pageIds || []) : [scopeId]);
    const catalogIdByPath = new Map(catalogs.map((catalog) => [catalog.path, catalog.id]));

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

            const catalogId = catalogIdByPath.get(cleanPath(block.path));
            if (catalogId === undefined) return;

            const key = normalize(title);
            const order = block.serialNumber ?? 0;

            if (!groups.has(key)) {
                groups.set(key, {key, title, icon: block.icon || null, order, pages: [], products: []});
            }

            const group = groups.get(key);
            group.order = Math.min(group.order, order);
            if (!group.icon && block.icon) group.icon = block.icon;
            group.pages.push({pageId: block.structurePageId, path: cleanPath(block.path), type: block.type});
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
        url: text(data.url)
    };
};

export const buildHero = ({
    banners,
    mainPageProducts,
    originOf,
    originByPage,
    pageIds,
    scopeId = null,
    limit = 3
} = {}) => {
    if (!Array.isArray(banners)) return [];

    const allowed = new Set(scopeId === null ? (pageIds || []) : [scopeId]);
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
