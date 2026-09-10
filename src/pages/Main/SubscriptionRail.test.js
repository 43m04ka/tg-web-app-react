import {railTiers} from './SubscriptionRail';

const product = (id, column, row, price) => ({
    id,
    type: 'SUBSCRIPTION',
    name: 'PlayStation Plus',
    choiceColumn: column,
    choiceRow: row,
    price,
    serialNumber: id,
    onSale: true
});

describe('railTiers', () => {
    it('сворачивает сроки в категории, а не показывает каждый товар', () => {
        const tiers = railTiers([
            product(1, 'Essential', '1 месяц', 1500),
            product(2, 'Essential', '3 месяца', 3600),
            product(3, 'Essential', '12 месяцев', 7700),
            product(4, 'Extra', '1 месяц', 2000),
            product(5, 'Extra', '12 месяцев', 11990),
            product(6, 'Deluxe', '1 месяц', 2300)
        ], {catalogPath: 'ps_tur_psplus'});

        expect(tiers.map((tier) => tier.name)).toEqual(['Essential', 'Extra', 'Deluxe']);
        expect(tiers[0].periods).toHaveLength(3);
    });

    it('одна категория со многими сроками даёт одну плитку', () => {
        const tiers = railTiers([
            product(1, 'Старый аккаунт', '1 месяц', 2100),
            product(2, 'Старый аккаунт', '3 месяца', 4000),
            product(3, 'Старый аккаунт', '11 месяцев', 9800)
        ], {catalogPath: 'xbox_us_gamepass'});

        expect(tiers).toHaveLength(1);
        expect(tiers[0].periods).toHaveLength(3);
    });

    it('цена категории берётся по самому дешёвому сроку', () => {
        const tiers = railTiers([
            product(1, 'Essential', '3 месяца', 3600),
            product(2, 'Essential', '1 месяц', 1500)
        ], {catalogPath: 'ps_tur_psplus'});

        expect(tiers[0].fromPrice).toBe(1500);
    });

    it('без подписок список пуст', () => {
        expect(railTiers([{id: 1, type: 'CODE', name: 'Код'}])).toEqual([]);
        expect(railTiers(null)).toEqual([]);
    });

    it('категории PS Plus различаются цветом', () => {
        const tiers = railTiers([
            product(1, 'Essential', '1 месяц', 1500),
            product(2, 'Extra', '1 месяц', 2000),
            product(3, 'Deluxe', '1 месяц', 2300)
        ], {catalogPath: 'ps_tur_psplus'});

        const accents = tiers.map((tier) => tier.accent);
        expect(new Set(accents).size).toBe(3);
    });
});
