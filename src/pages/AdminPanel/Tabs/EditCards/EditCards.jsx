import React, {useCallback, useEffect, useMemo, useRef, useState} from 'react';
import EditDataCard from "./EditData/EditDataCard";
import {useServer} from "../../useServer";
import style from "./EditCards.module.scss";
import CardTable from "./CardTable";
import useData from "../../useData";
import useGlobalData from '../../legacy/useGlobalData';
import WorkTabs, {useWorkTabs} from "../../Elements/WorkTabs/WorkTabs";
import {useFeedback} from "../../Elements/Feedback/Feedback";
import buildSuggestions from "./EditData/buildSuggestions";

// СПИСОК ТОВАРОВ
// --------------
// Отбор целиком считает сервер (/admin/products): фильтры по каталогу, статусу и типу
// плюс постраничность. Раньше экран умел только поиск по имени, сервер возвращал не более
// двадцати совпадений, и фильтр по статусу применялся к этим двадцати строкам на клиенте —
// то есть отвечал на вопрос «сколько снятых среди случайной верхушки выдачи».
// До первого введённого символа список вообще не загружался.

const STATUS_FILTERS = [
    {key: 'all', label: 'Все', value: undefined},
    {key: 'onSale', label: 'В продаже', value: true},
    {key: 'off', label: 'Сняты', value: false},
];

// Скрытые из каталогов — это в основном дополнения, которые парсер уводит в хвост.
// Отдельный фильтр нужен, чтобы их можно было найти: в самих каталогах витрины их нет.
const VISIBILITY_FILTERS = [
    {key: '', label: 'Видимость: все'},
    {key: 'visible', label: 'Только видимые'},
    {key: 'hidden', label: 'Только скрытые'},
];

// Подписи типов те же, что в форме карточки. Витрина хранит код, человеку нужен текст.
const TYPE_LABELS = {
    GAME: 'Игра',
    SUBSCRIPTION: 'Подписка',
    CODE: 'Код',
    ADD_ON: 'DLC',
    COMPLECT: 'Комплект',
    DONATION: 'Донат',
    OTHER: 'Другое',
};

const PAGE_SIZE = 50;

