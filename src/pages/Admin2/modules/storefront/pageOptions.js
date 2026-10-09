export const TYPE_OPTIONS = [
    {value: 'ps', title: 'PlayStation'},
    {value: 'xbox', title: 'Xbox'},
    {value: 'ps_india', title: 'PlayStation Индия'},
    {value: 'steam', title: 'Steam'},
    {value: 'services', title: 'Сервисы'},
    {value: 'other', title: 'Без полей'},
];

export const TYPES_WITHOUT_STRUCTURE = ['steam', 'services'];

export const hasStructure = (type) => !TYPES_WITHOUT_STRUCTURE.includes(type);

export const PRICING_NOTES = {
    ps_india: 'Цены пересчитываются из рупий по своей сетке.',
    steam: 'Отдельный поток заказа: пополнение баланса, а не покупка позиций.',
    services: 'Оплата как у PlayStation и Xbox, но витрина собирается брендами, а не блоками.',
};

export const MAIN_TYPE = 'main';

export const isMainPage = (page) => page?.type === MAIN_TYPE;

export const typeName = (value) => (value === MAIN_TYPE
    ? 'Первая страница сайта'
    : TYPE_OPTIONS.find((option) => option.value === value)?.title || value || '—');

export const sortPages = (list) => (list || []).slice()
    .sort((left, right) => (left.serialNumber ?? 0) - (right.serialNumber ?? 0) || left.id - right.id);
