import {applySubscriptionPricing, hasSubscriptionDiscount} from './subscriptionPricing';
import {buildPlan} from '../../pages/Subscription/subscriptionModel';
import {buildQuote} from '../../pages/Basket/quoteLocal';

const product = {id: 37742, type: 'SUBSCRIPTION', name: 'PlayStation Plus Deluxe', price: 9390, oldPrice: 13990,
    choiceRow: '12 месяцев', choiceColumn: 'Deluxe', onSale: true, count: 1};

test('цена подписки, цена за месяц и итог корзины переключаются вместе', () => {
    const regular = applySubscriptionPricing(product, false);
    const plan = buildPlan([regular], {catalogPath: 'ps_tur_psplus'});
    expect(plan.tiers[0].periods[0].price).toBe(13990);
    expect(plan.tiers[0].periods[0].perMonth).toBe(1166);
    expect(plan.tiers[0].periods[0].oldPrice).toBeNull();
    expect(buildQuote({items: [regular], pageType: 'ps'}).total).toBe(13990);
    const discounted = applySubscriptionPricing(regular, true);
    expect(discounted.price).toBe(9390);
    expect(discounted.oldPrice).toBe(13990);
    expect(buildQuote({items: [discounted], pageType: 'ps'}).total).toBe(9390);
    expect(product.price).toBe(9390);
});

test('игры, другие подписки и тарифы без акции не дорожают', () => {
    const game = {...product, type: 'GAME', name: 'Игра'};
    const ea = {...product, name: 'EA Play'};
    const month = {...product, price: 2300, oldPrice: null, choiceRow: '1 месяц'};
    expect(applySubscriptionPricing(game, false)).toBe(game);
    expect(applySubscriptionPricing(ea, false)).toBe(ea);
    expect(applySubscriptionPricing(month, false).price).toBe(2300);
    expect(hasSubscriptionDiscount(month)).toBe(false);
});
