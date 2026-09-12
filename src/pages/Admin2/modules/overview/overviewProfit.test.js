import {periodTitle, profitSlice} from './overviewModel';

const report = {
    totals: {profit: 400, profitOrders: 2, profitRevenue: 2000, noCostOrders: 1, paidOrders: 3},
    byPlatform: [
        {platform: 'tg', profit: 300, profitOrders: 1, profitRevenue: 1000, noCostOrders: 1, paidOrders: 2},
        {platform: 'web', profit: 100, profitOrders: 1, profitRevenue: 1000, noCostOrders: 0, paidOrders: 1}
    ]
};

describe('profitSlice', () => {
    it('без площадки берёт общий итог и считает маржу', () => {
        expect(profitSlice(report)).toMatchObject({profit: 400, margin: 0.2});
    });

    it('с площадкой берёт её строку', () => {
        expect(profitSlice(report, 'web')).toMatchObject({profit: 100, noCostOrders: 0, margin: 0.1});
    });

    it('площадка без заказов даёт нули, а не падение', () => {
        expect(profitSlice(report, 'vk')).toMatchObject({profit: 0, profitOrders: 0, margin: null});
    });

    it('без отчёта ничего не возвращает', () => {
        expect(profitSlice(null)).toBeNull();
    });
});

describe('periodTitle', () => {
    it('для своего периода пишет даты', () => {
        expect(periodTitle({days: null}, {from: '2026-09-01', to: '2026-09-12'})).toBe('01.09–12.09');
        expect(periodTitle({days: 7}, {})).toBe('7 дней');
    });
});
