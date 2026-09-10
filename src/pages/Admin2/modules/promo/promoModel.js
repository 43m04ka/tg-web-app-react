export const CODE_PATTERN = /^[A-Za-z0-9_-]{2,32}$/;

export const BLANK = {
    name: '',
    percent: 10,
    totalNumberUses: 100,
    personalNumberUses: 0
};

const asInteger = (value) => {
    const number = Number(String(value).trim());
    return Number.isInteger(number) ? number : null;
};

export const normalizeCode = (value) => String(value || '').trim().toUpperCase();

export const isExhausted = (promo) => Number(promo?.totalNumberUses) <= 0;

export const usesLeftTitle = (promo) => {
    const left = Number(promo?.totalNumberUses);
    if (!Number.isFinite(left) || left <= 0) return 'Исчерпан';

    return `${left.toLocaleString('ru-RU')} осталось`;
};

export const percentTitle = (promo) => {
    const percent = Number(promo?.percent);
    return Number.isFinite(percent) ? `${percent}%` : '—';
};

export const validate = (draft, {existing = [], id = null} = {}) => {
    const errors = {};

    const code = normalizeCode(draft.name);
    if (!code) errors.name = 'Без кода промокод не найдут';
    else if (!CODE_PATTERN.test(code)) errors.name = 'Латиница, цифры, дефис и подчёркивание, от 2 до 32 знаков';
    else if (existing.some((item) => item.id !== id && normalizeCode(item.name) === code)) {
        errors.name = 'Такой код уже заведён';
    }

    const percent = asInteger(draft.percent);
    if (percent === null) errors.percent = 'Только целое число';
    else if (percent < 1 || percent > 100) errors.percent = 'От 1 до 100';

    const total = asInteger(draft.totalNumberUses);
    if (total === null) errors.totalNumberUses = 'Только целое число';
    else if (total < 0) errors.totalNumberUses = 'Не может быть отрицательным';

    const personal = asInteger(draft.personalNumberUses);
    if (personal === null) errors.personalNumberUses = 'Только целое число';
    else if (personal < 0) errors.personalNumberUses = 'Не может быть отрицательным';

    return errors;
};

export const toPayload = (draft) => ({
    name: normalizeCode(draft.name),
    percent: asInteger(draft.percent) ?? 0,
    totalNumberUses: asInteger(draft.totalNumberUses) ?? 0,
    personalNumberUses: asInteger(draft.personalNumberUses) ?? 0
});

export const toDraft = (promo) => (promo ? {
    name: promo.name ?? '',
    percent: promo.percent ?? 0,
    totalNumberUses: promo.totalNumberUses ?? 0,
    personalNumberUses: promo.personalNumberUses ?? 0
} : {...BLANK});

export const isDirty = (draft, promo) => {
    const base = toDraft(promo);

    return Object.keys(base).some((field) => String(base[field]) !== String(draft[field]));
};

export const sortPromos = (list) => (list || []).slice().sort((left, right) => {
    const exhausted = Number(isExhausted(left)) - Number(isExhausted(right));
    if (exhausted !== 0) return exhausted;

    return normalizeCode(left.name).localeCompare(normalizeCode(right.name), 'ru');
});

export const usageTitle = (summary) => {
    const used = Number(summary?.used) || 0;
    const tail = used % 10;
    const hundred = used % 100;

    if (used === 0) return 'ни разу не применяли';
    if (tail === 1 && hundred !== 11) return `${used} применение`;
    if (tail >= 2 && tail <= 4 && (hundred < 12 || hundred > 14)) return `${used} применения`;

    return `${used} применений`;
};

export const moneyTitle = (value) => {
    if (value === null || value === undefined || value === '') return '—';

    const number = Number(value);
    return Number.isFinite(number) ? `${number.toLocaleString('ru-RU')} ₽` : '—';
};

export const dayTitle = (value) => {
    const time = Date.parse(value);
    return Number.isFinite(time) ? new Date(time).toLocaleDateString('ru-RU') : '—';
};
