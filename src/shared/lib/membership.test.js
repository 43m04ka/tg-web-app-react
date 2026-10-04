import {memberPrice, membershipBadge, membershipOffers, membershipPlaque, offerKind} from './membership';

const catalogOffer = {
    branding: 'PS_PLUS',
    kind: 'UPSELL_PS_PLUS_GAME_CATALOG',
    tier: 'Subscribe to PlayStation Plus Extra to access this game and hundreds more in the Game Catalogue',
    price: 0,
    basePrice: 1749,
    discountText: 'Included'
};

const trialOffer = {
    branding: 'PS_PLUS',
    kind: 'UPSELL_PS_PLUS_TRIAL',
    tier: 'Subscribe to PlayStation Plus Deluxe to play a 2-hour full game trial',
    price: 0,
    basePrice: 0
};

const eaDiscount = {
    branding: 'EA_ACCESS',
    kind: 'UPSELL_EA_ACCESS_DISCOUNT',
    tier: 'Save 10% with EA Play',
    price: 3600,
    basePrice: 4000,
    priceRub: 10080,
    discountText: '-10%'
};

test('пробная версия не выдаётся за бесплатную игру', () => {
    expect(offerKind(trialOffer)).toBe('trial');
    expect(membershipBadge({subscriptionOffers: [trialOffer]})).toBeNull();

    const plaque = membershipPlaque({subscriptionOffers: [trialOffer]});
    expect(plaque.title).toBe('Пробная версия в PS Plus Deluxe');
    expect(plaque.note).toBe('2 часа полной игры бесплатно');
});

test('игра из каталога Extra получает значок и плашку с уровнями', () => {
    const product = {price: 4900, subscriptionOffers: [catalogOffer, trialOffer]};

    expect(membershipBadge(product)).toEqual({brand: 'psplus', kind: 'included', label: 'в PS Plus'});
    expect(membershipPlaque(product).title).toBe('Входит в PS Plus Extra и Deluxe');
});

test('скидка EA Play показывается процентом', () => {
    const product = {price: 11200, subscriptionOffers: [eaDiscount]};

    expect(membershipBadge(product)).toEqual({brand: 'eaplay', kind: 'discount', label: '−10% EA Play'});
    expect(membershipPlaque(product).title).toBe('Скидка 10% по подписке EA Play');
    expect(memberPrice(product)).toEqual({value: 10080, brand: 'eaplay', name: 'EA Play', percent: 10, label: 'с EA Play'});
    expect(memberPrice({...product, price: 9000})).toBeNull();
});

test('игра месяца с прошедшей датой больше не считается бесплатной', () => {
    const monthly = {branding: 'PS_PLUS', kind: 'UPSELL_PS_PLUS_FREE', price: 0, endTime: Date.UTC(2026, 9, 6, 8)};

    expect(membershipOffers({subscriptionOffers: [monthly]}, Date.UTC(2026, 9, 7))).toEqual([]);
    expect(membershipPlaque({subscriptionOffers: [monthly]}, Date.UTC(2026, 9, 4)).note).toMatch(/^Игра месяца — заберите до 6 октября/);
});

test('GTA+ и метка листинга с уровнем распознаются', () => {
    const gta = {branding: 'GTA_PLUS', kind: 'LISTING_UPSELL', tier: 'Included', price: null, basePrice: 349.5};
    const listing = {branding: 'PS_PLUS', kind: 'LISTING_UPSELL', tier: 'Deluxe', price: null, basePrice: 1450};

    expect(membershipBadge({subscriptionOffers: [gta]}).label).toBe('в GTA+');
    expect(membershipPlaque({subscriptionOffers: [listing]}).title).toBe('Входит в PS Plus Deluxe');
});

test('неизвестные бренды и пустые данные пропускаются', () => {
    expect(membershipBadge({subscriptionOffers: null})).toBeNull();
    expect(membershipBadge({subscriptionOffers: [{branding: 'NONE', kind: 'X', price: 0}]})).toBeNull();
});
