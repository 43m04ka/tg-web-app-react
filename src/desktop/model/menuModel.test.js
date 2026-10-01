import {menuGroups, menuTarget} from './menuModel';

const storefronts = [
    {id: 20, type: 'ps', label: 'Турция'},
    {id: 35, type: 'ps_india', label: 'Индия'},
    {id: 28, type: 'xbox', label: 'США'}
];

const catalogs = [
    {path: 'ps_tur_psplus', structurePageId: 20},
    {path: 'ps_tur_eaplay', structurePageId: 20},
    {path: 'ps_tur_gtaplus', structurePageId: 20},
    {path: 'ps_tur_ubisoft', structurePageId: 20},
    {path: 'ps_tur_gta6', structurePageId: 20},
    {path: 'ps_ind_psplus', structurePageId: 35},
    {path: 'xbox_us_gamepass', structurePageId: 28}
];

const blocks = [
    {id: 2, type: 'ordinary', path: 'ps_tur_new', name: 'Новинки ', structurePageId: 20, serialNumber: 2},
    {id: 1, type: 'ordinary', path: 'ps_tur_popular', name: 'Популярное', structurePageId: 20, serialNumber: 1},
    {id: 3, type: 'ordinary', path: 'ps_tur_eaplay', name: 'Подписка EA Play', structurePageId: 20},
    {id: 4, type: 'banner-clickable', path: '/catalog/x', name: null, structurePageId: 20}
];

const sections = [
    {key: 'steam', pageId: 36, route: '/steam', label: 'Steam'},
    {key: 'services', pageId: 37, route: '/services', label: 'Сервисы'}
];

const build = (extra = {}) => menuGroups({storefronts, sections, catalogs, blocks, ...extra});

describe('menuGroups', () => {
    it('собирает «Магазин» и «Покупателям» в заданном порядке', () => {
        const [shop, buyers] = build();

        expect(shop.items.map((item) => item.label)).toEqual([
            'Игры для PlayStation',
            'Подписка PlayStation Plus',
            'Игры для Xbox',
            'Подписка Game Pass',
            'Пополнение Steam',
            'Оплата сервисов'
        ]);
        expect(buyers.items.map((item) => item.label)).toEqual(['Получить заказ с маркетплейса', 'База знаний', 'Контакты']);
    });

    it('раскладывает подборки PlayStation по регионам без подписок и баннеров', () => {
        const ps = build()[0].items[0];

        expect(ps.columns.map((column) => column.title)).toEqual(['Регион Турция', 'Регион Индия']);
        expect(ps.columns[0].links.map((link) => link.label)).toEqual(['Все игры', 'Популярное', 'Новинки']);
        expect(ps.columns[0].links[1].to).toBe('/catalog/ps_tur_popular');
    });

    it('PS Plus ведёт в подписку первой витрины', () => {
        const plus = build()[0].items[1];

        expect(menuTarget(plus)).toBe('/subscription/ps_tur_psplus');
        expect(plus.columns[0].links.map((link) => link.label)).toEqual(['PlayStation Plus', 'EA Play', 'Ubisoft+', 'GTA+']);
        expect(plus.columns[1].links.map((link) => link.label)).toEqual(['PlayStation Plus']);
    });

    it('прячет закрытые разделы и добавляет страницы из меню без дублей', () => {
        const groups = build({
            sections: [],
            pageLinks: [
                {key: 'page-1', label: 'Контакты', to: '/info/contact'},
                {key: 'page-2', label: 'Отзывы', to: '/info/reviews'}
            ]
        });

        expect(groups[0].items.map((item) => item.key)).not.toContain('steam');
        expect(groups[1].items.map((item) => item.label)).toEqual(['Получить заказ с маркетплейса', 'База знаний', 'Контакты', 'Отзывы']);
        expect(groups[1].items[3].extra).toBe(true);
    });
});
