import {
    BLANK,
    isDirty,
    isExhausted,
    normalizeCode,
    sortPromos,
    toDraft,
    toPayload,
    usesLeftTitle,
    validate
} from './promoModel';

describe('normalizeCode', () => {
    it('приводит к заглавным и обрезает пробелы', () => {
        expect(normalizeCode('  summer10 ')).toBe('SUMMER10');
    });

    it('переживает пустое значение', () => {
        expect(normalizeCode(null)).toBe('');
        expect(normalizeCode(undefined)).toBe('');
    });
});

describe('isExhausted', () => {
    it('считает исчерпанным ноль и меньше', () => {
        expect(isExhausted({totalNumberUses: 0})).toBe(true);
        expect(isExhausted({totalNumberUses: -3})).toBe(true);
        expect(isExhausted({totalNumberUses: 1})).toBe(false);
    });
});

describe('validate', () => {
    const draft = (patch) => ({...BLANK, name: 'A1', ...patch});

    it('требует код', () => {
        expect(validate(draft({name: ''})).name).toBeTruthy();
    });

    it('не пускает кириллицу и пробелы в коде', () => {
        expect(validate(draft({name: 'ЛЕТО10'})).name).toBeTruthy();
        expect(validate(draft({name: 'SUMMER 10'})).name).toBeTruthy();
    });

    it('ловит дубль без учёта регистра', () => {
        const errors = validate(draft({name: 'summer10'}), {existing: [{id: 7, name: 'SUMMER10'}]});

        expect(errors.name).toBeTruthy();
    });

    it('не считает дублем сам промокод при правке', () => {
        const errors = validate(draft({name: 'summer10'}), {existing: [{id: 7, name: 'SUMMER10'}], id: 7});

        expect(errors.name).toBeUndefined();
    });

    it('держит процент в границах 1..100', () => {
        expect(validate(draft({percent: 0})).percent).toBeTruthy();
        expect(validate(draft({percent: 101})).percent).toBeTruthy();
        expect(validate(draft({percent: 100})).percent).toBeUndefined();
    });

    it('не принимает дробный процент', () => {
        expect(validate(draft({percent: '12.5'})).percent).toBeTruthy();
    });

    it('не принимает отрицательный остаток, но разрешает ноль', () => {
        expect(validate(draft({totalNumberUses: -1})).totalNumberUses).toBeTruthy();
        expect(validate(draft({totalNumberUses: 0})).totalNumberUses).toBeUndefined();
    });
});

describe('toPayload', () => {
    it('приводит строки формы к числам, а код к заглавным', () => {
        expect(toPayload({name: ' x-1 ', percent: '15', totalNumberUses: '20', personalNumberUses: '2'}))
            .toEqual({name: 'X-1', percent: 15, totalNumberUses: 20, personalNumberUses: 2});
    });
});

describe('toDraft и isDirty', () => {
    const promo = {id: 1, name: 'A1', percent: 10, totalNumberUses: 5, personalNumberUses: 0};

    it('без промокода отдаёт заготовку', () => {
        expect(toDraft(null)).toEqual(BLANK);
    });

    it('не считает изменением ту же величину строкой', () => {
        expect(isDirty(toDraft(promo), promo)).toBe(false);
        expect(isDirty({...toDraft(promo), percent: '10'}, promo)).toBe(false);
    });

    it('замечает настоящую правку', () => {
        expect(isDirty({...toDraft(promo), percent: 11}, promo)).toBe(true);
    });
});

describe('sortPromos', () => {
    it('уводит исчерпанные вниз, остальные по алфавиту', () => {
        const list = [
            {id: 1, name: 'ZETA', totalNumberUses: 5},
            {id: 2, name: 'ALPHA', totalNumberUses: 0},
            {id: 3, name: 'BETA', totalNumberUses: 3}
        ];

        expect(sortPromos(list).map((promo) => promo.name)).toEqual(['BETA', 'ZETA', 'ALPHA']);
    });

    it('переживает пустой список', () => {
        expect(sortPromos(null)).toEqual([]);
    });
});

describe('usesLeftTitle', () => {
    it('пишет «Исчерпан» на нуле', () => {
        expect(usesLeftTitle({totalNumberUses: 0})).toBe('Исчерпан');
    });

    it('показывает остаток с разделителями разрядов', () => {
        expect(usesLeftTitle({totalNumberUses: 1200})).toMatch(/осталось/);
    });
});
