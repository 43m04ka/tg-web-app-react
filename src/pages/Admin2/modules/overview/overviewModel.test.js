import {
    alarmCount,
    attentionRows,
    barHeights,
    dayLabel,
    moneyTitle,
    moscowDay,
    percentTitle,
    rangeQuery
} from './overviewModel';

describe('moscowDay', () => {
    it('считает день со сдвигом, а не по UTC', () => {
        expect(moscowDay('2026-09-09T23:30:00.000Z')).toBe('2026-09-10');
        expect(moscowDay('2026-09-09T20:59:00.000Z')).toBe('2026-09-09');
    });
});

describe('rangeQuery', () => {
    it('включает сегодняшний день', () => {
        expect(rangeQuery(7, new Date('2026-09-10T12:00:00.000Z')))
            .toEqual({from: '2026-09-04', to: '2026-09-10'});
    });

    it('на один день даёт совпадающие границы', () => {
        const query = rangeQuery(1, new Date('2026-09-10T12:00:00.000Z'));

        expect(query.from).toBe(query.to);
    });
});

describe('barHeights', () => {
    it('считает высоту от самого высокого дня', () => {
        const bars = barHeights([{day: 'a', revenue: 100}, {day: 'b', revenue: 50}, {day: 'c', revenue: 0}]);

        expect(bars.map((bar) => bar.height)).toEqual([100, 50, 2]);
    });

    it('на пустом периоде не делит на ноль', () => {
        expect(barHeights([{day: 'a', revenue: 0}]).map((bar) => bar.height)).toEqual([2]);
        expect(barHeights(null)).toEqual([]);
    });

    it('переживает нечисловую выручку', () => {
        const bars = barHeights([{day: 'a', revenue: null}, {day: 'b', revenue: '80'}]);

        expect(bars[0].value).toBe(0);
        expect(bars[1].value).toBe(80);
    });
});

describe('подписи', () => {
    it('переводит день в человеческий вид', () => {
        expect(dayLabel('2026-09-10')).toBe('10.09');
        expect(dayLabel('')).toBe('');
    });

    it('отличает ноль от отсутствия данных', () => {
        expect(percentTitle(null)).toBe('—');
        expect(percentTitle(undefined)).toBe('—');
        expect(percentTitle(0)).toBe('0%');
        expect(percentTitle(0.256)).toBe('26%');

        expect(moneyTitle(null)).toBe('—');
        expect(moneyTitle(0)).toBe('0 ₽');
        expect(moneyTitle(1234)).toMatch(/1.234/);
    });
});

describe('attentionRows', () => {
    it('на пустом ответе даёт нули, а не пропуски', () => {
        const rows = attentionRows(undefined);

        expect(rows).toHaveLength(4);
        expect(rows.every((row) => row.count === 0)).toBe(true);
    });

    it('в тревожные попадают три строки из четырёх', () => {
        const attention = {
            paidNotCompleted: 2,
            payoutErrors: 1,
            paidWithoutContact: 3,
            awaitingPayment: 10
        };

        expect(alarmCount(attention)).toBe(6);
    });
});
