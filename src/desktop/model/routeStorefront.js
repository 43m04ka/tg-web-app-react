export const routeStorefront = ({pathname, catalogs, products}) => {
    let catalog = null;
    if (pathname.startsWith('/catalog/') || pathname.startsWith('/subscription/')) {
        const path = pathname.replace(/^\/(catalog|subscription)\//, '');
        catalog = (catalogs || []).find((item) => item.path === path);
    } else {
        const match = pathname.match(/^\/card\/(\d+)$/);
        const product = match && (products || []).find((item) => String(item.id) === match[1]);
        if (product) catalog = (catalogs || []).find((item) => item.id === product.catalogId);
    }
    return catalog?.structurePageId ?? null;
};
