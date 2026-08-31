import {request} from './client';

const cache = new Map();
const pending = new Map();

const normalize = (list) => (Array.isArray(list) ? list : [])
    .map((rule) => ({
        min: Number(rule.min),
        max: Number(rule.max),
        type: rule.type === 'FIXED' ? 'FIXED' : 'MULTIPLIER',
        value: Number(rule.value),
        commission: Number(rule.commission) || 0
    }))
    .filter((rule) => Number.isFinite(rule.min) && Number.isFinite(rule.max) && Number.isFinite(rule.value))
    .sort((first, second) => first.min - second.min);

export const peekPriceRules = (platform) => cache.get(platform) || null;

export const loadPriceRules = (platform) => {
    const ready = cache.get(platform);
    if (ready) return Promise.resolve(ready);

    const inFlight = pending.get(platform);
    if (inFlight) return inFlight;

    const task = request(`/api/parsing/price-rules/${platform}`, {retries: 1})
        .then((list) => {
            const rules = normalize(list);
            pending.delete(platform);

            if (rules.length === 0) throw new Error('Пустые правила пересчёта');

            cache.set(platform, rules);
            return rules;
        })
        .catch((error) => {
            pending.delete(platform);
            throw error;
        });

    pending.set(platform, task);

    return task;
};
