import {
    conversionTitle,
    customerTitle,
    dayTitle,
    loyaltyTitle,
    loyaltyTone,
    moneyTitle
} from './customersModel';

describe('customerTitle', () => {
    it('показывает имя с собакой, но не дважды', () => {
        expect(customerTitle({username: 'vasya'})).toBe('@vasya');
        expect(customerTitle({username: '@vasya'})).toBe('@vasya');
    });

    it('без имени падает на чат, потом на номер', () => {
        expect(customerTitle({chatId: '123'})).toBe('id 123');
        expect(customerTitle({id: 7})).toBe('Покупатель №7');
        expect(customerTitle({username: '   ', id: 7})).toBe('Покупатель №7');
    });
});

describe('loyaltyTitle', () => {
    it('считает по оплаченным, а не по оформлениям', () => {
        expect(loyaltyTitle({orders: 0, paidOrders: 0})).toBe('Заказов не было');
        expect(loyaltyTitle({orders: 5, paidOrders: 0})).toBe('Оформлял, но не платил');
        expect(loyaltyTitle({orders: 1, paidOrders: 1})).toBe('Одна покупка');
        expect(loyaltyTitle({orders: 4, paidOrders: 3})).toBe('Возвращается');
        expect(loyaltyTitle({orders: 9, paidOrders: 7})).toBe('Постоянный');
    });
});

describe('loyaltyTone', () => {
    it('помечает тревожным того, кто оформлял и не платил', () => {
        expect(loyaltyTone({orders: 3, paidOrders: 0})).toBe('warning');
    });

    it('нового покупателя тревожным не считает', () => {
        expect(loyaltyTone({orders: 0, paidOrders: 0})).toBe('neutral');
    });

    it('постоянного отмечает положительно', () => {
        expect(loyaltyTone({orders: 9, paidOrders: 7})).toBe('positive');
    });
});

describe('conversionTitle', () => {
    it('не делит на ноль', () => {
        expect(conversionTitle({orders: 0, paidOrders: 0})).toBe('—');
        expect(conversionTitle(null)).toBe('—');
    });

    it('считает долю дошедших до оплаты', () => {
        expect(conversionTitle({orders: 4, paidOrders: 1})).toBe('25%');
    });
});

describe('подписи', () => {
    it('отличают ноль от отсутствия данных', () => {
        expect(moneyTitle(0)).toBe('0 ₽');
        expect(moneyTitle(null)).toBe('—');
    });

    it('нечитаемую дату не показывают как Invalid Date', () => {
        expect(dayTitle('чепуха')).toBe('—');
        expect(dayTitle('2026-09-10T00:00:00.000Z')).toMatch(/2026/);
    });
});
