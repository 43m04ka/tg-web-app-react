import {buildHero, buildShelves, familyOf, mergeOffers, offerKey} from './storefrontModel';
import {createProductOrigin} from '../../shared/lib/productOrigin';

const pages = [
    {id: 20, type: 'ps', name: 'PlayStation Турция'},
    {id: 35, type: 'ps_india', name: 'Playstation Индия'},
    {id: 28, type: 'xbox', name: 'Xbox'}
];

const startPages = [
    {structurePageId: 20, title: 'Турция'},
    {structurePageId: 35, title: 'Индия'},
    {structurePageId: 28, title: 'Xbox'}
];

const catalogs = [
    {id: 292, path: 'ps_tur_popular', structurePageId: 20},
    {id: 293, path: 'ps_ind_popular', structurePageId: 35},
    {id: 242, path: 'xbox_us_popular', structurePageId: 28},
    {id: 298, path: 'ps_tur_deals', structurePageId: 20}
];

const originOf = createProductOrigin({catalogs, pages, startPages});

const product = (id, catalogId, name, price, extra = {}) => ({
    id,
    catalogId,
    name,
    price,
    serialNumber: id,
    ...extra
});

describe('familyOf', () => {
    it('турецкая и индийская PlayStation — одна семья, Xbox — своя', () => {
        expect(familyOf('ps')).toBe('ps');
        expect(familyOf('ps_india')).toBe('ps');
        expect(familyOf('xbox')).toBe('xbox');
        expect(familyOf(null)).toBe('other');
    });
});

describe('offerKey', () => {
    it('различает редакции одной игры', () => {
        const base = {name: 'Elden Ring'};
        expect(offerKey(base, 'ps')).toBe(offerKey({name: ' elden  ring '}, 'ps'));
        expect(offerKey({...base, choiceRow: '12 мес'}, 'ps'))
            .not.toBe(offerKey({...base, choiceRow: '1 мес'}, 'ps'));
    });
});

describe('mergeOffers', () => {
    it('одна игра на двух витринах PlayStation — одна карточка по меньшей цене', () => {
        const merged = mergeOffers([
            product(1, 292, 'Cyberpunk 2077', 4200, {oldPrice: 6000}),
            product(2, 293, 'Cyberpunk 2077', 1890, {oldPrice: 4725})
        ], originOf);

        expect(merged).toHaveLength(1);
        expect(merged[0].price).toBe(1890);
        expect(merged[0].oldPrice).toBe(4725);
        expect(merged[0].product.id).toBe(2);
        expect(merged[0].origins.map((item) => item.label)).toEqual(['PS Индия', 'PS Турция']);
    });

    it('та же игра на Xbox остаётся отдельной карточкой', () => {
        const merged = mergeOffers([
            product(1, 292, 'Cyberpunk 2077', 4200),
            product(2, 242, 'Cyberpunk 2077', 3100)
        ], originOf);

        expect(merged).toHaveLength(2);
        expect(merged.map((offer) => offer.origins[0].label).sort())
            .toEqual(['PS Турция', 'Xbox']);
    });

    it('витрина не задваивается, даже если товар в ней встретился дважды', () => {
        const merged = mergeOffers([
            product(1, 292, 'Hades', 900),
            product(2, 292, 'Hades', 800)
        ], originOf);

        expect(merged).toHaveLength(1);
        expect(merged[0].origins).toHaveLength(1);
        expect(merged[0].price).toBe(800);
    });

    it('товар без цены не вытесняет предложение с ценой', () => {
        const merged = mergeOffers([
            product(1, 292, 'Hades', 900),
            product(2, 293, 'Hades', 0)
        ], originOf);

        expect(merged[0].price).toBe(900);
        expect(merged[0].product.id).toBe(1);
    });
});

describe('buildShelves', () => {
    const structureBlocks = [
        {id: 1, group: 'body', type: 'ordinary', name: 'Популярное', path: 'ps_tur_popular', structurePageId: 20, serialNumber: 2},
        {id: 2, group: 'body', type: 'ordinary', name: 'Популярное', path: '/catalog/ps_ind_popular', structurePageId: 35, serialNumber: 3},
        {id: 3, group: 'body', type: 'ordinary', name: 'Популярное', path: 'xbox_us_popular', structurePageId: 28, serialNumber: 1},
        {id: 4, group: 'body', type: 'ordinary', name: 'Скидки недели', path: 'ps_tur_deals', structurePageId: 20, serialNumber: 5},
        {id: 5, group: 'body', type: 'banner-clickable', name: '', path: null, structurePageId: 20, serialNumber: 0},
        {id: 6, group: 'head', type: 'ordinary', name: 'Шапка', path: 'ps_tur_popular', structurePageId: 20, serialNumber: 0}
    ];

    const mainPageProducts = [
        product(1, 292, 'Cyberpunk 2077', 4200),
        product(2, 293, 'Cyberpunk 2077', 1890),
        product(3, 242, 'Forza Horizon 5', 2490),
        product(4, 298, 'Way of the Hunter', 1420)
    ];

    const build = (scopeId = null) => buildShelves({
        structureBlocks,
        catalogs,
        mainPageProducts,
        originOf,
        pageIds: [20, 35, 28],
        scopeId
    });

    it('одноимённые полки разных витрин сходятся в одну секцию', () => {
        const shelves = build();

        expect(shelves.map((shelf) => shelf.title)).toEqual(['Популярное', 'Скидки недели']);

        const popular = shelves[0];
        expect(popular.pages.map((item) => item.pageId).sort()).toEqual([20, 28, 35]);
        expect(popular.offers).toHaveLength(2);
        expect(popular.offers.find((offer) => offer.product.name === 'Cyberpunk 2077').price).toBe(1890);
    });

    it('полка сортируется по самому раннему блоку, а шапка и баннеры не участвуют', () => {
        const shelves = build();

        expect(shelves[0].order).toBe(1);
        expect(shelves.every((shelf) => shelf.offers.length > 0)).toBe(true);
    });

    it('выбранная витрина оставляет только свои полки', () => {
        const shelves = build(28);

        expect(shelves.map((shelf) => shelf.title)).toEqual(['Популярное']);
        expect(shelves[0].offers.map((offer) => offer.product.name)).toEqual(['Forza Horizon 5']);
    });

    it('без загруженной структуры полок нет', () => {
        expect(buildShelves({structureBlocks: null, catalogs})).toBeNull();
    });
});

