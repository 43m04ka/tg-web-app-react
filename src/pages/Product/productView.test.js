import {buildChips, localizeFeature, promotionEnd, promotionLabel} from './productView';

test('условная бессрочная скидка не превращается в таймер на сотни лет', () => {
    for (const raw of ['02/08/2799 23:59:59', String(Date.UTC(2799, 1, 8)), '9999-12-31T00:00:00Z', 'неизвестно', null]) {
        expect(promotionEnd({endDatePromotion: raw})).toBe(null);
        expect(promotionLabel({endDatePromotion: raw})).toBe(null);
    }
    const actual = new Date('2026-11-15T23:59:59Z');
    expect(promotionEnd({endDatePromotion: String(actual.getTime())})).toEqual(actual);
    expect(promotionEnd({endDatePromotion: actual.toISOString()})).toEqual(actual);
});

test('возможности Xbox переводятся с сохранением диапазона игроков и неизвестных значений', () => {
    expect(localizeFeature('Xbox local co-op (2-2)')).toBe('Локальная совместная игра (2-2)');
    expect(localizeFeature('Online co-op (2-2)')).toBe('Совместная игра по сети (2-2)');
    expect(localizeFeature('Xbox local multiplayer (2-2)')).toBe('Локальная многопользовательская игра (2-2)');
    expect(localizeFeature('Xbox One X Enhanced')).toBe('Улучшено для Xbox One X');
    expect(localizeFeature('4K Ultra HD')).toBe('4K Ultra HD');
    expect(buildChips({bubbles: ['7.59 GB', 'Xbox One X Enhanced']})).toEqual(['7.59 ГБ', 'Улучшено для Xbox One X']);
});
