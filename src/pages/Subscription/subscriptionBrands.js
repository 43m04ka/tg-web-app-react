const BRANDS = [
    {
        key: 'psplus',
        match: ['psplus', 'ps plus', 'playstation plus'],
        name: 'PlayStation Plus',
        accent: '#2E6FF2',
        includes: [
            'Сетевая игра и облачные сохранения',
            'Ежемесячные игры и эксклюзивные скидки',
            'Каталог игр Extra и Deluxe при выборе тарифа'
        ],
        tiers: {
            essential: {accent: '#3BA55D', tagline: 'Онлайн и игры месяца'},
            extra: {accent: '#E0A03A', tagline: 'Каталог сотен игр'},
            deluxe: {accent: '#D2B356', tagline: 'Классика и пробные версии'}
        }
    },
    {
        key: 'gamepass',
        match: ['gamepass', 'game pass', 'gamepss'],
        name: 'Xbox Game Pass',
        accent: '#2FA84F',
        includes: [
            'Сотни игр на консоли, ПК и в облаке',
            'Новинки студий Xbox в день релиза',
            'EA Play и мультиплеер включены'
        ],
        tiers: {}
    },
    {
        key: 'eaplay',
        match: ['eaplay', 'ea play', 'ea access'],
        name: 'EA Play',
        accent: '#F2622E',
        includes: [
            'Каталог игр EA',
            'Ранний доступ к новинкам',
            'Скидка на покупки в EA'
        ],
        tiers: {}
    },
    {
        key: 'ubisoft',
        match: ['ubisoft', 'ubi+'],
        name: 'Ubisoft+',
        accent: '#1E8FE0',
        includes: [],
        tiers: {}
    },
    {
        key: 'gtaplus',
        match: ['gtaplus', 'gta+', 'gta plus'],
        name: 'GTA+',
        accent: '#E6A32B',
        includes: [],
        tiers: {}
    }
];

const FALLBACK = {
    key: 'other',
    name: 'Подписка',
    accent: '#7A5CFF',
    includes: [],
    tiers: {}
};

const normalize = (value) => String(value || '').toLowerCase().replace(/[_\-.]+/g, ' ');

export const brandOf = (sources) => {
    for (const source of [].concat(sources).filter(Boolean)) {
        const text = normalize(source);
        const found = BRANDS.find((brand) => brand.match.some((token) => text.includes(token)));
        if (found) return found;
    }

    return FALLBACK;
};

export const tierStyleOf = (brand, tierName) => {
    const text = normalize(tierName);
    const found = Object.entries(brand.tiers || {})
        .find(([token]) => text.includes(token));

    return found ? found[1] : null;
};
