export const MAINTENANCE_SECTIONS = [
    {id: 'main', title: 'Главная и каталоги', hint: 'Витрины PS и Xbox, списки каталогов, карточки товаров', paths: ['/main', '/catalog', '/card']},
    {id: 'steam', title: 'Пополнение Steam', hint: 'Отдельная витрина Steam и её заказы', paths: ['/steam']},
    {id: 'services', title: 'Сервисы', hint: 'Витрина услуг', paths: ['/services']},
    {id: 'subscription', title: 'Подписки', hint: 'Выбор тарифа Game Pass, PS Plus, EA Play', paths: ['/subscription']},
    {id: 'search', title: 'Поиск', hint: 'Поиск по товарам', paths: ['/search']},
    {id: 'basket', title: 'Корзина и оформление', hint: 'Закрывает покупку, не закрывая просмотр', paths: ['/basket', '/checkout']},
    {id: 'favorites', title: 'Избранное', hint: 'Сохранённые товары покупателя', paths: ['/favorites']},
    {id: 'history', title: 'История заказов', hint: 'Список прошлых заказов покупателя', paths: ['/history']},
    {id: 'more', title: 'Ещё', hint: 'Раздел с информационными блоками', paths: ['/more']}
];

const SECTION_IDS = new Set(MAINTENANCE_SECTIONS.map((section) => section.id));

const covers = (pathname, path) => pathname === path || pathname.startsWith(`${path}/`);

export const sectionIdOf = (pathname) => {
    const clean = String(pathname || '').split('?')[0];

    return MAINTENANCE_SECTIONS
        .find((section) => section.paths.some((path) => covers(clean, path)))?.id || null;
};

export const sectionTitleOf = (id) =>
    MAINTENANCE_SECTIONS.find((section) => section.id === id)?.title || null;

export const normalizeSections = (raw) => {
    const source = raw && typeof raw === 'object' && !Array.isArray(raw) ? raw : {};

    return Object.entries(source).reduce((picked, [id, item]) => {
        if (!SECTION_IDS.has(id)) return picked;

        if (item !== true && item?.enabled !== true) return picked;

        const until = typeof item?.until === 'string' && item.until.trim() ? item.until : null;
        picked[id] = {enabled: true, until};

        return picked;
    }, {});
};

export const closedSection = (pathname, sections) => {
    const id = sectionIdOf(pathname);
    if (!id) return null;

    const state = normalizeSections(sections)[id];
    if (!state) return null;

    return {id, title: sectionTitleOf(id), until: state.until};
};

export const closedCount = (sections) => Object.keys(normalizeSections(sections)).length;

const startOfDay = (stamp) => {
    const date = new Date(stamp);
    date.setHours(0, 0, 0, 0);

    return date.getTime();
};

const timeLabel = (stamp) =>
    new Date(stamp).toLocaleString('ru-RU', {hour: '2-digit', minute: '2-digit'});

const dayLabel = (target, now) => {
    const days = Math.round((startOfDay(target) - startOfDay(now)) / 86400000);

    if (days <= 0) return 'сегодня';
    if (days === 1) return 'завтра';

    return new Date(target).toLocaleString('ru-RU', {day: 'numeric', month: 'long'});
};

export const remainingOf = (until, now = Date.now()) => {
    if (!until) return null;

    const target = new Date(until).getTime();
    if (Number.isNaN(target) || target - now <= 0) return null;

    const totalMinutes = Math.round((target - now) / 60000);
    const hours = Math.floor(totalMinutes / 60);
    const minutes = totalMinutes % 60;

    const parts = [];
    if (hours > 0) parts.push(`${hours} ч`);
    if (minutes > 0 || hours === 0) parts.push(`${minutes} мин`);

    return {at: `${dayLabel(target, now)} в ${timeLabel(target)}`, left: parts.join(' ')};
};
