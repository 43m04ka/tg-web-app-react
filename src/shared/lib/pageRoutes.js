import {isSubscription} from '../../pages/Main/catalogSections';

export const STANDALONE_PAGES = {
    steam: '/steam',
    services: '/services'
};

export const standaloneRoute = (pageType) => STANDALONE_PAGES[pageType] || null;

export const isStandalonePage = (pageType) => Boolean(STANDALONE_PAGES[pageType]);

export const pageTypeOf = (pages, pageId) =>
    (pages || []).find((page) => page.id === pageId)?.type || null;

const barePath = (path) => String(path || '').replace(/^\//, '');

export const catalogRoute = (path) => `/catalog/${barePath(path)}`;

export const subscriptionRoute = (path, productId) => {
    const base = `/subscription/${barePath(path)}`;
    return productId ? `${base}?option=${productId}` : base;
};

const catalogPathOf = (catalogs, catalogId) =>
    (catalogs || []).find((catalog) => catalog.id === catalogId)?.path || null;

export const productRoute = (product, catalogs) => {
    if (!product?.id) return null;

    if (isSubscription(product)) {
        const path = catalogPathOf(catalogs, product.catalogId);
        if (path) return subscriptionRoute(path, product.id);
    }

    return `/card/${product.id}`;
};
