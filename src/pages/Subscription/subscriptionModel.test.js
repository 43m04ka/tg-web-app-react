import {buildPlan, defaultSelection, locate, monthsOf} from './subscriptionModel';

const product = (id, column, row, price, extra = {}) => ({
    id,
    type: 'SUBSCRIPTION',
    catalogId: 236,
    name: `PS Plus ${column} ${row}`,
    choiceColumn: column,
    choiceRow: row,
    price,
    onSale: true,
    serialNumber: id,
    ...extra
});

const psPlus = [
    product(1, 'Essential', '1 месяц', 790, {oldPrice: 1090}),
    product(2, 'Essential', '3 месяца', 1690, {oldPrice: 2390}),
    product(3, 'Essential', '12 месяцев', 4290, {oldPrice: 5990}),
    product(4, 'Extra', '1 месяц', 1190),
    product(5, 'Extra', '3 месяца', 2390),
    product(6, 'Extra', '12 месяцев', 6290),
    product(7, 'Deluxe', '1 месяц', 1390),
    product(8, 'Deluxe', '3 месяца', 2890),
    product(9, 'Deluxe', '12 месяцев', 7190)
];

const plan = () => buildPlan(psPlus, {catalogPath: 'ps_tur_psplus', title: 'PS Plus'});

describe('monthsOf', () => {
    it('читает месяцы из choiceRow', () => {
        expect(monthsOf({choiceRow: '3 месяца'})).toBe(3);
        expect(monthsOf({choiceRow: '12 месяцев'})).toBe(12);
        expect(monthsOf({choiceRow: '1 мес'})).toBe(1);
    });

    it('переводит годы в месяцы', () => {
        expect(monthsOf({choiceRow: '1 год'})).toBe(12);
        expect(monthsOf({choiceRow: '2 года'})).toBe(24);
    });

    it('падает на название, когда срока в строке нет', () => {
        expect(monthsOf({choiceRow: 'Ultimate', name: 'Game Pass 6 месяцев'})).toBe(6);
    });

    it('возвращает null, когда срока нет нигде', () => {
        expect(monthsOf({choiceRow: 'Подписка', name: 'Spotify Family'})).toBeNull();
    });
});

