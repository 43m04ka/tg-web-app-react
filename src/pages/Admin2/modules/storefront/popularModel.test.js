import {alreadyAdded, byPlatform, movePopular, popularProblem, popularTitle} from './popularModel';

const list = [
    {id: 1, platform: 'tg', productId: 10, serialNumber: 1, product: {name: 'A', onSale: true, isHidden: false}},
    {id: 2, platform: 'web', productId: 11, serialNumber: 0, product: {name: 'B', onSale: true, isHidden: false}},
    {id: 3, platform: 'tg', productId: 12, serialNumber: 0, product: null}
];

describe('byPlatform', () => {
    it('фильтрует по площадке и держит порядок', () => {
        expect(byPlatform(list, 'tg').map((item) => item.id)).toEqual([3, 1]);
        expect(byPlatform(list, 'web').map((item) => item.id)).toEqual([2]);
    });

    it('для пустой площадки отдаёт пустой список', () => {
        expect(byPlatform(list, 'vk-ps')).toEqual([]);
        expect(byPlatform(null, 'tg')).toEqual([]);
    });
});

describe('movePopular', () => {
    it('переставляет и перенумеровывает', () => {
        const rows = byPlatform(list, 'tg');
        const moved = movePopular(rows, 1, -1);

        expect(moved.map((item) => item.id)).toEqual([1, 3]);
        expect(moved.map((item) => item.serialNumber)).toEqual([0, 1]);
    });

    it('за край не переставляет', () => {
        const rows = byPlatform(list, 'tg');

        expect(movePopular(rows, 3, -1)).toBeNull();
        expect(movePopular(rows, 99, 1)).toBeNull();
    });
});

describe('popularProblem', () => {
    it('называет причину, по которой позиция не дойдёт до покупателя', () => {
        expect(popularProblem({product: {onSale: true, isHidden: false}})).toBeNull();
        expect(popularProblem({product: null})).toMatch(/удалён/);
        expect(popularProblem({product: {onSale: true, isHidden: true}})).toMatch(/скрыт/);
        expect(popularProblem({product: {onSale: false, isHidden: false}})).toMatch(/продажи/);
    });
});

describe('popularTitle', () => {
    it('падает на номер товара, когда карточки нет', () => {
        expect(popularTitle({product: {name: 'A'}, productId: 5})).toBe('A');
        expect(popularTitle({product: null, productId: 5})).toMatch(/№5/);
    });
});

describe('alreadyAdded', () => {
    it('ловит повтор по паре площадка и товар', () => {
        expect(alreadyAdded(list, 'tg', 10)).toBe(true);
        expect(alreadyAdded(list, 'tg', '10')).toBe(true);
        expect(alreadyAdded(list, 'web', 10)).toBe(false);
        expect(alreadyAdded(null, 'tg', 10)).toBe(false);
    });
});
