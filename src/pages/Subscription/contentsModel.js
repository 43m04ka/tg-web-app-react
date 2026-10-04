const PS_RANK = {essential: 1, extra: 2, deluxe: 3};
const CYRILLIC = /[а-яё]/i;

const normalize = (value) => String(value || '').toLowerCase().replace(/premium/g, 'deluxe');

export const tierInfoOf = (info, tierName) => {
    const tiers = info?.tiers || [];
    if (!tiers.length) return null;

    const name = normalize(tierName);
    const found = tiers.find((tier) => name.includes(tier.key) || normalize(tier.name).includes(name));
    return found || (tiers.length === 1 ? tiers[0] : null);
};

export const sectionsFor = (info, tierKey) => {
    const sections = (info?.sections || []).filter((section) => section.games?.length);
    const rank = PS_RANK[tierKey];
    if (!rank) return sections;

    return sections.filter((section) => (PS_RANK[section.tier] || 0) <= rank);
};

export const russianText = (value) => (CYRILLIC.test(String(value || '')) ? String(value).trim() : null);

export const thumb = (url) => {
    if (!url) return null;
    if (!/image\.api\.playstation\.com/.test(url) || url.includes('?')) return url;
    return `${url}?w=240&thumb=false`;
};

export const matchesQuery = (game, query) => {
    const needle = String(query || '').trim().toLowerCase();
    return !needle || String(game.name || '').toLowerCase().includes(needle);
};
