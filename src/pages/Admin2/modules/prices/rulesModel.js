export const PLATFORMS = [
    {
        id: 'ps',
        title: 'PlayStation',
        commission: false,
        source: 'Цена источника в лирах',
    },
    {
        id: 'india',
        title: 'PS Индия',
        commission: true,
        source: 'Цена источника в рупиях',
    },
    {
        id: 'xbox',
        title: 'Xbox',
        commission: true,
        source: 'Цена источника в валюте региона',
    },
];

export const platformById = (id) => PLATFORMS.find((item) => item.id === id) || PLATFORMS[0];

export const TYPE_OPTIONS = [
    {value: 'MULTIPLIER', title: 'множитель'},
    {value: 'FIXED', title: 'фиксированная'},
];

export const FALLBACK_MULTIPLIER = 3;

const num = (value) => {
    const parsed = Number(String(value ?? '').replace(',', '.'));
    return Number.isFinite(parsed) ? parsed : NaN;
};

let localSeq = 0;

export const rowFrom = (rule) => ({
    key: rule?.id ? `saved-${rule.id}` : `local-${(localSeq += 1)}`,
    id: rule?.id ?? null,
    min: rule?.min ?? '',
    max: rule?.max ?? '',
    type: rule?.type || 'MULTIPLIER',
    value: rule?.value ?? '',
    commission: rule?.commission ?? '',
});

export const rowsFrom = (rules) => (rules || [])
    .slice()
    .sort((left, right) => Number(left.min) - Number(right.min))
    .map(rowFrom);

export const emptyRow = (rows) => {
    const last = rows[rows.length - 1];
    const from = last && Number.isFinite(num(last.max)) ? num(last.max) : '';

    return {...rowFrom(null), min: from === '' ? '' : String(from)};
};

export const toRules = (rows, withCommission) => rows.map((row) => {
    const rule = {
        min: num(row.min),
        max: num(row.max),
        type: row.type,
        value: num(row.value),
    };

    if (withCommission) rule.commission = Number.isFinite(num(row.commission)) ? num(row.commission) : 0;

    return rule;
});

export const rowProblems = (row, withCommission) => {
    const problems = {};
    const min = num(row.min);
    const max = num(row.max);
    const value = num(row.value);

    if (!Number.isFinite(min)) problems.min = 'нужно число';
    else if (min < 0) problems.min = 'не меньше нуля';

    if (!Number.isFinite(max)) problems.max = 'нужно число';
    else if (Number.isFinite(min) && max <= min) problems.max = 'больше, чем «от»';

    if (!Number.isFinite(value)) problems.value = 'нужно число';
    else if (value <= 0) problems.value = 'больше нуля';

    if (withCommission && row.commission !== '' && !Number.isFinite(num(row.commission))) {
        problems.commission = 'нужно число';
    }

    return problems;
};

export const checkRows = (rows, withCommission) => {
    const perRow = rows.map((row) => rowProblems(row, withCommission));
    const overlaps = new Set();
    const gaps = [];

    const ordered = rows
        .map((row, index) => ({index, min: num(row.min), max: num(row.max)}))
        .filter((item) => Number.isFinite(item.min) && Number.isFinite(item.max) && item.max > item.min)
        .sort((left, right) => left.min - right.min);

    ordered.forEach((item, position) => {
        const next = ordered[position + 1];
        if (!next) return;

        if (next.min < item.max) {
            overlaps.add(item.index);
            overlaps.add(next.index);
        } else if (next.min > item.max) {
            gaps.push({from: item.max, to: next.min});
        }
    });

    const hasErrors = perRow.some((item) => Object.keys(item).length > 0) || overlaps.size > 0;

    return {perRow, overlaps, gaps, hasErrors};
};

export const applyRules = (raw, rules) => {
    const value = num(raw);
    if (!Number.isFinite(value) || value <= 0) return null;

    const rule = rules.find((item) => value > item.min && value <= item.max);

    let result = rule
        ? (rule.type === 'FIXED' ? rule.value : value * rule.value)
        : value * FALLBACK_MULTIPLIER;

    if (rule && Number.isFinite(rule.commission)) result += rule.commission;

    return {
        price: Math.ceil(result / 5) * 5,
        rule: rule || null,
        fallback: !rule,
    };
};

const sameRule = (left, right) => left.min === right.min
    && left.max === right.max
    && left.type === right.type
    && left.value === right.value
    && (left.commission ?? 0) === (right.commission ?? 0);

export const diffRules = (saved, rows, withCommission) => {
    const before = rowsFrom(saved);
    const beforeById = new Map(before.map((row) => [row.id, row]));

    const drafts = toRules(rows, withCommission);
    const savedRules = toRules(before, withCommission);

    let added = 0;
    let changed = 0;

    rows.forEach((row, index) => {
        const origin = row.id === null ? null : beforeById.get(row.id);

        if (!origin) {
            added += 1;
            return;
        }

        const originIndex = before.findIndex((item) => item.id === row.id);
        if (!sameRule(drafts[index], savedRules[originIndex])) changed += 1;
    });

    const keptIds = new Set(rows.map((row) => row.id).filter((id) => id !== null));
    const removed = before.filter((row) => !keptIds.has(row.id)).length;

    return {added, changed, removed, total: added + changed + removed};
};

export const diffText = ({added, changed, removed}) => {
    const parts = [];

    if (changed) parts.push(`${changed} изменено`);
    if (added) parts.push(`${added} добавлено`);
    if (removed) parts.push(`${removed} удалено`);

    return parts.join(', ');
};
