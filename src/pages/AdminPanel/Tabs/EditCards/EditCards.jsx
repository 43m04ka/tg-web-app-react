import React, {useCallback, useEffect, useMemo, useRef, useState} from 'react';
import EditDataCard from "./EditData/EditDataCard";
import {useServer} from "../../useServer";
import style from "./EditCards.module.scss";
import CardTable from "./CardTable";
import useData from "../../useData";
import WorkTabs, {useWorkTabs} from "../../Elements/WorkTabs/WorkTabs";
import buildSuggestions from "./EditData/buildSuggestions";

const STATUS_FILTERS = [
    {key: 'all', label: 'Все'},
    {key: 'onSale', label: 'В продаже'},
    {key: 'off', label: 'Сняты'},
];

const CardsList = ({onCountChange}) => {
    const {searchForName, updateCardData, deleteCard} = useServer();
    const {authenticationData} = useData();
    const {openTab, closeTab, closeTabsWhere, updateTab} = useWorkTabs();

    const [cardList, setCardList] = useState([]);
    const [searchInputValue, setSearchInputValue] = useState('');
    const [statusFilter, setStatusFilter] = useState('all');
    const [loading, setLoading] = useState(false);
    const [busy, setBusy] = useState(false);
    const [selectedIds, setSelectedIds] = useState([]);

    const debounceRef = useRef(null);
    const requestRef = useRef(0);

    // Пустой запрос — это не «покажи всё», а «нечего искать»: запрос не уходит,
    // список пустой. Ответы нумеруем, чтобы медленный старый запрос не перебил свежий.
    const load = useCallback(async (rawQuery) => {
        const query = rawQuery.trim();
        const requestId = ++requestRef.current;

        if (!query) {
            setLoading(false);
            setCardList([]);
            return;
        }

        setLoading(true);
        await searchForName((result) => {
            if (requestId !== requestRef.current) return;
            setCardList(Array.isArray(result) ? result : []);
            setLoading(false);
        }, query);
    }, [searchForName]);

    const onSearchChange = (value) => {
        setSearchInputValue(value);
        clearTimeout(debounceRef.current);

        // Очистили поле — сбрасываем сразу, ждать нечего.
        if (!value.trim()) {
            load('');
            return;
        }
        debounceRef.current = setTimeout(() => load(value), 350);
    };

    useEffect(() => () => clearTimeout(debounceRef.current), []);

    const visibleList = useMemo(() => {
        if (statusFilter === 'onSale') return cardList.filter((item) => item.onSale);
        if (statusFilter === 'off') return cardList.filter((item) => !item.onSale);
        return cardList;
    }, [cardList, statusFilter]);

    // Выделение живёт только для видимых строк: сменили фильтр — лишнее отпало.
    useEffect(() => {
        setSelectedIds((prev) => prev.filter((id) => visibleList.some((item) => item.id === id)));
    }, [visibleList]);

    // Список живёт своей жизнью, пока открыты вкладки: карточка, выпавшая из выдачи
    // (сменили поиск, фильтр, сняли с продажи, удалили), закрывается принудительно,
    // а переименованная — обновляет подпись своей вкладки.
    const hasQuery = Boolean(searchInputValue.trim());

    useEffect(() => {
        if (loading || !hasQuery) return;
        closeTabsWhere((tab) => tab.entity === 'card'
            && !visibleList.some((item) => item.id === tab.entityId));
        visibleList.forEach((item) => updateTab(`card-${item.id}`, {title: item.name}));
    }, [visibleList, loading, hasQuery, closeTabsWhere, updateTab]);

    useEffect(() => {
        if (!hasQuery) {
            onCountChange('поиск по названию');
            return;
        }
        onCountChange(loading ? 'Загрузка…' : `${visibleList.length} из ${cardList.length}`);
    }, [hasQuery, loading, visibleList.length, cardList.length, onCountChange]);

    // Вкладки редактирования не должны замыкаться на текущий запрос поиска.
    const reloadRef = useRef(() => {});
    reloadRef.current = () => load(searchInputValue);
    const reload = useCallback(() => reloadRef.current(), []);

    // Вид и подвид — свободные строки, но набор значений на практике ограничен:
    // подсказываем то, что уже встречается в выдаче.
    const suggestionsRef = useRef({});
    suggestionsRef.current = buildSuggestions(cardList);

    const openCard = (card) => {
        if (!card) return;
        const id = `card-${card.id}`;
        openTab({
            id,
            title: card.name,
            subtitle: `ID ${card.id}${card.platform ? ` · ${card.platform}` : ''}`,
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
    };

    const changeStatus = async (ids, nextOnSale) => {
        if (!ids.length) return;
        setBusy(true);
        for (const id of ids) {
            await updateCardData(() => {}, authenticationData, id, {onSale: nextOnSale});
        }
        await load(searchInputValue);
        setSelectedIds([]);
        setBusy(false);
    };

    const toggleSelect = (id) => {
        setSelectedIds((prev) => (prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]));
    };

    const toggleSelectAll = () => {
        setSelectedIds((prev) => (prev.length === visibleList.length ? [] : visibleList.map((item) => item.id)));
    };

    const handleDelete = async () => {
        if (!selectedIds.length) return;
        const confirmed = window.confirm(
            `Удалить ${selectedIds.length} товар(ов)? Действие необратимо.`,
        );
        if (!confirmed) return;

        setBusy(true);
        for (const id of selectedIds) {
            await deleteCard(() => {}, authenticationData, id);
        }
        await load(searchInputValue);
        setSelectedIds([]);
        setBusy(false);
    };

    const hasSelection = selectedIds.length > 0;
    const selectedOnSaleCount = visibleList
        .filter((item) => selectedIds.includes(item.id) && item.onSale)
        .length;
    const mixedSelection = hasSelection
        && selectedOnSaleCount > 0
        && selectedOnSaleCount < selectedIds.length;
    const singleSelected = selectedIds.length === 1
        ? visibleList.find((item) => item.id === selectedIds[0])
        : null;

    return (
        <div className={style['screen']}>
            <header className={style['header']}>
                <div className={style['headerTop']}>
                    <h1 className={style['title']}>Товары</h1>
                    <span className={style['counter']}>
                        {!hasQuery
                            ? 'введите название'
                            : loading ? 'Загрузка…' : `${visibleList.length} из ${cardList.length}`}
                    </span>
                    <span className={style['counterHint']}>сервер отдаёт не более 20 совпадений</span>
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

                    <div className={style['segmented']}>
                        {STATUS_FILTERS.map((filter) => (
                            <button
                                key={filter.key}
                                type="button"
                                className={`${style['segment']} ${statusFilter === filter.key ? style['segmentActive'] : ''}`}
                                onClick={() => setStatusFilter(filter.key)}
                            >
                                {filter.label}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Основные действия — всегда на виду над списком, а не всплывающей полосой снизу. */}
                <div className={style['actionBar']}>
                    <span className={style['selectionInfo']}>
                        {selectedIds.length > 0 ? `Выбрано: ${selectedIds.length}` : 'Ничего не выбрано'}
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
                                onClick={() => changeStatus(selectedIds, true)}>
                            В продажу
                        </button>
                        <button type="button" className={style['actionBtn']}
                                disabled={!hasSelection || busy}
                                onClick={() => changeStatus(selectedIds, false)}>
                            Снять с продажи
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
                        cardList={visibleList}
                        loading={loading}
                        selectedIds={selectedIds}
                        onToggleSelect={toggleSelect}
                        onToggleSelectAll={toggleSelectAll}
                        onOpenCard={openCard}
                        emptyText={hasQuery ? 'Товары не найдены' : 'Введите название товара в поиск'}
                    />
                </div>
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
