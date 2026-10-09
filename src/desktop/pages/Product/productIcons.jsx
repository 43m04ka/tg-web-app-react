import React from 'react';

const stroke = {
    fill: 'none',
    stroke: 'currentColor',
    strokeWidth: 2,
    strokeLinecap: 'round',
    strokeLinejoin: 'round'
};

const GAMEPAD = 'M7.5 8h9a4 4 0 0 1 3.9 3.2l.8 4.3a2.4 2.4 0 0 1-4.1 2.1L15.5 16h-7l-1.6 1.6a2.4 2.4 0 0 1-4.1-2.1l.8-4.3A4 4 0 0 1 7.5 8Z';

const ICONS = {
    check: <path d="m5 12.5 4.5 4.5L19 7.5" strokeWidth="3"/>,
    player: (
        <>
            <circle cx="12" cy="8" r="3.6"/>
            <path d="M5 20c.8-3.6 3.6-5.6 7-5.6s6.2 2 7 5.6"/>
        </>
    ),
    players: (
        <>
            <circle cx="9" cy="8.5" r="3.2"/>
            <path d="M2.8 19.5c.6-3.2 3-5 6.2-5s5.6 1.8 6.2 5M15.5 5.6a3 3 0 0 1 0 5.8M17.5 14.7c2 .5 3.4 2.1 3.8 4.8"/>
        </>
    ),
    couch: (
        <>
            <path d="M5 11V8.5A2.5 2.5 0 0 1 7.5 6h9A2.5 2.5 0 0 1 19 8.5V11"/>
            <path d="M3 12.5a1.5 1.5 0 0 1 3 0V14h12v-1.5a1.5 1.5 0 0 1 3 0V17a1.5 1.5 0 0 1-1.5 1.5h-15A1.5 1.5 0 0 1 3 17v-4.5ZM6 18.5V20M18 18.5V20"/>
        </>
    ),
    online: (
        <>
            <circle cx="12" cy="12" r="8.5"/>
            <path d="M3.5 12h17M12 3.5c2.4 2.4 3.6 5.2 3.6 8.5s-1.2 6.1-3.6 8.5c-2.4-2.4-3.6-5.2-3.6-8.5s1.2-6.1 3.6-8.5Z"/>
        </>
    ),
    plus: (
        <>
            <rect x="3.5" y="3.5" width="17" height="17" rx="4.5"/>
            <path d="M12 8v8M8 12h8"/>
        </>
    ),
    offline: (
        <>
            <path d="M2.5 9a14 14 0 0 1 4.3-2.7M10.6 5.6A14 14 0 0 1 21.5 9M5.6 12.4a9 9 0 0 1 3.6-2M14.9 10.6a9 9 0 0 1 3.5 1.8M8.9 15.6a4.5 4.5 0 0 1 6.2 0M3.5 3.5l17 17"/>
            <circle cx="12" cy="19" r="1" fill="currentColor" stroke="none"/>
        </>
    ),
    remote: (
        <>
            <rect x="3" y="4.5" width="18" height="12" rx="2.5"/>
            <path d="M8.5 20h7M12 16.5V20"/>
            <path d="m10.5 8.3 4 2.2-4 2.2Z" fill="currentColor"/>
        </>
    ),
    purchase: <path d="M5.5 8h13l-1 11.2a2 2 0 0 1-2 1.8h-7a2 2 0 0 1-2-1.8L5.5 8ZM9 10V7a3 3 0 0 1 6 0v3"/>,
    controller: (
        <>
            <path d={GAMEPAD}/>
            <path d="M8 10.8v3M6.5 12.3h3"/>
            <circle cx="15.8" cy="11.4" r=".9" fill="currentColor" stroke="none"/>
            <circle cx="17.4" cy="13.2" r=".9" fill="currentColor" stroke="none"/>
        </>
    ),
    vibration: (
        <>
            <path d={GAMEPAD}/>
            <path d="M8 10.8v3M6.5 12.3h3M8.5 4.2c1.2-.9 2.3-.9 3.5 0s2.3.9 3.5 0"/>
            <circle cx="15.8" cy="11.4" r=".9" fill="currentColor" stroke="none"/>
            <circle cx="17.4" cy="13.2" r=".9" fill="currentColor" stroke="none"/>
        </>
    ),
    boost: <path d="M13 2.8 5.5 13.2h6l-1 8 7.5-10.4h-6l1-8Z"/>,
    speed: (
        <>
            <path d="M4.2 17a8.5 8.5 0 1 1 15.6 0M12 14l3.5-4.5"/>
            <circle cx="12" cy="14" r="1.4" fill="currentColor" stroke="none"/>
        </>
    ),
    display: (
        <>
            <rect x="2.5" y="4.5" width="19" height="12.5" rx="2.5"/>
            <path d="M8.5 20.5h7M12 17v3.5"/>
        </>
    ),
    rays: (
        <>
            <circle cx="12" cy="12" r="3.5"/>
            <path d="M12 3v2M12 19v2M3 12h2M19 12h2M5.6 5.6 7 7M17 17l1.4 1.4M5.6 18.4 7 17M17 7l1.4-1.4"/>
        </>
    ),
    trophy: <path d="M8 4h8v5.5a4 4 0 0 1-8 0V4ZM8 6H5v1a3 3 0 0 0 3 3M16 6h3v1a3 3 0 0 1-3 3M12 13.5V17M8.5 20h7l-.8-3H9.3l-.8 3Z"/>,
    cloud: <path d="M7 18.5h10a4 4 0 0 0 .6-8 5.5 5.5 0 0 0-10.6-1.2A4.6 4.6 0 0 0 7 18.5Z"/>,
    devices: (
        <>
            <rect x="2.5" y="5" width="13" height="9.5" rx="2"/>
            <rect x="17" y="8.5" width="4.5" height="11" rx="1.5"/>
            <path d="M9 14.5V18M6 18h6"/>
        </>
    ),
    split: (
        <>
            <rect x="3" y="4.5" width="18" height="15" rx="2.5"/>
            <path d="M12 4.5v15"/>
        </>
    ),
    keyboard: (
        <>
            <rect x="2.5" y="6.5" width="19" height="11" rx="2.5"/>
            <path d="M6.5 10h1M10.5 10h1M14.5 10h1M8 14h8"/>
        </>
    ),
    sound: <path d="M4 9.5h3l4.5-4v13l-4.5-4H4a1 1 0 0 1-1-1v-3a1 1 0 0 1 1-1ZM15.5 9a4 4 0 0 1 0 6M18.5 6.5a7.5 7.5 0 0 1 0 11"/>,
    leaf: <path d="M5 19c0-8 5-13.5 14.5-14 .3 9.5-5.5 14-12 14ZM5 19c3-4 6-6.5 9.5-8"/>,
    storage: (
        <>
            <rect x="3.5" y="13" width="17" height="6.5" rx="2"/>
            <path d="m5.5 13 2.2-7a1.6 1.6 0 0 1 1.5-1h5.6a1.6 1.6 0 0 1 1.5 1l2.2 7"/>
            <circle cx="16.5" cy="16.25" r=".9" fill="currentColor" stroke="none"/>
        </>
    ),
    language: <path d="M4 5.5h16a1 1 0 0 1 1 1V16a1 1 0 0 1-1 1h-9l-4.5 3v-3H4a1 1 0 0 1-1-1V6.5a1 1 0 0 1 1-1ZM9 14l3-6.5 3 6.5M10 12h4"/>,
    vr: <path d="M3.5 9.5A2.5 2.5 0 0 1 6 7h12a2.5 2.5 0 0 1 2.5 2.5v5A2.5 2.5 0 0 1 18 17h-2.8l-1.7-2.2a1.8 1.8 0 0 0-3 0L8.8 17H6a2.5 2.5 0 0 1-2.5-2.5v-5Z"/>,
    camera: (
        <>
            <path d="M4 8.5A1.5 1.5 0 0 1 5.5 7h2.2l1.5-2h5.6l1.5 2h2.2A1.5 1.5 0 0 1 20 8.5v9a1.5 1.5 0 0 1-1.5 1.5h-13A1.5 1.5 0 0 1 4 17.5v-9Z"/>
            <circle cx="12" cy="12.5" r="3.3"/>
        </>
    ),
    pin: (
        <>
            <path d="M12 21s-6.5-5.6-6.5-11a6.5 6.5 0 0 1 13 0c0 5.4-6.5 11-6.5 11Z"/>
            <circle cx="12" cy="10" r="2.4"/>
        </>
    ),
    tag: (
        <>
            <path d="M3.5 12.2V5A1.5 1.5 0 0 1 5 3.5h7.2a1.5 1.5 0 0 1 1 .4l7.4 7.4a1.5 1.5 0 0 1 0 2.1l-7.2 7.2a1.5 1.5 0 0 1-2.1 0l-7.4-7.4a1.5 1.5 0 0 1-.4-1Z"/>
            <circle cx="8.2" cy="8.2" r="1.3" fill="currentColor" stroke="none"/>
        </>
    ),
    publisher: <path d="M4.5 20.5V6A1.5 1.5 0 0 1 6 4.5h7A1.5 1.5 0 0 1 14.5 6v14.5M14.5 10H18a1.5 1.5 0 0 1 1.5 1.5v9M3 20.5h18M8 8.5h3M8 12h3M8 15.5h3"/>,
    box: <path d="m12 3.5 8 4v9l-8 4-8-4v-9l8-4ZM4 7.5l8 4 8-4M12 11.5v9"/>,
    clock: (
        <>
            <circle cx="12" cy="12" r="8.5"/>
            <path d="M12 7.5V12l3 2"/>
        </>
    ),
    calendar: (
        <>
            <rect x="3.5" y="5" width="17" height="15.5" rx="2.5"/>
            <path d="M3.5 10h17M8 3v4M16 3v4"/>
        </>
    )
};

