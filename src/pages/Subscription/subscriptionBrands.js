const DELUXE_DOT = 'linear-gradient(135deg, #16120c 8%, #F0C463 92%)';

const DELUXE_THEME = {
    base: '#17130D',
    edge: '#4A3512',
    ink: '#F3CB74',
    text: '#F0C463',
    ring: 'rgba(240, 196, 99, 0.5)',
    glow: 'rgba(232, 179, 60, 0.42)',
    isLight: false
};

const BRANDS = [
    {
        key: 'psplus',
        match: ['psplus', 'ps plus', 'playstation plus'],
        name: 'PlayStation Plus',
        accent: '#0070D1',
        includes: [
            'Сетевая игра и облачные сохранения',
            'Ежемесячные игры и эксклюзивные скидки',
            'Каталог игр Extra и Deluxe при выборе тарифа'
        ],
        tiers: {
            essential: {
                accent: '#C9CFD9',
                dot: 'linear-gradient(135deg, #EEF1F5, #8E97A6)',
                tagline: 'Онлайн и игры месяца'
            },
            extra: {
                accent: '#E8B33C',
                dot: 'linear-gradient(135deg, #F7D77A, #C98D22)',
                tagline: 'Каталог сотен игр'
            },
            deluxe: {accent: '#F0C463', dot: DELUXE_DOT, theme: DELUXE_THEME, tagline: 'Классика и пробные версии'},
            premium: {accent: '#F0C463', dot: DELUXE_DOT, theme: DELUXE_THEME, tagline: 'Классика и пробные версии'}
        }
    },
    {
        key: 'gamepass',
        match: ['gamepass', 'game pass', 'gamepss'],
        name: 'Xbox Game Pass',
        accent: '#13A10E',
        includes: [
            'Сотни игр на консоли, ПК и в облаке',
            'Новинки студий Xbox в день релиза',
            'EA Play и мультиплеер включены'
        ],
        tiers: {
            ultimate: {accent: '#13A10E', tagline: 'Консоль, ПК и облако'},
            standard: {accent: '#3FA83F', tagline: 'Каталог на консоли'},
            core: {accent: '#5CB85C', tagline: 'Онлайн и базовый каталог'},
            pc: {accent: '#2E8B57', tagline: 'Каталог для ПК'}
        }
    },
    {
        key: 'eaplay',
        match: ['eaplay', 'ea play', 'ea access'],
        name: 'EA Play',
        accent: '#FF4747',
        includes: [
            'Каталог игр EA',
            'Ранний доступ к новинкам',
            'Скидка на покупки в EA'
        ],
        tiers: {
            pro: {accent: '#C6262E', tagline: 'Полные издания и ранний доступ'}
        }
    },
    {
        key: 'ubisoft',
        match: ['ubisoft', 'ubi+'],
        name: 'Ubisoft+',
        accent: '#0082C3',
        includes: [],
        tiers: {}
    },
    {
        key: 'gtaplus',
        match: ['gtaplus', 'gta+', 'gta plus'],
        name: 'GTA+',
        accent: '#F2A93B',
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
