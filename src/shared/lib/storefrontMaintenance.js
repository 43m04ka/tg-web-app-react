export function filterStorefrontStructure(source, closed = {}) {
    const pages = source.pages || [];
    const blockedPages = new Set(pages.filter((p) => p.isHidden === 1 || closed[p.type] || (closed.main && ['ps', 'ps_india', 'xbox'].includes(p.type))).map((p) => String(p.id)));
    const blockedCatalogs = new Set((source.catalogs || []).filter((c) => blockedPages.has(String(c.structurePageId))).map((c) => String(c.id)));
    const blockedPaths = new Set((source.catalogs || []).filter((c) => blockedCatalogs.has(String(c.id))).map((c) => String(c.path || '').replace(/^\//, '')));
    const blockedProductIds = new Set();
    const allowedProduct = (p) => !p || !blockedCatalogs.has(String(p.catalogId));
    for (const key of ['popularProducts', 'mainPageProducts']) {
        for (const item of source[key] || []) {
            const p = item.product || item;
            if (!allowedProduct(p)) blockedProductIds.add(String(p.id));
        }
    }
    const blockedLink = (value) => {
        if (!value || typeof value !== 'string') return false;
        try {
            const url = new URL(value, window.location.origin);
            if (url.origin !== window.location.origin && !['gwstore.ru', 'gwstorebot.ru'].includes(url.hostname)) return false;
            for (const key of ['store', 'pageId', 'page']) if (blockedPages.has(url.searchParams.get(key))) return true;
            for (const key of ['catalogId', 'catalog']) if (blockedCatalogs.has(url.searchParams.get(key))) return true;
            const id = url.pathname.split('/').filter(Boolean).pop();
            if (/^\/(catalog|subscription)\//.test(url.pathname) && (blockedCatalogs.has(id) || blockedPaths.has(id))) return true;
            if (/^\/card\//.test(url.pathname) && blockedProductIds.has(id)) return true;
            return (closed.services && url.pathname.startsWith('/services')) || (closed.steam && url.pathname.startsWith('/steam'));
        } catch { return false; }
    };
    const result = {...source};
    if (source.pages) result.pages = pages.filter((p) => p.isHidden !== 1 && !blockedPages.has(String(p.id)));
    if (source.startPages) result.startPages = source.startPages.filter((p) => !blockedPages.has(String(p.structurePageId)) && !closed[p.type]);
    if (source.catalogs) result.catalogs = source.catalogs.filter((c) => !blockedCatalogs.has(String(c.id)));
    for (const key of ['mainPageProducts', 'popularProducts']) {
        if (source[key]) result[key] = source[key].filter((p) => allowedProduct(p.product || p));
    }
    if (source.banners) result.banners = source.banners.filter((banner) => {
        const data = banner.data || {};
        return !blockedPages.has(String(banner.pageId)) && !blockedCatalogs.has(String(data.catalogId))
            && !blockedProductIds.has(String(data.productId)) && !blockedLink(data.url)
            && !(data.buttons || []).some((button) => blockedLink(button.url));
    });
    if (source.structureBlocks) result.structureBlocks = source.structureBlocks.filter((block) => !blockedPages.has(String(block.structurePageId)));
    if (source.desktopShelves) result.desktopShelves = source.desktopShelves.map((shelf) => ({...shelf, catalogIds: (shelf.catalogIds || []).filter((id) => !blockedCatalogs.has(String(id)))})).filter((shelf) => shelf.kind !== 'catalogs' || shelf.catalogIds.length);
    return result;
}
