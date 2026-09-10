const HOUR = 60 * 60 * 1000;
const SHIFT = 3 * HOUR;
const HAS_ZONE = /(Z|[+-]\d{2}:?\d{2})$/i;
const DATE_ONLY = /^\d{4}-\d{2}-\d{2}$/;

const MONTHS = [
    'января', 'февраля', 'марта', 'апреля', 'мая', 'июня',
    'июля', 'августа', 'сентября', 'октября', 'ноября', 'декабря'
];

const pad = (value) => String(value).padStart(2, '0');

export const parseMoscow = (value) => {
    if (value === null || value === undefined || value === '') return null;

    if (typeof value === 'number') {
        const date = new Date(value);
        return Number.isNaN(date.getTime()) ? null : date;
    }

    const text = String(value).trim();
    const full = DATE_ONLY.test(text)
        ? `${text}T00:00:00+03:00`
        : HAS_ZONE.test(text) ? text : `${text}+03:00`;

    const date = new Date(full);
    return Number.isNaN(date.getTime()) ? null : date;
};

const moscowParts = (date) => {
    const shifted = new Date(date.getTime() + SHIFT);

    return {
        year: shifted.getUTCFullYear(),
        month: shifted.getUTCMonth(),
        day: shifted.getUTCDate(),
        hours: shifted.getUTCHours(),
        minutes: shifted.getUTCMinutes()
    };
};

export const toMoscowInput = (value) => {
    const date = parseMoscow(value);
    if (!date) return '';

    const part = moscowParts(date);
    return `${part.year}-${pad(part.month + 1)}-${pad(part.day)}T${pad(part.hours)}:${pad(part.minutes)}`;
};

export const fromMoscowInput = (text) => {
    if (!text) return '';

    const value = String(text).trim();
    const withSeconds = /T\d{2}:\d{2}$/.test(value) ? `${value}:00` : value;
    const date = new Date(`${withSeconds}+03:00`);

    return Number.isNaN(date.getTime()) ? '' : date.toISOString();
};

export const formatMoscow = (value, now = new Date()) => {
    const date = parseMoscow(value);
    if (!date) return '';

    const part = moscowParts(date);
    const year = part.year === moscowParts(now).year ? '' : ` ${part.year}`;

    return `${part.day} ${MONTHS[part.month]}${year}, ${pad(part.hours)}:${pad(part.minutes)} МСК`;
};
