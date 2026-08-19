// Справочники полей страницы. Вынесены из экрана, потому что нужны и списку, и форме:
// импорт формы из списка и списка из формы замкнул бы модули друг на друга.
//
// Список типов витрины теперь ведётся здесь: на бэке колонка перестала быть ENUM
// (см. migrations/schema.sql), и новый тип не требует миграции.

/** type — что за витрина. Определяет парсер и сетку наценки для каталогов страницы */
export const TYPE_OPTIONS = [
    {key: 'ps', name: 'PlayStation'},
    {key: 'xbox', name: 'Xbox'},
    {key: 'ps_india', name: 'PlayStation Индия'},
    {key: 'steam', name: 'Steam'},
    // Оплата как у ps/xbox — обычная покупка позиций из каталога.
    // Особый режим есть только у ps_india (пересчёт рупий) и у Steam (пополнение баланса).
    {key: 'services', name: 'Сервисы'},
    {key: 'other', name: 'Без полей'},
];

/**
 * Витрины, у которых нет карусели и тела: страница ведёт на внешний сервис
 * (Steam — пополнение баланса) или собирается не блоками.
 */
export const TYPES_WITHOUT_STRUCTURE = ['steam', 'services'];

export const hasStructure = (type) => !TYPES_WITHOUT_STRUCTURE.includes(type);

/**
 * Куда вести из «Страниц», если у витрины нет блоков.
 *
 * Путь абсолютный намеренно: панель структуры отрисована внутри маршрута `pages`,
 * и относительный navigate('steam') увёл бы на /admin-panel/pages/steam.
 */
export const STRUCTURELESS_SECTIONS = {
    steam: {label: 'Steam', path: '/admin-panel/steam'},
    services: {label: 'Сервисы', path: '/admin-panel/services'},
};

/** botType — площадка, в которой страница показывается покупателю */
export const BOT_OPTIONS = [
    {key: 'tg', name: 'Telegram'},
    {key: 'vk-xbox', name: 'VK Xbox'},
    {key: 'vk-ps', name: 'VK PS'},
    {key: 'web', name: 'Веб'},
];

export const typeName = (key) => TYPE_OPTIONS.find((option) => option.key === key)?.name || key || '—';
export const botName = (key) => BOT_OPTIONS.find((option) => option.key === key)?.name || key || '—';
