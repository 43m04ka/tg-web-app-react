import {
    bannerProblem,
    bannersFor,
    bannerScope,
    bannerTitle,
    emptyBanner,
    moveBanner,
    sortBanners,
    toDraft,
    toPayload
} from './bannerModel';

const draft = (patch) => ({...emptyBanner(), ...patch});

describe('toPayload', () => {
    it('кладёт ручные правки товара в override, а не поверх разрешённых полей', () => {
        const payload = toPayload(draft({
            type: 'product',
            productId: '42',
            title: 'Своё',
            image: 'pic',
            imageFit: 'coverTop'
        }));

        expect(payload.data.productId).toBe(42);
        expect(payload.data.override).toEqual({title: 'Своё', image: 'pic', imageFit: 'coverTop'});
        expect(payload.data.title).toBeUndefined();
    });

    it('обнуляет способ кадрирования вместе с пустой картинкой', () => {
        const payload = toPayload(draft({type: 'product', productId: '1', image: '  ', imageFit: 'coverTop'}));

        expect(payload.data.override.imageFit).toBe('');
    });

    it('произвольный баннер пишет поля напрямую', () => {
        const payload = toPayload(draft({type: 'custom', title: 'Долями', price: '100', oldPrice: '200'}));

        expect(payload.data.title).toBe('Долями');
        expect(payload.data.price).toBe(100);
        expect(payload.data.override).toBeUndefined();
    });

    it('пустые цены отправляет как null, а не как ноль', () => {
        const payload = toPayload(draft({type: 'custom', title: 'A', price: '', oldPrice: ''}));

        expect(payload.data.price).toBeNull();
        expect(payload.data.oldPrice).toBeNull();
    });

    it('«все витрины» — это pageId null', () => {
        expect(toPayload(draft({type: 'custom', title: 'A', pageId: null})).pageId).toBeNull();
        expect(toPayload(draft({type: 'custom', title: 'A', pageId: 3})).pageId).toBe(3);
    });
});

describe('toDraft', () => {
    it('читает ручную правку из override, а не разрешённое значение', () => {
        const banner = {
            id: 1,
            type: 'product',
            pageId: null,
            serialNumber: 2,
            isHidden: 0,
            data: {productId: 7, title: 'из товара', override: {title: 'ручное', image: '', imageFit: ''}}
        };

        expect(toDraft(banner).title).toBe('ручное');
        expect(toDraft(banner).productId).toBe('7');
    });

    it('переживает обход туда и обратно', () => {
        const stored = {
            id: 2,
            type: 'custom',
            pageId: 5,
            serialNumber: 1,
            isHidden: 1,
            data: {
                title: 'T',
                subtitle: 'S',
                note: 'N',
                url: 'https://x.ru',
                image: '',
                imageFit: 'banner',
                gradient: 'g',
                price: 10,
                oldPrice: 20,
                promoEndDate: '2026-01-01'
            }
        };

        const back = toPayload(toDraft(stored));

        expect(back.pageId).toBe(5);
        expect(back.isHidden).toBe(1);
        expect(back.data).toMatchObject({title: 'T', price: 10, oldPrice: 20, promoEndDate: '2026-01-01'});
    });
});

describe('bannerProblem', () => {
    it('требует товар у баннера товара', () => {
        expect(bannerProblem(draft({type: 'product', productId: ''}))).toMatch(/товар/i);
    });

    it('требует заголовок и фон у произвольного', () => {
        expect(bannerProblem(draft({type: 'custom', title: ''}))).toMatch(/заголовка/);
        expect(bannerProblem(draft({type: 'custom', title: 'A'}))).toBeNull();
        expect(bannerProblem(draft({type: 'custom', title: 'A', gradient: '', image: ''})))
            .toMatch(/картинка|градиент/);
    });

    it('требует схему у ссылки', () => {
        expect(bannerProblem(draft({type: 'custom', title: 'A', url: 'x.ru'}))).toMatch(/http/);
    });

    it('ловит старую цену ниже новой', () => {
        expect(bannerProblem(draft({type: 'custom', title: 'A', price: '200', oldPrice: '100'})))
            .toMatch(/больше/);
    });
});

describe('порядок баннеров', () => {
    it('сортирует по номеру, при равенстве по id', () => {
        const list = [{id: 3, serialNumber: 1}, {id: 1, serialNumber: 1}, {id: 2, serialNumber: 0}];

        expect(sortBanners(list).map((item) => item.id)).toEqual([2, 1, 3]);
    });

    it('переставляет и не выходит за край', () => {
        const list = [{id: 1, serialNumber: 0}, {id: 2, serialNumber: 1}];

        expect(moveBanner(list, 2, -1).map((item) => item.id)).toEqual([2, 1]);
        expect(moveBanner(list, 1, -1)).toBeNull();
    });

    it('меняет местами соседей витрины, не сбивая чужие баннеры', () => {
        const all = [
            {id: 1, pageId: null, serialNumber: 0},
            {id: 2, pageId: 7, serialNumber: 1},
            {id: 3, pageId: null, serialNumber: 2}
        ];
        const page = all.filter((item) => item.pageId !== 7);

        const moved = moveBanner(page, 3, -1, all);

        expect(moved.map((item) => item.id)).toEqual([3, 2, 1]);
        expect(moved.map((item) => item.serialNumber)).toEqual([0, 1, 2]);
    });
});

describe('подписи', () => {
    it('берёт заголовок из override, потом из data, потом номер', () => {
        expect(bannerTitle({id: 4, data: {override: {title: 'X'}}})).toBe('X');
        expect(bannerTitle({id: 4, data: {title: 'Y'}})).toBe('Y');
        expect(bannerTitle({id: 4, data: {}})).toMatch(/№4/);
    });

    it('называет область показа', () => {
        expect(bannerScope({pageId: null}, [])).toBe('Все витрины');
        expect(bannerScope({pageId: 2}, [{id: 2, name: 'Турция'}])).toBe('Турция');
    });
});

describe('bannersFor', () => {
    const list = [
        {id: 1, pageId: 2, serialNumber: 1, data: {device: 'mobile'}},
        {id: 2, pageId: 2, serialNumber: 0, data: {device: 'pc'}},
        {id: 3, pageId: null, serialNumber: 2, data: {device: 'pc'}},
        {id: 4, pageId: 5, serialNumber: 0, data: {device: 'pc'}}
    ];

    it('берёт баннеры своей версии: этой витрины и общие', () => {
        expect(bannersFor(list, 2, 'pc').map((item) => item.id)).toEqual([2, 3]);
        expect(bannersFor(list, 2, 'mobile').map((item) => item.id)).toEqual([1]);
    });
});