const FEATURE_RULES = [
    ['vr', /\bVR\b|VR2|румскейл|^(сидя|стоя)|гарнитур|стереоскопическ/i],
    ['camera', /camera|камер/i],
    ['controller', /PS Move|навигаци|прицеливани|геймпад|game ?pad/i],
    ['plus', /PS Plus\s*[-–—]|обязательно для игры в сети/i],
    ['offline', /автономн|offline/i],
    ['remote', /дистанционн|remote play/i],
    ['purchase', /покупки в игре|purchases/i],
    ['vibration', /вибрац|триггерн|dualsense|dualshock|haptic/i],
    ['speed', /кадров|\bfps\b|частота обновлени|refresh rate/i],
    ['boost', /\bpro\b|улучшенн|улучшени|оптимизирован|optimized|enhanced|интеллектуальная доставка|smart delivery/i],
    ['rays', /трассировк|ray ?tracing/i],
    ['display', /\b4K\b|HDR|ultra hd|8K/i],
    ['trophy', /достижени|achievement|трофе/i],
    ['cloud', /облачн|cloud/i],
    ['devices', /play anywhere|разных поколений|кроссплатформ|cross-?platform|cross-?gen/i],
    ['split', /разделенн|split/i],
    ['keyboard', /клавиатур|keyboard/i],
    ['sound', /звучани|звук|atmos|dts|spatial sound|audio/i],
    ['leaf', /экономичн|energy/i],
    ['storage', /^\d+(?:[.,]\d+)?\s*(?:GB|ГБ|MB|МБ|TB|ТБ)$/i],
    ['players', /присутстви|presence|клуб|club/i],
    ['couch', /локальн|local|общий экран/i],
    ['online', /в сети|по сети|онлайн|online|многопользовательск|multiplayer|co-?op|кооператив|совместн/i],
    ['player', /^(?:1|один)\s+игрок|игроков:\s*1$|single ?player|^1 player/i],
    ['players', /игрок|players?\b/i],
    ['language', /русск|английск|язык|субтитр|озвуч|english|russian/i]
];