const CardsList = ({onCountChange}) => {
    // useServer() собирает новые замыкания на каждый рендер. Положить их в зависимости
    // загрузки нельзя: эффект перезапускал бы сам себя до бесконечности — держим
    // последнюю версию в ref и зовём через него.
    const server = useServer();
    const serverRef = useRef(server);
    serverRef.current = server;

    const {authenticationData} = useData();
    const {catalogList, updateCatalogList} = useGlobalData();
    const {openTab, closeTab, closeTabsWhere, updateTab} = useWorkTabs();
    const {showToast, confirm} = useFeedback();

    const [items, setItems] = useState([]);
    const [total, setTotal] = useState(0);
    const [pages, setPages] = useState(1);
    const [page, setPage] = useState(1);

    const [searchInputValue, setSearchInputValue] = useState('');
    const [search, setSearch] = useState('');
    const [statusFilter, setStatusFilter] = useState('all');
    const [catalogFilter, setCatalogFilter] = useState('');
    const [typeFilter, setTypeFilter] = useState('');
    const [visibilityFilter, setVisibilityFilter] = useState('');
    const [typeFacets, setTypeFacets] = useState([]);

    const [loading, setLoading] = useState(true);
    const [busy, setBusy] = useState(false);
    const [error, setError] = useState('');
    const [selectedIds, setSelectedIds] = useState([]);

    const debounceRef = useRef(null);
    const requestRef = useRef(0);

    const statusValue = STATUS_FILTERS.find((filter) => filter.key === statusFilter)?.value;

    // Каталоги нужны и для фильтра, и для подписи каталога в строке таблицы
    useEffect(() => {
        if (!catalogList) updateCatalogList();
    }, [catalogList, updateCatalogList]);

    useEffect(() => {
        serverRef.current.getProductFacets()
            .then((data) => setTypeFacets(Array.isArray(data?.types) ? data.types : []))
            // Фильтр по типу — удобство, а не обязательная часть экрана:
            // не смогли получить список типов — просто не показываем его
            .catch(() => setTypeFacets([]));
    }, []);

    const catalogById = useMemo(() => {
        const map = new Map();
        (catalogList || []).forEach((catalog) => map.set(catalog.id, catalog));
        return map;
    }, [catalogList]);

    // Ответы нумеруем: медленный старый запрос не должен перебить свежий
    const load = useCallback(async () => {
        const requestId = ++requestRef.current;
        setLoading(true);
        setError('');

        try {
            const data = await serverRef.current.getProducts({
                search,
                catalogId: catalogFilter || undefined,
                onSale: statusValue,
                type: typeFilter || undefined,
                visibility: visibilityFilter || undefined,
                page,
                pageSize: PAGE_SIZE,
            });

            if (requestId !== requestRef.current) return;

            setItems(Array.isArray(data?.items) ? data.items : []);
            setTotal(Number(data?.total) || 0);
            setPages(Math.max(1, Number(data?.pages) || 1));
        } catch (err) {
            if (requestId !== requestRef.current) return;
            setItems([]);
            setTotal(0);
            setPages(1);
            setError(err.message || 'Не удалось загрузить список');
        } finally {
            if (requestId === requestRef.current) setLoading(false);
        }
    }, [search, catalogFilter, statusValue, typeFilter, visibilityFilter, page]);

    useEffect(() => {
        load();
    }, [load]);

    // Смена любого фильтра возвращает на первую страницу: иначе после сужения выборки
    // экран оставался на странице 7, которой в новой выдаче уже нет
    const resetToFirstPage = () => setPage(1);

    const onSearchChange = (value) => {
        setSearchInputValue(value);
        clearTimeout(debounceRef.current);

        // Очистили поле — показываем всё сразу, ждать нечего
        if (!value.trim()) {
            setSearch('');
            resetToFirstPage();
            return;
        }

        debounceRef.current = setTimeout(() => {
            setSearch(value.trim());
            resetToFirstPage();
        }, 350);
    };

    useEffect(() => () => clearTimeout(debounceRef.current), []);

    // Выделение живёт только для видимых строк: ушли со страницы или сменили фильтр —
    // выбор снимается, иначе массовое действие уедет по товарам, которых не видно
    useEffect(() => {
        setSelectedIds((prev) => prev.filter((id) => items.some((item) => item.id === id)));
    }, [items]);

    // Переименованный товар обновляет подпись своей вкладки.
    //
    // Закрывать вкладки по отсутствию в выдаче нельзя: список постраничный и фильтруемый,
    // и «нет на текущей странице» не значит «удалён». Иначе переход на вторую страницу
    // закрывал бы карточку, которую в этот момент редактируют. Вкладки закрываются только
    // после реального удаления — см. handleDelete.
    useEffect(() => {
        if (loading) return;
        items.forEach((item) => updateTab(`card-${item.id}`, {title: item.name}));
    }, [items, loading, updateTab]);

    const rangeText = useMemo(() => {
        if (loading) return 'Загрузка…';
        if (!total) return 'ничего не найдено';

        const from = (page - 1) * PAGE_SIZE + 1;
        const to = Math.min(total, page * PAGE_SIZE);
        return `${from}–${to} из ${total}`;
    }, [loading, total, page]);

    useEffect(() => {
        onCountChange(rangeText);
    }, [rangeText, onCountChange]);

    // Вкладка редактирования не должна замыкаться на текущие фильтры
    const reloadRef = useRef(() => {});
    reloadRef.current = () => load();
    const reload = useCallback(() => reloadRef.current(), []);

    // Вид и подвид — свободные строки, но набор значений на практике ограничен:
    // подсказываем то, что уже встречается в выдаче
    const suggestionsRef = useRef({});
    suggestionsRef.current = buildSuggestions(items);

    const openCard = useCallback((card) => {
        if (!card) return;

        const id = `card-${card.id}`;
        const catalog = catalogById.get(card.catalogId);

        openTab({
            id,
            title: card.name,
            subtitle: `ID ${card.id}${catalog?.path ? ` · ${catalog.path}` : ''}`,
            entity: 'card',
            entityId: card.id,
            content: (
                <EditDataCard
                    cardId={card.id}
                    onClose={() => closeTab(id)}
                    onReload={reload}
                    suggestions={suggestionsRef.current}
                />
            ),
        });
    }, [openTab, closeTab, reload, catalogById]);

    const changeStatus = async (nextOnSale) => {
        if (!selectedIds.length) return;

        setBusy(true);
        try {
            // Один запрос на всю выборку: раньше здесь был цикл по выделенным строкам,
            // и полсотни товаров превращались в полсотни запросов подряд
            const result = await serverRef.current.bulkUpdateCards(authenticationData, selectedIds, {onSale: nextOnSale});
            showToast(
                `${nextOnSale ? 'В продажу' : 'Снято с продажи'}: ${result.updated ?? selectedIds.length}`,
                'success',
            );
            setSelectedIds([]);
            await load();
        } catch (err) {
            showToast(err.message || 'Не удалось изменить товары', 'error');
        } finally {
            setBusy(false);
        }
    };

    const handleDelete = async () => {
        if (!selectedIds.length) return;

        const agreed = await confirm({
            title: 'Удалить товары?',
            text: `Будет удалено: ${selectedIds.length}. Действие необратимо.`,
            confirmLabel: 'Удалить',
            danger: true,
        });
        if (!agreed) return;

        const removedIds = selectedIds;

        setBusy(true);
        try {
            const result = await serverRef.current.bulkDeleteCards(authenticationData, removedIds);
            showToast(`Удалено товаров: ${result.deleted ?? removedIds.length}`, 'success');

            // Единственный случай, когда вкладку закрывают за пользователя: товара больше нет,
            // и форма редактирования вела бы в никуда
            closeTabsWhere((tab) => tab.entity === 'card' && removedIds.includes(tab.entityId));

            setSelectedIds([]);
            await load();
        } catch (err) {
            showToast(err.message || 'Не удалось удалить товары', 'error');
        } finally {
            setBusy(false);
        }
    };

    const toggleSelect = (id) => {
        setSelectedIds((prev) => (prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]));
    };

    const toggleSelectAll = () => {
        setSelectedIds((prev) => (prev.length === items.length ? [] : items.map((item) => item.id)));
    };

    const changeVisibility = async (nextHidden) => {
        if (!selectedIds.length) return;

        setBusy(true);
        try {
            const result = await serverRef.current.bulkUpdateCards(
                authenticationData,
                selectedIds,
                {isHidden: nextHidden},
            );
            showToast(
                `${nextHidden ? 'Скрыто из каталогов' : 'Возвращено в каталоги'}: ${result.updated ?? selectedIds.length}`,
                'success',
            );
            setSelectedIds([]);
            await load();
        } catch (err) {
            showToast(err.message || 'Не удалось изменить видимость', 'error');
        } finally {
            setBusy(false);
        }
    };

    const resetFilters = () => {
        setSearchInputValue('');
        setSearch('');
        setStatusFilter('all');
        setCatalogFilter('');
        setTypeFilter('');
        setVisibilityFilter('');
        resetToFirstPage();
    };

    const hasSelection = selectedIds.length > 0;
    const selectedOnSaleCount = items.filter((item) => selectedIds.includes(item.id) && item.onSale).length;
    const mixedSelection = hasSelection && selectedOnSaleCount > 0 && selectedOnSaleCount < selectedIds.length;
    const singleSelected = selectedIds.length === 1
        ? items.find((item) => item.id === selectedIds[0])
        : null;

    const filtersActive = Boolean(search || catalogFilter || typeFilter || visibilityFilter || statusFilter !== 'all');

    return (
        <div className={style['screen']}>
            <header className={style['header']}>
                <div className={style['headerTop']}>
                    <h1 className={style['title']}>Товары</h1>
                    <span className={style['counter']}>{rangeText}</span>
                </div>

                <div className={style['toolbar']}>
                    <div className={style['searchField']}>
                        <svg className={style['searchIcon']} viewBox="0 0 24 24" width="16" height="16"
                             fill="none" stroke="currentColor" strokeWidth="2" aria-hidden>
                            <circle cx="11" cy="11" r="7" />
                            <path d="m20 20-3.5-3.5" strokeLinecap="round" />
                        </svg>
                        <input
                            className={style['searchInput']}
                            placeholder="Поиск по названию"
                            value={searchInputValue}
                            onChange={(event) => onSearchChange(event.target.value)}
                        />
                        {searchInputValue ? (
                            <button type="button" className={style['searchClear']}
                                    onClick={() => onSearchChange('')} aria-label="Очистить">
                                ✕
                            </button>
                        ) : null}
                    </div>

                    <select className={style['filterSelect']}
                            value={catalogFilter}
                            onChange={(event) => {
                                setCatalogFilter(event.target.value);
                                resetToFirstPage();
                            }}>
                        <option value="">Все каталоги</option>
                        {(catalogList || []).map((catalog) => (
                            <option key={catalog.id} value={catalog.id}>{catalog.path}</option>
                        ))}
                    </select>

                    <select className={style['filterSelect']}
                            value={typeFilter}
                            onChange={(event) => {
                                setTypeFilter(event.target.value);
                                resetToFirstPage();
                            }}>
                        <option value="">Все типы</option>
                        {typeFacets.map((facet) => (
                            <option key={facet.value} value={facet.value}>
                                {`${TYPE_LABELS[facet.value] || facet.value} (${facet.count})`}
                            </option>
                        ))}
                    </select>

                    <select className={style['filterSelect']}
                            value={visibilityFilter}
                            onChange={(event) => {
                                setVisibilityFilter(event.target.value);
                                resetToFirstPage();
                            }}>
                        {VISIBILITY_FILTERS.map((filter) => (
                            <option key={filter.key} value={filter.key}>{filter.label}</option>
                        ))}
                    </select>

                    <div className={style['segmented']}>
                        {STATUS_FILTERS.map((filter) => (
                            <button
                                key={filter.key}
                                type="button"
                                className={`${style['segment']} ${statusFilter === filter.key ? style['segmentActive'] : ''}`}
                                onClick={() => {
                                    setStatusFilter(filter.key);
                                    resetToFirstPage();
                                }}
                            >
                                {filter.label}
                            </button>
                        ))}
                    </div>

                    {filtersActive ? (
                        <button type="button" className={style['actionBtnGhost']} onClick={resetFilters}>
                            Сбросить фильтры
                        </button>
                    ) : null}
                </div>

                {/* Основные действия — всегда на виду над списком, а не всплывающей полосой снизу. */}
                <div className={style['actionBar']}>
                    <span className={style['selectionInfo']}>
                        {hasSelection ? `Выбрано: ${selectedIds.length}` : 'Ничего не выбрано'}
                        {mixedSelection ? <em className={style['selectionNote']}> · в выборке есть и снятые, и в продаже</em> : null}
                    </span>
                    <div className={style['actionGroup']}>
                        <button type="button" className={`${style['actionBtn']} ${style['actionBtnPrimary']}`}
                                disabled={!singleSelected}
                                title={selectedIds.length > 1 ? 'Выберите один товар' : undefined}
                                onClick={() => openCard(singleSelected)}>
                            Редактировать
                        </button>
                        <button type="button" className={style['actionBtn']}
                                disabled={!hasSelection || busy}
                                onClick={() => changeStatus(true)}>
                            В продажу
                        </button>
                        <button type="button" className={style['actionBtn']}
                                disabled={!hasSelection || busy}
                                onClick={() => changeStatus(false)}>
                            Снять с продажи
                        </button>
                        <button type="button" className={style['actionBtn']}
                                disabled={!hasSelection || busy}
                                title="Убрать из списков каталога, поиска и полок главной"
                                onClick={() => changeVisibility(true)}>
                            Скрыть из каталогов
                        </button>
                        <button type="button" className={style['actionBtn']}
                                disabled={!hasSelection || busy}
                                onClick={() => changeVisibility(false)}>
                            Вернуть в каталоги
                        </button>
                        <button type="button" className={`${style['actionBtn']} ${style['actionBtnDanger']}`}
                                disabled={!hasSelection || busy}
                                onClick={handleDelete}>
                            Удалить
                        </button>
                        <button type="button" className={style['actionBtnGhost']}
                                disabled={!hasSelection}
                                onClick={() => setSelectedIds([])}>
                            Снять выделение
                        </button>
                    </div>
                </div>
            </header>

            <div className={style['workArea']}>
                <div className={style['tableWrap']}>
                    <CardTable
                        cardList={items}
                        loading={loading}
                        selectedIds={selectedIds}
                        onToggleSelect={toggleSelect}
                        onToggleSelectAll={toggleSelectAll}
                        onOpenCard={openCard}
                        catalogById={catalogById}
                        typeLabels={TYPE_LABELS}
                        emptyText={error || (filtersActive ? 'Под фильтры ничего не подошло' : 'Товаров пока нет')}
                    />
                </div>

                {/* Страницы показываем всегда, когда их больше одной: без этого
                    выдача молча обрывалась на первых пятидесяти строках */}
                {pages > 1 ? (
                    <div className={style['pager']}>
                        <button type="button" className={style['actionBtn']}
                                disabled={page <= 1 || loading}
                                onClick={() => setPage((prev) => Math.max(1, prev - 1))}>
                            Назад
                        </button>
                        <span className={style['pagerInfo']}>Страница {page} из {pages}</span>
                        <button type="button" className={style['actionBtn']}
                                disabled={page >= pages || loading}
                                onClick={() => setPage((prev) => Math.min(pages, prev + 1))}>
                            Вперёд
                        </button>
                    </div>
                ) : null}
            </div>
        </div>
    );
};

const EditCards = () => {
    const [subtitle, setSubtitle] = useState('');

    return (
        <WorkTabs rootTitle="Товары" rootSubtitle={subtitle}>
            <CardsList onCountChange={setSubtitle} />
        </WorkTabs>
    );
};

export default EditCards;
