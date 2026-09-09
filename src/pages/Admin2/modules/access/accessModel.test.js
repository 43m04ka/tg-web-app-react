import {agoTitle, leftTitle, otherCount, sortSessions} from './accessModel';

const NOW = Date.parse('2026-09-11T12:00:00Z');

describe('agoTitle', () => {
    it('свежую активность называет «только что»', () => {
        expect(agoTitle('2026-09-11T11:59:00Z', NOW)).toBe('только что');
    });

    it('дальше считает минутами, часами и днями', () => {
        expect(agoTitle('2026-09-11T11:30:00Z', NOW)).toMatch(/30 мин/);
        expect(agoTitle('2026-09-11T06:00:00Z', NOW)).toMatch(/6 ч/);
        expect(agoTitle('2026-09-08T12:00:00Z', NOW)).toMatch(/3 дн/);
    });

    it('на мусоре ставит прочерк, а не «Invalid Date»', () => {
        expect(agoTitle('чепуха', NOW)).toBe('—');
        expect(agoTitle(null, NOW)).toBe('—');
    });
});

describe('leftTitle', () => {
    it('прошедший срок называет истёкшим', () => {
        expect(leftTitle('2026-09-11T11:00:00Z', NOW)).toBe('истёк');
    });

    it('оставшийся считает по крупности', () => {
        expect(leftTitle('2026-09-11T12:30:00Z', NOW)).toMatch(/30 мин/);
        expect(leftTitle('2026-09-18T12:00:00Z', NOW)).toMatch(/7 дн/);
    });
});

describe('sortSessions', () => {
    it('текущий вход держит первым, даже если он самый старый', () => {
        const list = [
            {id: 1, current: false, lastSeenAt: '2026-09-11T10:00:00Z'},
            {id: 2, current: true, lastSeenAt: '2026-09-01T10:00:00Z'},
            {id: 3, current: false, lastSeenAt: '2026-09-11T11:00:00Z'}
        ];

        expect(sortSessions(list).map((item) => item.id)).toEqual([2, 3, 1]);
    });

    it('переживает пустой список', () => {
        expect(sortSessions(null)).toEqual([]);
    });
});

describe('otherCount', () => {
    it('считает входы без текущего', () => {
        expect(otherCount([{current: true}, {current: false}, {current: false}])).toBe(2);
        expect(otherCount([])).toBe(0);
        expect(otherCount(null)).toBe(0);
    });
});