const SPEC_ICONS = {
    'Регион активации': 'pin',
    'Жанр': 'tag',
    'Язык в игре': 'language',
    'Издатель': 'publisher',
    'Тип': 'box',
    'Срок подписки': 'clock',
    'Дата выхода': 'calendar'
};

export const featureIconName = (text) => {
    const value = String(text || '').trim();
    return FEATURE_RULES.find(([, rule]) => rule.test(value))?.[0] || 'check';
};

export const specIconName = (label) => SPEC_ICONS[label] || 'check';

const PLAYERS_ONLY = /^(?:(\d+(?:\s*[-–]\s*\d+)?)\s+игрок\S*|игроков:\s*(\d+(?:\s*[-–]\s*\d+)?))$/i;

const playersKey = (text) => {
    const match = String(text || '').trim().match(PLAYERS_ONLY);
    return match ? (match[1] || match[2]).replace(/\s/g, '').replace('–', '-') : null;
};

export const uniqueFeatures = (items) => {
    const seen = new Set();

    return items.filter((item) => {
        const key = playersKey(item);
        if (key === null) return true;
        if (seen.has(key)) return false;
        seen.add(key);
        return true;
    });
};

function RussianFlag({className}) {
    return (
        <svg className={className} viewBox="0 0 24 16" aria-hidden="true">
            <clipPath id="ru-flag">
                <rect width="24" height="16" rx="2.5"/>
            </clipPath>
            <g clipPath="url(#ru-flag)">
                <rect width="24" height="16" fill="#fff"/>
                <rect y="5.33" width="24" height="5.34" fill="#0039a6"/>
                <rect y="10.67" width="24" height="5.33" fill="#d52b1e"/>
            </g>
        </svg>
    );
}

export function FeatureMark({text, style}) {
    const name = featureIconName(text);

    if (name === 'language' && /русск/i.test(text)) {
        return (
            <span className={`${style.featureMark} ${style.featureMarkPlain}`} aria-hidden="true">
                <RussianFlag className={style.featureFlag}/>
            </span>
        );
    }

    if (name === 'plus') {
        return (
            <span className={`${style.featureMark} ${style.featureMarkPlain}`} aria-hidden="true">
                <span className={style.featurePsPlus}/>
            </span>
        );
    }

    return (
        <span className={style.featureMark} aria-hidden="true">
            <ProductGlyph name={name} className={style.featureGlyph}/>
        </span>
    );
}

export function ProductGlyph({name, className}) {
    return (
        <svg className={className} viewBox="0 0 24 24" aria-hidden="true" {...stroke}>
            {ICONS[name] || ICONS.check}
        </svg>
    );
}
