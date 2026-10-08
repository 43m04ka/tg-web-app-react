import {cleanPath, isCatalogBlock} from '../../../Main/catalogSections';

export const listOf = (data) => (Array.isArray(data) ? data : data?.result || []);

export const sortShelves = (list) => [...(list || [])]
    .sort((a, b) => (a.serialNumber ?? 0) - (b.serialNumber ?? 0) || a.id - b.id);

export const catalogOptions = ({catalogs, pages, blocks}) => {
    const storefronts = (pages || []).filter((page) => page.type !== 'main');
    const known = new Set(storefronts.map((page) => page.id));

    const names = new Map();
    (blocks || [])
        .filter((block) => block.group === 'body' && isCatalogBlock(block) && String(block.name || '').trim())
        .sort((a, b) => (a.serialNumber ?? 0) - (b.serialNumber ?? 0))
        .forEach((block) => {
            const key = `${block.structurePageId}|${cleanPath(block.path)}`;
            if (!names.has(key)) names.set(key, String(block.name).trim());
        });

    const groups = new Map(storefronts.map((page) => [page.id, {
        pageId: page.id,
        pageName: page.name || `Страница #${page.id}`,
        items: []
    }]));

    (catalogs || [])
        .filter((catalog) => known.has(catalog.structurePageId))
        .forEach((catalog) => {
            const name = names.get(`${catalog.structurePageId}|${catalog.path}`) || '';
            groups.get(catalog.structurePageId).items.push({
                id: Number(catalog.id),
                path: catalog.path,
                name,
                label: name || catalog.path
            });
        });

    return [...groups.values()]
        .map((group) => ({
            ...group,
            items: group.items.sort((a, b) => Number(!a.name) - Number(!b.name) || a.label.localeCompare(b.label, 'ru'))
        }))
        .filter((group) => group.items.length > 0);
};

export const optionIndex = (groups) => {
    const index = new Map();
    (groups || []).forEach((group) => group.items.forEach((item) => {
        index.set(item.id, {...item, pageName: group.pageName});
    }));
    return index;
};

export const emptyShelf = (serialNumber = 0) => ({title: '', catalogIds: [], serialNumber, isHidden: false});

export const toShelfDraft = (shelf) => (shelf ? {
    title: String(shelf.title || ''),
    catalogIds: (shelf.catalogIds || []).map(Number),
    serialNumber: shelf.serialNumber ?? 0,
    isHidden: Boolean(shelf.isHidden)
} : emptyShelf());

export const toShelfPayload = (draft) => ({
    title: draft.title.trim(),
    catalogIds: draft.catalogIds,
    serialNumber: Number(draft.serialNumber) || 0,
    isHidden: draft.isHidden ? 1 : 0
});

export const shelfProblem = (draft) => {
    if (!draft.title.trim()) return 'Нужно название полки';
    if (!draft.catalogIds.length) return 'Отметьте хотя бы один каталог';
    return '';
};

export const toggleCatalog = (draft, id) => ({
    ...draft,
    catalogIds: draft.catalogIds.includes(id)
        ? draft.catalogIds.filter((item) => item !== id)
        : [...draft.catalogIds, id]
});

export const moveShelf = (rows, id, delta) => {
    const index = rows.findIndex((row) => row.id === id);
    const target = index + delta;
    if (index < 0 || target < 0 || target >= rows.length) return null;

    const next = [...rows];
    [next[index], next[target]] = [next[target], next[index]];

    return next.map((row, order) => ({...row, serialNumber: order}));
};

export const withDraft = (rows, editing, draft) => {
    if (!editing || !draft) return rows;

    const payload = {...toShelfPayload(draft), id: editing.item?.id ?? -1};

    if (!editing.item) return [...rows, payload];
    return rows.map((row) => (row.id === editing.item.id ? {...row, ...payload} : row));
};
