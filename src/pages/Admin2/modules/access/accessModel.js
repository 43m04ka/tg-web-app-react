const DAY_MS = 24 * 60 * 60 * 1000;
const HOUR_MS = 60 * 60 * 1000;
const MINUTE_MS = 60 * 1000;

export const agoTitle = (value, now = Date.now()) => {
    const time = Date.parse(value);
    if (!Number.isFinite(time)) return '—';

    const gap = now - time;
    if (gap < 2 * MINUTE_MS) return 'только что';
    if (gap < HOUR_MS) return `${Math.round(gap / MINUTE_MS)} мин назад`;
    if (gap < DAY_MS) return `${Math.round(gap / HOUR_MS)} ч назад`;

    return `${Math.round(gap / DAY_MS)} дн назад`;
};

export const leftTitle = (value, now = Date.now()) => {
    const time = Date.parse(value);
    if (!Number.isFinite(time)) return '—';

    const gap = time - now;
    if (gap <= 0) return 'истёк';
    if (gap < HOUR_MS) return `${Math.round(gap / MINUTE_MS)} мин`;
    if (gap < DAY_MS) return `${Math.round(gap / HOUR_MS)} ч`;

    return `${Math.round(gap / DAY_MS)} дн`;
};

export const sortSessions = (list) => (list || []).slice().sort((left, right) => {
    if (left.current !== right.current) return left.current ? -1 : 1;

    return Date.parse(right.lastSeenAt) - Date.parse(left.lastSeenAt);
});

export const otherCount = (list) => (list || []).filter((item) => !item.current).length;

export const adminTitle = (admin) => {
    const name = String(admin?.name || '').trim();
    const username = String(admin?.username || '').trim();

    if (username && name) return `@${username} · ${name}`;
    if (username) return `@${username}`;
    if (name) return name;

    return `Чат ${admin?.chatId}`;
};

export const toggleChatId = (list, chatId) => {
    const current = list || [];

    return current.includes(chatId)
        ? current.filter((item) => item !== chatId)
        : current.concat(chatId);
};
