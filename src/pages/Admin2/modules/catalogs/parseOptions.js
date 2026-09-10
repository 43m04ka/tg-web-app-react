export const PS_FILTER_TYPES = [
    {value: 'FULL_GAME', label: 'Полная игра'},
    {value: 'GAME_BUNDLE', label: 'Бандл'},
    {value: 'PREMIUM_EDITION', label: 'Премиум-издание'},
    {value: 'ADD-ON_PACK', label: 'Дополнение'},
    {value: 'LEVEL', label: 'Уровень'},
    {value: 'OTHER', label: 'Прочее'},
];

export const PS_FILTER_PLATFORMS = ['PS4', 'PS5'];

export const PS_SORT_OPTIONS = [
    {value: 'default', title: 'По умолчанию'},
    {value: 'sales30', title: 'По продажам за 30 дней'},
    {value: 'downloads30', title: 'По загрузкам за 30 дней'},
    {value: 'productName', title: 'По названию'},
    {value: 'productReleaseDate', title: 'По дате выхода'},
];

export const XBOX_FILTER_GROUPS = [
    {
        key: 'PlayWith',
        label: 'Платформы',
        choices: [
            {value: 'XboxSeriesX|S', label: 'Xbox Series X|S'},
            {value: 'XboxOne', label: 'Xbox One'},
            {value: 'PC', label: 'PC'},
            {value: 'Handheld', label: 'Handheld'},
            {value: 'CloudGaming', label: 'Cloud Gaming'},
            {value: 'XboxPlayAnywhere', label: 'Xbox Play Anywhere'},
        ],
    },
    {
        key: 'Price',
        label: 'Цены',
        choices: [
            {value: 'OnSale', label: 'Со скидкой'},
            {value: '0', label: 'Бесплатные'},
            {value: '0.01To5', label: 'До $5'},
            {value: '5To10', label: '$5–$10'},
            {value: '10To20', label: '$10–$20'},
            {value: '20To40', label: '$20–$40'},
            {value: '40To60', label: '$40–$60'},
            {value: '60To', label: '$60+'},
        ],
    },
    {
        key: 'IncludedInSubscription',
        label: 'Подписки',
        choices: [
            {value: 'CFQ7TTC0KHS0', label: 'Game Pass Ultimate'},
            {value: 'CFQ7TTC0P85B', label: 'Game Pass Premium'},
            {value: 'CFQ7TTC0K5DJ', label: 'Game Pass Essential'},
            {value: 'CFQ7TTC0K6L8', label: 'Game Pass for Console'},
            {value: 'CFQ7TTC0KGQ8', label: 'Game Pass for PC'},
            {value: 'CFQ7TTC0K5DH', label: 'EA Play'},
            {value: 'CFQ7TTC0QH5H', label: 'Ubisoft+'},
        ],
    },
    {
        key: 'Genre',
        label: 'Жанр',
        choices: [
            {value: 'Action & adventure', label: 'Экшен и приключения'},
            {value: 'Card & board', label: 'Карточные и настольные'},
            {value: 'Casino', label: 'Казино'},
            {value: 'Classics', label: 'Классика'},
            {value: 'Companion', label: 'Companion'},
            {value: 'Educational', label: 'Образовательные'},
            {value: 'Family & kids', label: 'Семейные и детские'},
            {value: 'Fighting', label: 'Файтинги'},
            {value: 'Multi-Player Online Battle Arena', label: 'MOBA'},
            {value: 'Music', label: 'Музыкальные'},
            {value: 'Other', label: 'Прочее'},
            {value: 'Platformer', label: 'Платформеры'},
            {value: 'Puzzle & trivia', label: 'Головоломки и викторины'},
            {value: 'Racing & flying', label: 'Гонки и полёты'},
            {value: 'Role playing', label: 'Ролевые'},
            {value: 'Shooter', label: 'Шутеры'},
            {value: 'Simulation', label: 'Симуляторы'},
            {value: 'Sports', label: 'Спорт'},
            {value: 'Strategy', label: 'Стратегии'},
            {value: 'Tools', label: 'Инструменты'},
            {value: 'Word', label: 'Словесные'},
        ],
    },
];

export const XBOX_DEFAULT_SORT = 'DO_NOT_FILTER';

export const XBOX_SORT_OPTIONS = [
    {value: XBOX_DEFAULT_SORT, title: 'По релевантности'},
    {value: 'ReleaseDate desc', title: 'Сначала новые'},
    {value: 'MostPopular desc', title: 'Самые популярные'},
    {value: 'Price asc', title: 'Цена: по возрастанию'},
    {value: 'Price desc', title: 'Цена: по убыванию'},
    {value: 'WishlistCountTotal desc', title: 'Больше всего в списках желаний'},
    {value: 'DiscountPercentage desc', title: 'Скидка: по убыванию'},
    {value: 'Title Asc', title: 'Название: А-Я'},
    {value: 'Title Desc', title: 'Название: Я-А'},
];

export const XBOX_PRESETS = [
    {key: 'all', label: 'Общий', filters: {}, sort: XBOX_DEFAULT_SORT},
    {key: 'sale', label: 'Скидки', filters: {Price: ['OnSale']}, sort: 'DiscountPercentage desc'},
    {key: 'console', label: 'Консоли', filters: {PlayWith: ['XboxSeriesX|S', 'XboxOne']}, sort: XBOX_DEFAULT_SORT},
    {key: 'pc', label: 'ПК', filters: {PlayWith: ['PC']}, sort: XBOX_DEFAULT_SORT},
];

export const emptyXboxFilters = () => ({PlayWith: [], Price: [], IncludedInSubscription: [], Genre: []});

export const XBOX_LIMIT_MODES = [
    {value: 'all', title: 'Весь каталог'},
    {value: 'pages', title: 'Страницами'},
    {value: 'items', title: 'Позициями'},
];

export const XBOX_LIMIT_HINTS = {
    all: 'Пока каталог не кончится, по 25 товаров на страницу',
    pages: 'По 25 товаров на страницу — сколько из них попадёт в каталог, заранее неизвестно',
    items: 'Считаются только позиции, реально попавшие в каталог. Бесплатные игры витрина отдаёт с ценой 0 и в счёт не идут',
};
