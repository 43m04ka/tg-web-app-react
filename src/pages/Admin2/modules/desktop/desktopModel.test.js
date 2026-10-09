import {catalogOptions, moveShelf, shelfProblem, toShelfPayload, toggleCatalog, withDraft} from './desktopModel';

const pages = [
    {id: 38, type: 'main', name: 'Главная'},
    {id: 20, type: 'ps', name: 'PlayStation Турция'},
    {id: 35, type: 'ps_india', name: 'PlayStation Индия'}
];

const catalogs = [
    {id: 292, path: 'ps_tur_popular', structurePageId: 20},
    {id: 293, path: 'ps_ind_popular', structurePageId: 35},
    {id: 300, path: 'ps_tur_hidden', structurePageId: 20},
    {id: 400, path: 'main_copy', structurePageId: 38}
];

const blocks = [
    {structurePageId: 20, type: 'ordinary', path: '/catalog/ps_tur_popular', name: 'Популярное', serialNumber: 0},
    {structurePageId: 35, type: 'ordinary-choice', path: '/choice-catalog/ps_ind_popular', name: 'Хиты', serialNumber: 0},
    {structurePageId: 38, type: 'ordinary', path: 'ps_tur_popular', name: 'Не отсюда', serialNumber: 0}
];

describe('catalogOptions', () => {
    it('группирует каталоги по витринам, берёт имя из блока своей витрины и пропускает главную', () => {
        const groups = catalogOptions({catalogs, pages, blocks});

        expect(groups.map((group) => group.pageName)).toEqual(['PlayStation Турция', 'PlayStation Индия']);
        expect(groups[0].items.map((item) => item.label)).toEqual(['Популярное', 'ps_tur_hidden']);
        expect(groups[1].items[0]).toMatchObject({id: 293, label: 'Хиты'});
    });
});

describe('черновик сводного каталога', () => {
    const draft = {title: '  Популярное ', catalogIds: [], serialNumber: 2, isHidden: false};

    it('требует название и хотя бы один каталог', () => {
        expect(shelfProblem({...draft, title: ' '})).toBeTruthy();
        expect(shelfProblem(draft)).toBeTruthy();
        expect(shelfProblem(toggleCatalog(draft, 292))).toBe('');
    });

    it('переключает каталог и собирает payload', () => {
        const next = toggleCatalog(toggleCatalog(toggleCatalog(draft, 292), 293), 292);

        expect(toShelfPayload(next)).toEqual({title: 'Популярное', catalogIds: [293], serialNumber: 2, isHidden: 0});
    });

    it('подмешивает черновик в список для предпросмотра', () => {
        const rows = [{id: 1, title: 'Старое', catalogIds: [292], serialNumber: 0, isHidden: 0}];

        expect(withDraft(rows, {item: rows[0]}, {...draft, catalogIds: [293]})[0])
            .toMatchObject({id: 1, title: 'Популярное', catalogIds: [293]});
        expect(withDraft(rows, {item: null}, draft)).toHaveLength(2);
        expect(withDraft(rows, null, draft)).toBe(rows);
    });
});

describe('moveShelf', () => {
    it('меняет соседей местами и пересчитывает порядок', () => {
        const rows = [{id: 1, serialNumber: 5}, {id: 2, serialNumber: 9}, {id: 3, serialNumber: 12}];

        expect(moveShelf(rows, 3, -1).map((row) => [row.id, row.serialNumber])).toEqual([[1, 0], [3, 1], [2, 2]]);
        expect(moveShelf(rows, 1, -1)).toBeNull();
    });
});
