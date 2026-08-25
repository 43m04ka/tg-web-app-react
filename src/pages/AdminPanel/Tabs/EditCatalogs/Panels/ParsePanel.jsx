import React, {useState} from 'react';
import TabPane from '../../../Elements/WorkTabs/TabPane';
import f, {Group, Row, Sheet} from '../../../Elements/FormLayout/FormLayout';
import s from './Panels.module.scss';
import {API_BASE_URL} from '../../../legacy/baseUrl';

const PS_FILTER_TYPES = [
    {value: 'FULL_GAME', label: 'Полная игра'},
    {value: 'GAME_BUNDLE', label: 'Бандл'},
    {value: 'PREMIUM_EDITION', label: 'Премиум-издание'},
    {value: 'ADD-ON_PACK', label: 'Дополнение'},
    {value: 'LEVEL', label: 'Уровень'},
    {value: 'OTHER', label: 'Прочее'},
];

const PS_FILTER_PLATFORMS = ['PS4', 'PS5'];

// Издания приходят обычными товарами каталога, а дополнения — скрытыми: их бывает больше,
// чем самих игр, и в общей выдаче они вытесняли бы её. Найти и вернуть их можно во вкладке
// «Товары» фильтром «Только скрытые».
const ADDONS_HINT = 'Аддоны сохраняются скрытыми и уходят в конец каталога: '
    + 'в списках витрины их нет, они видны только в блоке «Дополнения» карточки игры';

const PS_SORT_OPTIONS = [
    {value: 'default', label: 'По умолчанию'},
    {value: 'sales30', label: 'По продажам за 30 дней'},
    {value: 'downloads30', label: 'По загрузкам за 30 дней'},
    {value: 'productName', label: 'По названию'},
    {value: 'productReleaseDate', label: 'По дате выхода'},
];

