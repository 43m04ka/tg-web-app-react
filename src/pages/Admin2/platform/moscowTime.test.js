import {formatMoscow, fromMoscowInput, parseMoscow, toMoscowInput} from './moscowTime';

const NOW = new Date('2026-09-10T09:00:00Z');

test('строка без пояса читается как московское время', () => {
    expect(parseMoscow('2026-09-10T17:00:00.000').toISOString()).toBe('2026-09-10T14:00:00.000Z');
});

test('ISO с поясом показывается по Москве', () => {
    expect(formatMoscow('2026-09-10T14:00:00.000Z', NOW)).toBe('10 сентября, 17:00 МСК');
});

test('другой год выводится явно', () => {
    expect(formatMoscow('2027-01-02T09:05:00Z', NOW)).toBe('2 января 2027, 12:05 МСК');
});

test('поле ввода туда и обратно по Москве', () => {
    expect(fromMoscowInput('2026-09-10T17:00')).toBe('2026-09-10T14:00:00.000Z');
    expect(toMoscowInput('2026-09-10T14:00:00.000Z')).toBe('2026-09-10T17:00');
});

test('пустое и мусор не ломают', () => {
    expect(formatMoscow('')).toBe('');
    expect(formatMoscow('когда-нибудь')).toBe('');
    expect(fromMoscowInput('')).toBe('');
});