describe('buildHero', () => {
    const mainPageProducts = [
        product(101, 292, 'GTA VI', 8390),
        product(102, 293, 'EA SPORTS FC 26', 4190),
        product(103, 242, 'Forza Horizon 5', 2490)
    ];

    const originByPage = new Map([
        [20, {pageId: 20, type: 'ps', label: 'PS Турция'}],
        [35, {pageId: 35, type: 'ps_india', label: 'PS Индия'}],
        [28, {pageId: 28, type: 'xbox', label: 'Xbox'}]
    ]);

    const banner = (id, pageId, serialNumber, data) => ({id, type: 'product', pageId, serialNumber, data});

    const banners = [
        banner(1, 20, 1, {productId: 101, title: 'GTA VI', subtitle: 'Предзаказ', image: 'gta.jpg'}),
        banner(2, 20, 0, {productId: 101, title: 'GTA VI', subtitle: 'Ещё раз Турция', image: 'gta.jpg'}),
        banner(3, 35, 2, {productId: 102, title: 'EA SPORTS FC 26', subtitle: 'Индия', image: 'fc.jpg'}),
        banner(4, 28, 3, {productId: 103, title: 'Forza Horizon 5', subtitle: 'Xbox', image: 'forza.jpg'}),
        banner(5, 28, 4, {productId: 999, title: 'Halo', image: 'halo.jpg'})
    ];

    const build = (extra = {}) => buildHero({
        banners,
        mainPageProducts,
        originOf,
        originByPage,
        pageIds: [20, 35, 28],
        ...extra
    });

    it('в промо попадает по одной витрине, пока хватает разных', () => {
        const hero = build();

        expect(hero.map((item) => item.origin.label)).toEqual(['PS Турция', 'PS Индия', 'Xbox']);
        expect(hero[0].subtitle).toBe('Ещё раз Турция');
    });

    it('одна игра не занимает два промо, даже если её рекламируют две витрины', () => {
        const hero = buildHero({
            banners: [
                banner(1, 20, 0, {productId: 101, title: 'GTA VI', image: 'gta.jpg'}),
                banner(2, 35, 1, {productId: 104, title: 'GTA VI', image: 'gta.jpg'}),
                banner(3, 28, 2, {productId: 103, title: 'Forza Horizon 5', image: 'forza.jpg'})
            ],
            mainPageProducts: [...mainPageProducts, product(104, 293, 'GTA VI', 7800)],
            originOf,
            originByPage,
            pageIds: [20, 35, 28]
        });

        expect(hero.map((item) => item.title)).toEqual(['GTA VI', 'Forza Horizon 5']);
    });

    it('баннер рисуется, даже если его товар не загружен в подборки', () => {
        const hero = build({pageIds: [28], scopeId: 28});

        expect(hero.map((item) => item.title)).toEqual(['Forza Horizon 5', 'Halo']);

        const halo = hero[1];
        expect(halo.product).toBeNull();
        expect(halo.productId).toBe(999);
        expect(halo.origin.label).toBe('Xbox');
    });

    it('из баннера берутся цена, срок акции и кадрирование', () => {
        const hero = buildHero({
            banners: [banner(1, 20, 0, {
                productId: 101,
                title: 'GTA VI',
                image: 'gta.jpg',
                imageFit: 'coverTop',
                price: 8390,
                oldPrice: 10350,
                promoEndDate: '1787785140000'
            })],
            mainPageProducts,
            originOf,
            originByPage,
            pageIds: [20]
        });

        expect(hero[0]).toEqual(expect.objectContaining({
            price: 8390,
            oldPrice: 10350,
            imageFit: 'coverTop',
            promoEndDate: '1787785140000'
        }));
    });

    it('правка из админки перебивает данные баннера', () => {
        const hero = buildHero({
            banners: [banner(1, 20, 0, {
                productId: 101,
                title: 'Старое название',
                image: 'old.jpg',
                override: {title: 'Новое название', image: 'new.jpg', imageFit: 'coverTop'}
            })],
            mainPageProducts,
            originOf,
            originByPage,
            pageIds: [20]
        });

        expect(hero[0]).toEqual(expect.objectContaining({
            title: 'Новое название',
            image: 'new.jpg',
            imageFit: 'coverTop'
        }));
    });

    it('баннер без картинки и названия не показывается', () => {
        expect(buildHero({
            banners: [banner(1, 20, 0, {productId: 101, subtitle: 'Только подпись'})],
            mainPageProducts,
            originOf,
            originByPage,
            pageIds: [20]
        })).toEqual([]);
    });

    it('без баннеров промо пустое', () => {
        expect(buildHero({banners: null})).toEqual([]);
    });
});
