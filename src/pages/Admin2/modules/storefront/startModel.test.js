import {
    byPlatform,
    emptyStartItem,
    moveStart,
    orphanWarning,
    startProblem,
    startTitle,
    toDraft,
    toGroups,
    toPayload
} from './startModel';

const draft = (patch) => ({...emptyStartItem(), ...patch});

describe('startProblem', () => {
    it('требует витрину у плитки', () => {
        expect(startProblem(draft({type: 'page', structurePageId: ''}))).toMatch(/витрину/);
        expect(startProblem(draft({type: 'page', structurePageId: '3'}))).toBeNull();
    });

    it('требует подпись и схему у ссылки', () => {
        expect(startProblem(draft({type: 'link', title: '', url: 'https://x'}))).toMatch(/подписи/);
        expect(startProblem(draft({type: 'link', title: 'A', url: ''}))).toMatch(/адрес/i);
        expect(startProblem(draft({type: 'link', title: 'A', url: 'x.ru'}))).toMatch(/http/);
        expect(startProblem(draft({type: 'link', title: 'A', url: 'tg://resolve'}))).toBeNull();
    });

    it('не пускает пустой заголовок и пустое пояснение', () => {
        expect(startProblem(draft({type: 'title', title: ''}))).toMatch(/Заголовок/);
        expect(startProblem(draft({type: 'label', text: ''}))).toMatch(/Пояснение/);
    });
});

describe('toPayload', () => {
    it('отправляет витрину только у плитки', () => {
        expect(toPayload(draft({type: 'link', title: 'A', url: 'https://x', structurePageId: '5'})).structurePageId)
            .toBeNull();
        expect(toPayload(draft({type: 'page', structurePageId: '5'})).structurePageId).toBe(5);
    });

    it('отправляет адрес только у ссылки', () => {
        expect(toPayload(draft({type: 'page', structurePageId: '1', url: 'https://x'})).url).toBe('');
    });

    it('переживает обход туда и обратно', () => {
        const stored = {
            id: 1,
            platform: 'web',
            type: 'page',
            icon: 'i',
            url: '',
            color: '#fff',
            text: '',
            title: 'T',
            structurePageId: 4,
            serialNumber: 3
        };

        expect(toPayload(toDraft(stored))).toMatchObject({
            platform: 'web',
            structurePageId: 4,
            serialNumber: 3,
            title: 'T'
        });
    });
});

describe('toGroups', () => {
    it('собирает группы по заголовкам', () => {
        const items = [
            {id: 1, type: 'title', title: 'Консоли'},
            {id: 2, type: 'page'},
            {id: 3, type: 'page'},
            {id: 4, type: 'title', title: 'Прочее'},
            {id: 5, type: 'link'}
        ];

        const groups = toGroups(items);

        expect(groups).toHaveLength(2);
        expect(groups[0].header.title).toBe('Консоли');
        expect(groups[0].children).toHaveLength(2);
        expect(groups[1].children).toHaveLength(1);
    });

    it('записи до первого заголовка складывает в безымянную группу', () => {
        const items = [{id: 1, type: 'page'}, {id: 2, type: 'title', title: 'T'}, {id: 3, type: 'page'}];
        const groups = toGroups(items);

        expect(groups).toHaveLength(2);
        expect(groups[0].header).toBeNull();
    });
});

describe('orphanWarning', () => {
    it('предупреждает о записях до первого заголовка', () => {
        const items = [
            {id: 1, type: 'page', serialNumber: 0},
            {id: 2, type: 'title', serialNumber: 1}
        ];

        expect(orphanWarning(items)).toMatch(/без названия/);
    });

    it('молчит, когда заголовок первый или список пуст', () => {
        expect(orphanWarning([{id: 1, type: 'title', serialNumber: 0}])).toBeNull();
        expect(orphanWarning([])).toBeNull();
    });
});

describe('порядок и площадки', () => {
    it('фильтрует по площадке и держит порядок', () => {
        const list = [
            {id: 1, platform: 'tg', serialNumber: 1},
            {id: 2, platform: 'web', serialNumber: 0},
            {id: 3, platform: 'tg', serialNumber: 0}
        ];

        expect(byPlatform(list, 'tg').map((item) => item.id)).toEqual([3, 1]);
    });

    it('переставляет и не выходит за край', () => {
        const list = [{id: 1, serialNumber: 0}, {id: 2, serialNumber: 1}];

        expect(moveStart(list, 1, 1).map((item) => item.id)).toEqual([2, 1]);
        expect(moveStart(list, 2, 1)).toBeNull();
    });
});

describe('startTitle', () => {
    it('падает на название витрины, когда своей подписи нет', () => {
        const pages = [{id: 2, name: 'Турция'}];

        expect(startTitle({type: 'page', structurePageId: 2, title: ''}, pages)).toBe('Турция');
        expect(startTitle({type: 'page', structurePageId: 2, title: 'Своё'}, pages)).toBe('Своё');
    });
});
