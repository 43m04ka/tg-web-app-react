import {regionIcon, regionLabel, regionTitle} from './region';

export const createProductOrigin = ({catalogs, pages, startPages} = {}) => {
    const pageIdByCatalog = new Map(
        (catalogs || []).map((catalog) => [catalog.id, catalog.structurePageId ?? null])
    );
    const pageById = new Map((pages || []).map((page) => [page.id, page]));
    const startPageByPageId = new Map((startPages || []).map((item) => [item.structurePageId, item]));

    return (product) => {
        const pageId = pageIdByCatalog.get(product?.catalogId) ?? null;
        if (pageId === null || pageId === undefined) return null;

        const page = pageById.get(pageId) || null;
        const startPage = startPageByPageId.get(pageId) || null;
        if (!page && !startPage) return null;

        return {
            pageId,
            type: page?.type || null,
            label: regionLabel(page, startPage),
            title: regionTitle(page, startPage),
            icon: regionIcon(page, startPage),
            color: startPage?.color || null
        };
    };
};