describe('buildPlan', () => {
    it('узнаёт бренд по пути каталога', () => {
        expect(plan().brand.key).toBe('psplus');
    });

    it('группирует товары в тарифы по choiceColumn', () => {
        expect(plan().tiers.map((tier) => tier.name)).toEqual(['Essential', 'Extra', 'Deluxe']);
    });

    it('сортирует сроки по возрастанию месяцев', () => {
        expect(plan().tiers[0].periods.map((period) => period.months)).toEqual([1, 3, 12]);
    });

    it('считает цену за месяц только для сроков от двух месяцев', () => {
        const [one, three, year] = plan().tiers[0].periods;

        expect(one.perMonth).toBeNull();
        expect(three.perMonth).toBe(563);
        expect(year.perMonth).toBe(358);
    });

    it('ставит «Лучшая цена» самому выгодному сроку', () => {
        const periods = plan().tiers[0].periods;
        const best = periods.find((period) => period.badge === 'Лучшая цена');

        expect(best.months).toBe(12);
    });

    it('не выдаёт две одинаковые метки', () => {
        const badges = plan().tiers[0].periods.map((period) => period.badge).filter(Boolean);

        expect(new Set(badges).size).toBe(badges.length);
    });

    it('молчит про выгоду, когда сроков мало и есть бейджи', () => {
        expect(plan().tiers[0].hint).toBeNull();
    });

    it('считает выгоду, когда сроков много', () => {
        const months = [1, 3, 6, 12, 22].map((count, index) =>
            product(index + 1, '', `${count} мес`, Math.round(749 * count * (1 - 0.012 * (count - 1)))));

        const built = buildPlan(months, {catalogPath: 'xbox_us_gamepass'});

        expect(built.tiers[0].hint).toContain('22 мес');
        expect(built.tiers[0].hint).toMatch(/до \d+%/);
    });

    it('берёт «от» по цене за месяц', () => {
        expect(plan().tiers[0].fromPerMonth).toBe(358);
    });

    it('подставляет описание бренда, когда у товаров нет bubbles', () => {
        expect(plan().includes.length).toBeGreaterThan(0);
    });

    it('предпочитает bubbles товара описанию бренда', () => {
        const withBubbles = psPlus.map((item) => ({...item, bubbles: ['Своя строка']}));
        const built = buildPlan(withBubbles, {catalogPath: 'ps_tur_psplus'});

        expect(built.includes).toEqual(['Своя строка']);
    });

    it('возвращает null, когда подписок нет', () => {
        expect(buildPlan([{id: 1, type: 'GAME'}], {catalogPath: 'games'})).toBeNull();
        expect(buildPlan([], {catalogPath: 'games'})).toBeNull();
        expect(buildPlan(null, {catalogPath: 'games'})).toBeNull();
    });

    it('собирает один тариф, когда choiceColumn пуст', () => {
        const flat = [
            product(1, '', '1 месяц', 749),
            product(2, '', '3 месяца', 1990)
        ];

        const built = buildPlan(flat, {catalogPath: 'xbox_us_gamepass', title: 'Game Pass'});

        expect(built.tiers).toHaveLength(1);
        expect(built.tiers[0].name).toBe('Xbox Game Pass');
    });

    it('доверяет пути каталога больше, чем названию товара', () => {
        const built = buildPlan(
            [product(1, '', '1 месяц', 749)],
            {catalogPath: 'xbox_us_gamepass'}
        );

        expect(built.brand.key).toBe('gamepass');
    });

    it('падает на нейтральный бренд, когда ничего не узнали', () => {
        const built = buildPlan(
            [{...product(1, '', '1 месяц', 500), name: 'Spotify Family'}],
            {catalogPath: 'services_spotify'}
        );

        expect(built.brand.key).toBe('other');
        expect(built.includes).toEqual([]);
    });

    it('помечает снятые с продажи сроки недоступными', () => {
        const mixed = [
            product(1, 'Essential', '1 месяц', 790, {onSale: false}),
            product(2, 'Essential', '3 месяца', 1690)
        ];

        const built = buildPlan(mixed, {catalogPath: 'ps_tur_psplus'});

        expect(built.tiers[0].periods[0].isAvailable).toBe(false);
        expect(built.tiers[0].periods[1].isAvailable).toBe(true);
    });

    it('не считает «от» по недоступным срокам', () => {
        const mixed = [
            product(1, 'Essential', '12 месяцев', 100, {onSale: false}),
            product(2, 'Essential', '3 месяца', 1690)
        ];

        expect(buildPlan(mixed, {catalogPath: 'ps_tur_psplus'}).tiers[0].fromPerMonth).toBe(563);
    });

    it('не метит сроки, когда вариантов меньше трёх', () => {
        const pair = [
            product(1, 'Essential', '1 месяц', 790),
            product(2, 'Essential', '12 месяцев', 4290)
        ];

        const badges = buildPlan(pair, {catalogPath: 'ps_tur_psplus'})
            .tiers[0].periods.map((period) => period.badge);

        expect(badges.every((badge) => badge === undefined || badge === null)).toBe(true);
    });
});

describe('locate', () => {
    it('находит тариф и срок по id товара', () => {
        expect(locate(plan(), 5)).toEqual({tierKey: 'Extra', periodId: 5});
    });

    it('принимает id строкой, как приходит из ссылки', () => {
        expect(locate(plan(), '9')).toEqual({tierKey: 'Deluxe', periodId: 9});
    });

    it('возвращает null для чужого товара', () => {
        expect(locate(plan(), 404)).toBeNull();
        expect(locate(plan(), 'abc')).toBeNull();
        expect(locate(null, 1)).toBeNull();
    });
});

describe('defaultSelection', () => {
    it('берёт первый тариф и самый короткий срок', () => {
        expect(defaultSelection(plan())).toEqual({tierKey: 'Essential', periodId: 1});
    });

    it('пропускает тариф, где всё снято с продажи', () => {
        const built = buildPlan([
            product(1, 'Essential', '1 месяц', 790, {onSale: false}),
            product(2, 'Extra', '1 месяц', 1190)
        ], {catalogPath: 'ps_tur_psplus'});

        expect(defaultSelection(built)).toEqual({tierKey: 'Extra', periodId: 2});
    });

    it('возвращает null на пустом плане', () => {
        expect(defaultSelection(null)).toBeNull();
    });
});
