import {
    QUEUE_OF,
    catalogProblem,
    emptyParseForm,
    parseProblem,
    queueBusy,
    recheckSummary,
    saleState,
    sourceOfPage,
    toParsePayload,
    toggleIn
} from './catalogsModel';

const pages = [
    {id: 1, name: 'Турция', type: 'ps'},
    {id: 2, name: 'Индия', type: 'ps_india'},
    {id: 3, name: 'Xbox', type: 'xbox'},
    {id: 4, name: 'Сервисы', type: 'services'}
];

describe('sourceOfPage', () => {
    it('берёт источник из типа витрины', () => {
        expect(sourceOfPage({structurePageId: 1}, pages)).toBe('ps');
        expect(sourceOfPage({structurePageId: 2}, pages)).toBe('ps_india');
        expect(sourceOfPage({structurePageId: 3}, pages)).toBe('xbox');
    });

    it('для витрин без парсера источника нет', () => {
        expect(sourceOfPage({structurePageId: 4}, pages)).toBeNull();
        expect(sourceOfPage({structurePageId: 99}, pages)).toBeNull();
    });
});

describe('QUEUE_OF', () => {
    it('Турция и Индия делят очередь, Xbox стоит в своей', () => {
        expect(QUEUE_OF('ps')).toBe('ps');
        expect(QUEUE_OF('ps_india')).toBe('ps');
        expect(QUEUE_OF('xbox')).toBe('xbox');
    });
});

describe('catalogProblem', () => {
    it('требует путь в нижнем регистре', () => {
        expect(catalogProblem({path: '', structurePageId: 1})).toMatch(/пути/);
        expect(catalogProblem({path: 'ПС', structurePageId: 1})).toMatch(/Латиница/);
        expect(catalogProblem({path: 'PS_TUR', structurePageId: 1})).toMatch(/Латиница/);
        expect(catalogProblem({path: 'ps_tur_games', structurePageId: 1})).toBeNull();
    });

    it('ловит дубль пути, но не считает дублем сам каталог', () => {
        const existing = [{id: 7, path: 'ps_tur_games'}];

        expect(catalogProblem({path: 'ps_tur_games', structurePageId: 1}, {existing})).toMatch(/занят/);
        expect(catalogProblem({path: 'ps_tur_games', structurePageId: 1}, {existing, id: 7})).toBeNull();
    });

    it('требует витрину', () => {
        expect(catalogProblem({path: 'ps_tur_games', structurePageId: ''})).toMatch(/витрину/);
    });
});

describe('parseProblem', () => {
    it('отбивает страницу акций с объяснением', () => {
        const form = {...emptyParseForm('ps'), categoryUrl: 'https://store.playstation.com/ru-ru/pages/deals'};

        expect(parseProblem(form)).toMatch(/deals/);
    });

    it('требует категорию у PlayStation', () => {
        expect(parseProblem({...emptyParseForm('ps'), categoryUrl: ''})).toMatch(/категории/);
        expect(parseProblem({...emptyParseForm('ps'), categoryUrl: '/category/abc'})).toBeNull();
    });

    it('у Xbox ссылка необязательна', () => {
        expect(parseProblem({...emptyParseForm('xbox'), countPages: '0'})).toBeNull();
    });

    it('у Xbox ограничение по позициям требует число', () => {
        const form = {...emptyParseForm('xbox'), limitMode: 'items', countItems: ''};

        expect(parseProblem(form)).toMatch(/сколько позиций/);
        expect(parseProblem({...form, countItems: '50'})).toBeNull();
    });

    it('парс по ссылкам требует схему у каждой', () => {
        const form = {...emptyParseForm('ps'), mode: 'links', links: 'store.playstation.com/x'};

        expect(parseProblem(form)).toMatch(/http/);
        expect(parseProblem({...form, links: 'https://a\nhttps://b'})).toBeNull();
        expect(parseProblem({...form, links: '   '})).toMatch(/хотя бы одну/);
    });
});

describe('toParsePayload', () => {
    it('отправляет путь каталога, а не его номер', () => {
        const payload = toParsePayload(
            {...emptyParseForm('ps'), categoryUrl: '/category/x'},
            {id: 5, path: 'ps_tur_games'}
        );

        expect(payload.bdPath).toBe('ps_tur_games');
        expect(payload.catalogId).toBe('/category/x');
        expect(payload.countPages).toBe(0);
    });

    it('ограничение страницами уходит числом', () => {
        const payload = toParsePayload(
            {...emptyParseForm('ps'), categoryUrl: '/category/x', pagesMode: 'limit', countPages: '3'},
            {path: 'p'}
        );

        expect(payload.countPages).toBe(3);
    });

    it('у Xbox два ограничения не смешиваются', () => {
        const payload = toParsePayload(
            {...emptyParseForm('xbox'), limitMode: 'items', countItems: '40', countPages: '9'},
            {path: 'p'}
        );

        expect(payload.countItems).toBe(40);
        expect(payload.countPages).toBe(0);
    });
});

