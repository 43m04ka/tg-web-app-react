import {
    MAINTENANCE_SECTIONS,
    closedCount,
    closedSection,
    normalizeSections,
    sectionIdOf,
    sectionTitleOf
} from './maintenance';

describe('sectionIdOf', () => {
    it('узнаёт раздел по точному пути', () => {
        expect(sectionIdOf('/basket')).toBe('basket');
        expect(sectionIdOf('/steam')).toBe('steam');
    });

    it('относит вложенные пути к своему разделу', () => {
        expect(sectionIdOf('/card/123')).toBe('main');
        expect(sectionIdOf('/catalog/ps-plus')).toBe('main');
        expect(sectionIdOf('/subscription/game-pass')).toBe('subscription');
    });

    it('оформление закрывается вместе с корзиной', () => {
        expect(sectionIdOf('/checkout')).toBe('basket');
    });

    it('не путает похожие начала путей', () => {
        expect(sectionIdOf('/searchable')).toBe(null);
        expect(sectionIdOf('/mainstream')).toBe(null);
    });

    it('выбор площадки и админка ни к какому разделу не относятся', () => {
        expect(sectionIdOf('/')).toBe(null);
        expect(sectionIdOf('/admin-panel/orders')).toBe(null);
    });

    it('отбрасывает строку запроса', () => {
        expect(sectionIdOf('/subscription/ps-plus?option=12')).toBe('subscription');
    });

    it('переживает пустой путь', () => {
        expect(sectionIdOf('')).toBe(null);
        expect(sectionIdOf(null)).toBe(null);
    });
});

describe('normalizeSections', () => {
    it('оставляет только включённые', () => {
        const picked = normalizeSections({
            basket: {enabled: true},
            steam: {enabled: false}
        });

        expect(Object.keys(picked)).toEqual(['basket']);
    });

    it('принимает короткую запись через true', () => {
        expect(normalizeSections({search: true}).search).toEqual({enabled: true, until: null});
    });

    it('выбрасывает неизвестные разделы, а не показывает заглушку везде', () => {
        expect(normalizeSections({выдумка: {enabled: true}})).toEqual({});
    });

    it('пустую дату окончания приводит к null', () => {
        expect(normalizeSections({more: {enabled: true, until: '   '}}).more.until).toBe(null);
        expect(normalizeSections({more: {enabled: true, until: 0}}).more.until).toBe(null);
    });

    it('сохраняет заданную дату окончания', () => {
        const until = '2026-09-11T10:00:00.000Z';
        expect(normalizeSections({more: {enabled: true, until}}).more.until).toBe(until);
    });

    it('мусор вместо настроек не роняет разбор', () => {
        expect(normalizeSections(null)).toEqual({});
        expect(normalizeSections('нет')).toEqual({});
        expect(normalizeSections([{enabled: true}])).toEqual({});
    });
});

describe('closedSection', () => {
    const sections = {basket: {enabled: true, until: '2026-09-11T10:00:00.000Z'}};

    it('закрывает свой раздел вместе с вложенными путями', () => {
        expect(closedSection('/basket', sections).id).toBe('basket');
        expect(closedSection('/checkout', sections).id).toBe('basket');
    });

    it('отдаёт название и срок для заглушки', () => {
        const closed = closedSection('/basket', sections);

        expect(closed.title).toBe('Корзина и оформление');
        expect(closed.until).toBe('2026-09-11T10:00:00.000Z');
    });

    it('соседние разделы оставляет работать', () => {
        expect(closedSection('/main', sections)).toBe(null);
        expect(closedSection('/steam', sections)).toBe(null);
    });

    it('без настроек не закрывает ничего', () => {
        expect(closedSection('/basket', {})).toBe(null);
        expect(closedSection('/basket', undefined)).toBe(null);
    });
});

describe('реестр разделов', () => {
    it('не содержит повторов в идентификаторах и путях', () => {
        const ids = MAINTENANCE_SECTIONS.map((section) => section.id);
        const paths = MAINTENANCE_SECTIONS.flatMap((section) => section.paths);

        expect(new Set(ids).size).toBe(ids.length);
        expect(new Set(paths).size).toBe(paths.length);
    });

    it('у каждого раздела есть название и пояснение', () => {
        MAINTENANCE_SECTIONS.forEach((section) => {
            expect(section.title.length).toBeGreaterThan(0);
            expect(section.hint.length).toBeGreaterThan(0);
            expect(sectionTitleOf(section.id)).toBe(section.title);
        });
    });
});

describe('closedCount', () => {
    it('считает только включённые разделы', () => {
        expect(closedCount({basket: {enabled: true}, steam: {enabled: false}, more: true})).toBe(2);
        expect(closedCount(null)).toBe(0);
    });
});