// Фильтры каталога xbox.com. Идентификаторы уходят на витрину как есть, поэтому menять
// их нельзя: 'XboxSeriesXS' без вертикальной черты витрина молча игнорирует и отдаёт
// весь каталог вместо среза. Список продублирован в parsing/lib/xboxBrowse.js на бэке.
const XBOX_FILTER_GROUPS = [
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
        // Значения — Store ID самих подписок, а не их названия
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

const XBOX_DEFAULT_SORT = 'DO_NOT_FILTER';

const XBOX_SORT_OPTIONS = [
    {value: XBOX_DEFAULT_SORT, label: 'По релевантности'},
    {value: 'ReleaseDate desc', label: 'Сначала новые'},
    {value: 'MostPopular desc', label: 'Самые популярные'},
    {value: 'Price asc', label: 'Цена: по возрастанию'},
    {value: 'Price desc', label: 'Цена: по убыванию'},
    {value: 'WishlistCountTotal desc', label: 'Больше всего в списках желаний'},
    {value: 'DiscountPercentage desc', label: 'Скидка: по убыванию'},
    {value: 'Title Asc', label: 'Название: А-Я'},
    {value: 'Title Desc', label: 'Название: Я-А'},
];

// У xbox.com каталог один, «Консоли» и «ПК» — его срезы по фильтрам, а не отдельные разделы
const XBOX_CATALOG_PRESETS = [
    {key: 'all', label: 'Общий', filters: {}, sort: XBOX_DEFAULT_SORT},
    {key: 'sale', label: 'Скидки', filters: {Price: ['OnSale']}, sort: 'DiscountPercentage desc'},
    {key: 'console', label: 'Консоли', filters: {PlayWith: ['XboxSeriesX|S', 'XboxOne']}, sort: XBOX_DEFAULT_SORT},
    {key: 'pc', label: 'ПК', filters: {PlayWith: ['PC']}, sort: XBOX_DEFAULT_SORT},
];

const emptyXboxFilters = () => ({PlayWith: [], Price: [], IncludedInSubscription: [], Genre: []});

// Чем ограничиваем парс каталога Xbox
const XBOX_LIMIT_MODES = [
    {key: 'all', label: 'Весь каталог'},
    {key: 'pages', label: 'Страницами'},
    {key: 'items', label: 'Позициями'},
];

const XBOX_LIMIT_HINTS = {
    all: 'Пока каталог не кончится, по 25 товаров на страницу',
    pages: 'По 25 товаров на страницу — сколько из них попадёт в каталог, заранее неизвестно',
    items: 'Считаются только позиции, реально попавшие в каталог. Бесплатные игры витрина отдаёт с ценой 0 и в счёт не идут',
};

const ModeSwitch = ({value, onChange}) => (
    <div className={f.segmented}>
        <button type="button"
                className={`${f.segment} ${value === 'auto' ? f.segmentActive : ''}`}
                onClick={() => onChange('auto')}>
            Автоматически
        </button>
        <button type="button"
                className={`${f.segment} ${value === 'manual' ? f.segmentActive : ''}`}
                onClick={() => onChange('manual')}>
            Вручную
        </button>
    </div>
);

/**
 * Запуск парсинга каталога. Ручка выбирается по типу страницы (ps* → PS, иначе Xbox),
 * режим — по каталогу или по списку ссылок.
 *
 * Каталог Xbox больше не берётся с xbdeals.net: и список товаров, и фильтры приходят
 * с самой xbox.com, поэтому ссылка на источник для Xbox необязательна — нужный срез
 * задаётся фильтрами витрины.
 */
const ParsePanel = ({catalog, page, onClose}) => {
    const isPs = page?.type?.includes('ps');

    const [mode, setMode] = useState('catalog');
    const [formData, setFormData] = useState({
        catalogUrl: '', countPages: '', countItems: '', isShallow: false, promoDate: '', links: '',
        parceAddons: false, safeMode: false,
        filterTypes: [], filterPlatforms: [], sortName: 'default', sortAscending: false,
        xboxFilters: emptyXboxFilters(), xboxSort: XBOX_DEFAULT_SORT,
    });
    // Число страниц витрина теперь сообщает сама на обеих площадках
    const [pagesMode, setPagesMode] = useState('auto');
    const [xboxLimitMode, setXboxLimitMode] = useState('all');
    const [promoMode, setPromoMode] = useState(isPs ? 'auto' : 'manual');
    const [loading, setLoading] = useState(false);
    const [status, setStatus] = useState({text: '', type: ''});

    const handleChange = (field, value) => setFormData((prev) => ({...prev, [field]: value}));

    const toggleInList = (field, value) => {
        setFormData((prev) => {
            const list = prev[field];
            return {
                ...prev,
                [field]: list.includes(value) ? list.filter((v) => v !== value) : [...list, value],
            };
        });
    };

    const toggleXboxFilter = (group, value) => {
        setFormData((prev) => {
            const list = prev.xboxFilters[group] || [];
            return {
                ...prev,
                xboxFilters: {
                    ...prev.xboxFilters,
                    [group]: list.includes(value) ? list.filter((v) => v !== value) : [...list, value],
                },
            };
        });
    };

    // Пресет не «залипает»: он просто раскладывает галочки, дальше их правят руками
    const applyXboxPreset = (preset) => setFormData((prev) => ({
        ...prev,
        xboxFilters: {...emptyXboxFilters(), ...preset.filters},
        xboxSort: preset.sort,
    }));

    const xboxFilterCount = Object.values(formData.xboxFilters).reduce((sum, list) => sum + list.length, 0);

    const handleStart = async () => {
        setLoading(true);
        setStatus({text: '', type: ''});

        try {
            let endpoint;
            let payload;

            if (mode === 'catalog') {
                endpoint = isPs
                    ? `${API_BASE_URL}/api/parsing/start-parse-ps`
                    : `${API_BASE_URL}/api/parsing/start-parse-xbox`;
                payload = {
                    catalogId: formData.catalogUrl,
                    bdPath: catalog.path,
                    // У PS лимит только страницами, у Xbox их три: весь каталог,
                    // страницы или количество реально сохранённых позиций
                    countPages: isPs
                        ? (pagesMode === 'auto' ? 0 : Number(formData.countPages) || 0)
                        : (xboxLimitMode === 'pages' ? Number(formData.countPages) || 0 : 0),
                    countItems: !isPs && xboxLimitMode === 'items'
                        ? Number(formData.countItems) || 0
                        : 0,
                    isShallow: formData.isShallow,
                    platform: page.type,
                    parceAddons: formData.parceAddons,
                    // Утроенные паузы имеют смысл только при заходе в карточку
                    safeMode: !formData.isShallow && formData.safeMode,
                    endDataPromotion: promoMode === 'manual' && formData.promoDate
                        ? new Date(formData.promoDate).getTime()
                        : null,
                };

                if (isPs) {
                    const filterBy = [
                        ...formData.filterTypes.map((v) => `storeDisplayClassification:${v}`),
                        ...formData.filterPlatforms.map((v) => `targetPlatforms:${v}`),
                    ];
                    if (filterBy.length > 0) payload.filterBy = filterBy;
                    if (formData.sortName !== 'default') {
                        payload.sortBy = {name: formData.sortName, isAscending: formData.sortAscending};
                    }
                } else {
                    // Пустые группы не отправляем: на витрине это разные вещи —
                    // «фильтр не задан» и «задан пустой список»
                    const filters = {};
                    for (const [group, values] of Object.entries(formData.xboxFilters)) {
                        if (values.length > 0) filters[group] = values;
                    }
                    if (formData.xboxSort !== XBOX_DEFAULT_SORT) filters.orderby = formData.xboxSort;
                    payload.filters = filters;
                }
            } else {
                endpoint = isPs
                    ? `${API_BASE_URL}/api/parsing/parse-links-ps`
                    : `${API_BASE_URL}/api/parsing/parse-links-xbox`;
                const links = formData.links.split('\n').map((l) => l.trim()).filter(Boolean);
                // Парс по ссылкам всегда заходит в карточку — режим применим без оговорок
                payload = {
                    links, bdPath: catalog.path, platform: page.type,
                    parceAddons: formData.parceAddons, safeMode: formData.safeMode,
                };
            }

            const response = await fetch(endpoint, {
                method: 'POST',
                headers: {'Content-Type': 'application/json'},
                body: JSON.stringify(payload),
            });

            const result = await response.json();
            if (response.ok) {
                setStatus({text: result.message || 'Парсинг запущен', type: 'success'});
            } else {
                setStatus({text: result.error || 'Ошибка сервера', type: 'error'});
            }
        } catch (err) {
            setStatus({text: 'Ошибка сети', type: 'error'});
        } finally {
            setLoading(false);
        }
    };

    return (
        <TabPane
            narrow
            footer={(
                <>
                    {status.text ? (
                        <span className={`${s.status} ${status.type === 'error' ? s.statusError : s.statusOk}`}>
                            {status.text}
                        </span>
                    ) : null}
                    <button type="button" className={s.btn} onClick={onClose}>Закрыть</button>
                    <button type="button" className={`${s.btn} ${s.btnPrimary}`} disabled={loading} onClick={handleStart}>
                        {loading ? 'Запуск…' : 'Запустить парсинг'}
                    </button>
                </>
            )}
        >
            <Sheet>
                <Group>
                    <Row label="Что парсим"
                         hint={mode === 'catalog' ? 'Категорию витрины целиком' : 'Готовый список ссылок'}>
                        <div className={f.segmented}>
                            <button type="button"
                                    className={`${f.segment} ${mode === 'catalog' ? f.segmentActive : ''}`}
                                    onClick={() => setMode('catalog')}>
                                По каталогу
                            </button>
                            <button type="button"
                                    className={`${f.segment} ${mode === 'links' ? f.segmentActive : ''}`}
                                    onClick={() => setMode('links')}>
                                По ссылкам
                            </button>
                        </div>
                    </Row>
                    <Row label="Куда" hint="Каталог назначения">
                        <span className={s.readonly}>{catalog.path}</span>
                    </Row>
                    <Row label="Площадка" hint="Определяется страницей каталога">
                        <span className={s.readonly}>{page?.name} · {page?.type}</span>
                    </Row>
                </Group>

                {mode === 'catalog' ? (
                    <>
                        <Group title="Источник">
                            <Row label={isPs ? 'URL каталога' : 'URL каталога (необязательно)'} wide
                                 hint={isPs
                                     ? <>Ссылка вида <code>/category/&lt;id&gt;</code>, номер страницы в конце игнорируется</>
                                     : 'Можно вставить адрес из браузера — фильтры из него подставятся ниже. Пусто — весь каталог'}>
                                <input className={f.input} type="text"
                                       placeholder={isPs
                                           ? 'https://store.playstation.com/en-tr/category/<id>'
                                           : 'https://www.xbox.com/en-US/games/browse?Price=OnSale'}
                                       value={formData.catalogUrl}
                                       onChange={(e) => handleChange('catalogUrl', e.target.value)} />
                            </Row>

                            {isPs ? (
                                <Row label="Количество страниц"
                                     hint={pagesMode === 'auto' ? 'Вся категория целиком' : null}>
                                    <ModeSwitch value={pagesMode} onChange={(nextMode) => {
                                        setPagesMode(nextMode);
                                        if (nextMode === 'manual' && !formData.countPages) handleChange('countPages', 1);
                                    }} />
                                    {pagesMode === 'manual' ? (
                                        <input className={f.input} type="number" min="1"
                                               value={formData.countPages}
                                               onChange={(e) => handleChange('countPages', e.target.value)} />
                                    ) : null}
                                </Row>
                            ) : (
                                /* Считать страницы бессмысленно, когда каталог отсортирован
                                   по популярности: в топе много бесплатных игр, витрина
                                   отдаёт им цену 0, и в каталог они не попадают. «250 позиций»
                                   даёт 250 позиций, сколько бы страниц на это ни ушло. */
                                <Row label="Сколько парсить" wide
                                     hint={XBOX_LIMIT_HINTS[xboxLimitMode]}>
                                    <div className={f.segmented}>
                                        {XBOX_LIMIT_MODES.map((mode) => (
                                            <button type="button" key={mode.key}
                                                    className={`${f.segment} ${xboxLimitMode === mode.key ? f.segmentActive : ''}`}
                                                    onClick={() => {
                                                        setXboxLimitMode(mode.key);
                                                        if (mode.key === 'pages' && !formData.countPages) handleChange('countPages', 1);
                                                        if (mode.key === 'items' && !formData.countItems) handleChange('countItems', 100);
                                                    }}>
                                                {mode.label}
                                            </button>
                                        ))}
                                    </div>

                                    {xboxLimitMode === 'pages' ? (
                                        <input className={f.input} type="number" min="1"
                                               value={formData.countPages}
                                               onChange={(e) => handleChange('countPages', e.target.value)} />
                                    ) : null}

                                    {xboxLimitMode === 'items' ? (
                                        <input className={f.input} type="number" min="1"
                                               value={formData.countItems}
                                               onChange={(e) => handleChange('countItems', e.target.value)} />
                                    ) : null}
                                </Row>
                            )}
                        </Group>

                        {isPs ? (
                            <Group title="Фильтры витрины">
                                <Row label="Тип" hint="Необязательно" wide>
                                    <div className={f.checkGrid}>
                                        {PS_FILTER_TYPES.map((type) => (
                                            <label className={f.checkRow} key={type.value}>
                                                <input type="checkbox"
                                                       checked={formData.filterTypes.includes(type.value)}
                                                       onChange={() => toggleInList('filterTypes', type.value)} />
                                                <span>{type.label}</span>
                                            </label>
                                        ))}
                                    </div>
                                </Row>
                                <Row label="Платформа" hint="Необязательно" wide>
                                    <div className={f.checkGrid}>
                                        {PS_FILTER_PLATFORMS.map((platform) => (
                                            <label className={f.checkRow} key={platform}>
                                                <input type="checkbox"
                                                       checked={formData.filterPlatforms.includes(platform)}
                                                       onChange={() => toggleInList('filterPlatforms', platform)} />
                                                <span>{platform}</span>
                                            </label>
                                        ))}
                                    </div>
                                </Row>
                                <Row label="Сортировка">
                                    <select className={`${f.input} ${f.select}`} value={formData.sortName}
                                            onChange={(e) => handleChange('sortName', e.target.value)}>
                                        {PS_SORT_OPTIONS.map((option) => (
                                            <option key={option.value} value={option.value}>{option.label}</option>
                                        ))}
                                    </select>
                                    {formData.sortName !== 'default' ? (
                                        <label className={f.checkRow}>
                                            <input type="checkbox"
                                                   checked={formData.sortAscending}
                                                   onChange={(e) => handleChange('sortAscending', e.target.checked)} />
                                            <span>По возрастанию</span>
                                        </label>
                                    ) : null}
                                </Row>
                            </Group>
                        ) : (
                            <Group title="Фильтры витрины">
                                <Row label="Каталог" wide
                                     hint="Готовые наборы фильтров. Дальше галочки можно править вручную">
                                    <div className={f.segmented}>
                                        {XBOX_CATALOG_PRESETS.map((preset) => (
                                            <button type="button" key={preset.key}
                                                    className={f.segment}
                                                    onClick={() => applyXboxPreset(preset)}>
                                                {preset.label}
                                            </button>
                                        ))}
                                    </div>
                                </Row>

                                {XBOX_FILTER_GROUPS.map((group) => (
                                    <Row label={group.label} hint="Необязательно" wide key={group.key}>
                                        <div className={f.checkGrid}>
                                            {group.choices.map((choice) => (
                                                <label className={f.checkRow} key={choice.value}>
                                                    <input type="checkbox"
                                                           checked={formData.xboxFilters[group.key].includes(choice.value)}
                                                           onChange={() => toggleXboxFilter(group.key, choice.value)} />
                                                    <span>{choice.label}</span>
                                                </label>
                                            ))}
                                        </div>
                                    </Row>
                                ))}

                                <Row label="Сортировка">
                                    <select className={`${f.input} ${f.select}`} value={formData.xboxSort}
                                            onChange={(e) => handleChange('xboxSort', e.target.value)}>
                                        {XBOX_SORT_OPTIONS.map((option) => (
                                            <option key={option.value} value={option.value}>{option.label}</option>
                                        ))}
                                    </select>
                                </Row>

                                {xboxFilterCount > 0 ? (
                                    <Row label="Выбрано" hint="Сбросить — вернуть общий каталог">
                                        <span className={s.readonly}>{xboxFilterCount}</span>
                                        <button type="button" className={s.btn}
                                                onClick={() => setFormData((prev) => ({
                                                    ...prev,
                                                    xboxFilters: emptyXboxFilters(),
                                                    xboxSort: XBOX_DEFAULT_SORT,
                                                }))}>
                                            Сбросить
                                        </button>
                                    </Row>
                                ) : null}
                            </Group>
                        )}

                        <Group title="Параметры">
                            {/* Xbox отдаёт срок акции прямо в карточке товара, в том числе
                                в листинге — вбивать дату руками больше не обязательно */}
                            <Row label="Дата окончания акции"
                                 hint={promoMode === 'auto' ? 'Определить по витрине' : null}>
                                <ModeSwitch value={promoMode} onChange={setPromoMode} />
                                {promoMode === 'manual' ? (
                                    <input className={f.input} type="date"
                                           value={formData.promoDate}
                                           onChange={(e) => handleChange('promoDate', e.target.value)} />
                                ) : null}
                            </Row>
                            <Row label="Глубина" wide
                                 hint={[
                                     isPs
                                         ? null
                                         : 'Поверхностный: цены и медиа берутся из списка витрины, без захода в карточки — быстро, но без русских описаний и без аддонов',
                                     ADDONS_HINT,
                                 ].filter(Boolean).join('. ')}>
                                <div className={f.checkGrid}>
                                    <label className={f.checkRow}>
                                        <input type="checkbox" checked={formData.isShallow}
                                               onChange={(e) => handleChange('isShallow', e.target.checked)} />
                                        <span>Поверхностный парсинг</span>
                                    </label>
                                    {/* Аддоны видны только в карточке товара: в списке витрины
                                        их нет вовсе, поэтому с поверхностным парсом флаг бессмыслен */}
                                    {!formData.isShallow || isPs ? (
                                        <label className={f.checkRow}>
                                            <input type="checkbox" checked={formData.parceAddons}
                                                   onChange={(e) => handleChange('parceAddons', e.target.checked)} />
                                            <span>Парсить аддоны</span>
                                        </label>
                                    ) : null}
                                </div>
                            </Row>

                            {/* Паузы растягивать есть смысл только при заходе в карточку:
                                в поверхностном режиме запрос один на страницу товаров */}
                            {!formData.isShallow ? (
                                <Row label="Безопасный режим"
                                     hint="Паузы между запросами втрое длиннее: парс идёт дольше, но витрина не отсекает">
                                    <button
                                        type="button"
                                        role="switch"
                                        aria-checked={formData.safeMode}
                                        className={`${f.switch} ${formData.safeMode ? f.switchOn : ''}`}
                                        onClick={() => handleChange('safeMode', !formData.safeMode)}
                                    >
                                        <span className={f.switchDot} />
                                    </button>
                                </Row>
                            ) : null}
                        </Group>
                    </>
                ) : (
                    <Group title="Ссылки">
                        <Row label="Список ссылок" hint="Каждая с новой строки" top wide>
                            <textarea className={`${f.input} ${f.textarea} ${f.mono}`} rows={10}
                                      placeholder={isPs
                                          ? 'https://store.playstation.com/en-tr/product/EP1004-...'
                                          : 'https://www.xbox.com/en-US/games/store/.../XXXXX'}
                                      value={formData.links}
                                      onChange={(e) => handleChange('links', e.target.value)} />
                        </Row>
                        <Row label="Глубина" hint={ADDONS_HINT} wide>
                            <label className={f.checkRow}>
                                <input type="checkbox" checked={formData.parceAddons}
                                       onChange={(e) => handleChange('parceAddons', e.target.checked)} />
                                <span>Парсить аддоны</span>
                            </label>
                        </Row>

                        {/* По ссылкам всегда идёт заход в карточку — режим доступен всегда */}
                        <Row label="Безопасный режим"
                             hint="Паузы между запросами втрое длиннее: парс идёт дольше, но витрина не отсекает">
                            <button
                                type="button"
                                role="switch"
                                aria-checked={formData.safeMode}
                                className={`${f.switch} ${formData.safeMode ? f.switchOn : ''}`}
                                onClick={() => handleChange('safeMode', !formData.safeMode)}
                            >
                                <span className={f.switchDot} />
                            </button>
                        </Row>
                    </Group>
                )}
            </Sheet>
        </TabPane>
    );
};

export default ParsePanel;