describe('queueBusy', () => {
    it('читает ожидание как список, а не как число', () => {
        const queue = {ps: {running: {id: 1}, waiting: [{id: 2}, {id: 3}]}, xbox: {running: null, waiting: []}};

        expect(queueBusy(queue, 'ps')).toMatch(/ещё 2/);
        expect(queueBusy(queue, 'ps_india')).toMatch(/ещё 2/);
        expect(queueBusy(queue, 'xbox')).toBeNull();
        expect(queueBusy(null, 'ps')).toBeNull();
    });

    it('идущую задачу без очереди называет просто занятостью', () => {
        expect(queueBusy({ps: {running: {id: 1}, waiting: []}}, 'ps')).toMatch(/другая задача/);
    });
});

describe('recheckSummary', () => {
    it('не делит на ноль', () => {
        expect(recheckSummary({checked: 0, mismatched: 0})).toEqual({checked: 0, mismatched: 0, share: 0});
    });

    it('считает долю расхождений', () => {
        expect(recheckSummary({checked: 50, mismatched: 5})).toEqual({checked: 50, mismatched: 5, share: 10});
    });

    it('без отчёта возвращает null', () => {
        expect(recheckSummary(null)).toBeNull();
    });
});

describe('saleState', () => {
    it('читает состояние продаж по числу', () => {
        expect(saleState({onSale: 0}).title).toBe('Снят с продажи');
        expect(saleState({onSale: 1}).title).toBe('Частично');
        expect(saleState({onSale: 2}).title).toBe('В продаже');
        expect(saleState({}).title).toBe('Неизвестно');
    });
});

describe('парс: режимы и фильтры', () => {
    const cat = {id: 5, path: 'ps_tur_games'};
    const ps = (patch) => ({...emptyParseForm('ps'), categoryUrl: '/c/1', ...patch});
    const xbox = (patch) => ({...emptyParseForm('xbox'), ...patch});

    it('поверхностный парс гасит безопасный режим: заходить в карточки он не будет', () => {
        const payload = toParsePayload(ps({isShallow: true, safeMode: true}), cat);

        expect(payload.isShallow).toBe(true);
        expect(payload.safeMode).toBe(false);
    });

    it('поверхностный вместе с дополнениями не пропускается', () => {
        expect(parseProblem(ps({isShallow: true, parceAddons: true}))).toMatch(/не заходит/);
    });

    it('при глубоком парсе безопасный режим доживает до запроса', () => {
        expect(toParsePayload(ps({safeMode: true}), cat).safeMode).toBe(true);
    });

    it('фильтры PlayStation уходят с префиксами', () => {
        const payload = toParsePayload(ps({filterTypes: ['FULL_GAME'], filterPlatforms: ['PS5']}), cat);

        expect(payload.filterBy).toEqual(['storeDisplayClassification:FULL_GAME', 'targetPlatforms:PS5']);
    });

    it('пустые фильтры и сортировка по умолчанию не отправляются вовсе', () => {
        const payload = toParsePayload(ps({}), cat);

        expect('filterBy' in payload).toBe(false);
        expect('sortBy' in payload).toBe(false);
    });

    it('заданная сортировка уходит с направлением', () => {
        const payload = toParsePayload(ps({sortName: 'productName', sortAscending: true}), cat);

        expect(payload.sortBy).toEqual({name: 'productName', isAscending: true});
    });

    it('пустые группы фильтров Xbox не уходят: пустой список и отсутствие фильтра — разное', () => {
        const payload = toParsePayload(xbox({xboxFilters: {PlayWith: ['PC'], Price: [], Genre: []}}), cat);

        expect(payload.filters).toEqual({PlayWith: ['PC']});
    });

    it('сортировка Xbox по умолчанию в фильтры не попадает', () => {
        expect('orderby' in toParsePayload(xbox({}), cat).filters).toBe(false);
        expect(toParsePayload(xbox({xboxSort: 'Price asc'}), cat).filters.orderby).toBe('Price asc');
    });

    it('дата акции уходит меткой времени, пустая — null', () => {
        expect(toParsePayload(ps({}), cat).endDataPromotion).toBeNull();
        expect(typeof toParsePayload(ps({promoDate: '2026-12-31'}), cat).endDataPromotion).toBe('number');
    });

    it('по умолчанию Xbox парсит весь каталог', () => {
        const payload = toParsePayload(xbox({}), cat);

        expect(payload.countPages).toBe(0);
        expect(payload.countItems).toBe(0);
    });
});

describe('toggleIn', () => {
    it('добавляет и убирает значение', () => {
        expect(toggleIn(['a'], 'b')).toEqual(['a', 'b']);
        expect(toggleIn(['a', 'b'], 'a')).toEqual(['b']);
        expect(toggleIn(null, 'a')).toEqual(['a']);
    });
});
