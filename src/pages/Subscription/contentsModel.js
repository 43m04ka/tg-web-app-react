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

const BENEFIT_SECTIONS = {
    'Каталог игр': 'catalog',
    'Каталог игр EA': 'catalog',
    'Ubisoft+ Classics': 'ubisoft',
    'Игры месяца': 'monthly',
    'Каталог классики': 'classics',
    'Пробные версии игр': 'trials',
    'Пробные версии новинок': 'trials',
    'Игры Rockstar': 'games'
};

export const sectionOfBenefit = (info, benefit) => {
    const key = BENEFIT_SECTIONS[benefit];
    return key && (info?.sections || []).some((section) => section.key === key && section.games?.length) ? key : null;
};

const tierRank = (key) => PS_RANK[key] || 0;

export const gameCatalog = (info) => {
    const tiers = info?.tiers || [];
    const byKey = new Map();

    for (const section of info?.sections || []) {
        for (const game of section.games || []) {
            const key = game.productId || game.name;
            const entry = byKey.get(key) || {game, sections: [], minTier: null};

            if (!entry.sections.some((item) => item.key === section.key)) {
                entry.sections.push({key: section.key, title: section.title, tier: section.tier});
            }
            if (!entry.minTier || tierRank(section.tier) < tierRank(entry.minTier)) entry.minTier = section.tier;
            if (!entry.game.availableUntil && game.availableUntil) entry.game = {...entry.game, availableUntil: game.availableUntil};

            byKey.set(key, entry);
        }
    }

    const nameOf = (key) => tiers.find((tier) => tier.key === key)?.name?.replace(/^PS Plus\s+/i, '') || key;

    return [...byKey.values()].map((entry) => ({...entry, minTierName: nameOf(entry.minTier)}));
};

export const isIncluded = (entry, tierKey) => {
    const rank = PS_RANK[tierKey];
    if (!rank) return true;
    return tierRank(entry.minTier) <= rank;
};

export const filterCatalog = (entries, {tierKey, status = 'all', section = 'all', query = ''}) => entries.filter((entry) => {
    if (section !== 'all' && !entry.sections.some((item) => item.key === section)) return false;
    if (status === 'in' && !isIncluded(entry, tierKey)) return false;
    if (status === 'out' && isIncluded(entry, tierKey)) return false;
    return matchesQuery(entry.game, query);
});

export const catalogSummary = (entries, tierKey) => {
    const included = entries.filter((entry) => isIncluded(entry, tierKey)).length;
    return {total: entries.length, included, excluded: entries.length - included};
};
