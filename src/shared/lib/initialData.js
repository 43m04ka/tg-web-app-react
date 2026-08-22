const PLACEHOLDER = '__JSON_DATA_PLACEHOLDER__';

const pick = (source, ...keys) => {
    for (const key of keys) {
        if (typeof source[key] !== 'undefined') return source[key];
    }
    return undefined;
};

const normalize = (raw) => {
    const data = raw || {};

    return {
        pages: pick(data, 'pages', 'allPages'),
        startPages: pick(data, 'startPages', 'allStartPages', 'startPageList', 'startPagesList'),
        structureBlocks: pick(data, 'structureBlocks', 'allStructureBlocks'),
        mainPageProducts: pick(data, 'mainPageProducts'),
        banners: pick(data, 'banners'),
        catalogs: pick(data, 'allCatalogs', 'catalogs'),
        maintenance: pick(data, 'maintenanceMode') || {enabled: false, until: null}
    };
};

const parse = () => {
    const raw = window.__INITIAL_DATA__;
    if (typeof raw === 'undefined' || raw === PLACEHOLDER) return normalize({});

    try {
        return normalize(typeof raw === 'string' ? JSON.parse(raw) : raw);
    } catch (error) {
        console.error('[initialData] parse failed:', error);
        return normalize({});
    }
};

export const INITIAL_DATA = parse();

export const hasItems = (value) => Array.isArray(value) && value.length > 0;
