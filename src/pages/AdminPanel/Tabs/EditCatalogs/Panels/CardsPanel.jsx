import React, {useCallback, useEffect, useRef, useState} from 'react';
import TabPane from '../../../Elements/WorkTabs/TabPane';
import {useWorkTabs} from '../../../Elements/WorkTabs/WorkTabs';
import EditDataCard from '../../EditCards/EditData/EditDataCard';
import buildSuggestions from '../../EditCards/EditData/buildSuggestions';
import {useServer} from '../../../useServer';
import useData from '../../../useData';
import s from './Panels.module.scss';
import t from './CardsPanel.module.scss';
import {API_BASE_URL} from '../../../legacy/baseUrl';

/** Товары выбранного каталога: постраничный список с теми же действиями, что и в «Товарах». */
const CardsPanel = ({catalog, subtitle, onClose}) => {
    const {getCardList, updateCardData} = useServer();
    const {authenticationData} = useData();
    const {openTab, closeTab, closeTabsWhere, updateTab} = useWorkTabs();

    const [cardList, setCardList] = useState([]);
    const [pagesCount, setPagesCount] = useState(0);
    const [pageNumber, setPageNumber] = useState(1);
    const [loading, setLoading] = useState(true);
    const [busy, setBusy] = useState(false);
    const [selectedIds, setSelectedIds] = useState([]);

    const load = useCallback(async (page) => {
        setLoading(true);
        await getCardList((result) => {
            setCardList(result?.cardList || []);
            setPagesCount(result?.len || 0);
            setLoading(false);
        }, catalog.id, page);
    }, [catalog.id, getCardList]);

    // Перезагрузка списка из вкладки-потомка: колбэк должен быть стабильным,
    // иначе во вкладке останется замыкание на старый номер страницы.
    const reloadRef = useRef(() => {});
    reloadRef.current = () => load(pageNumber);
    const reload = useCallback(() => reloadRef.current(), []);

    const cardTabId = (id) => `catalog-${catalog.id}-card-${id}`;

    // Вид и подвид подсказываем значениями, которые уже есть в этом каталоге.
    const suggestionsRef = useRef({});
    suggestionsRef.current = buildSuggestions(cardList);

    useEffect(() => {
        load(1);
        setPageNumber(1);
        setSelectedIds([]);
    }, [catalog.id]);

    // Вкладка карточки закрывается, когда товар ушёл с текущей страницы списка
    // (перелистнули, удалили, обновили) — открытая вкладка не должна вести в никуда.
    useEffect(() => {
        if (loading) return;
        closeTabsWhere((tab) => tab.entity === 'card'
            && tab.catalogId === catalog.id
            && !cardList.some((item) => item.id === tab.entityId));

        cardList.forEach((card) => updateTab(cardTabId(card.id), {title: card.name}));
    }, [cardList, loading, catalog.id, closeTabsWhere, updateTab]);

    // Вкладки карточек этого каталога уходят вместе с ним.
    useEffect(() => () => {
        closeTabsWhere((tab) => tab.entity === 'card' && tab.catalogId === catalog.id);
    }, [catalog.id, closeTabsWhere]);

    const goToPage = (page) => {
        setPageNumber(page);
        setSelectedIds([]);
        load(page);
    };

    const openCard = (card) => {
        const id = cardTabId(card.id);
        openTab({
            id,
            title: card.name,
            subtitle: subtitle || `Товар · ID ${card.id}`,
            entity: 'card',
            entityId: card.id,
            catalogId: catalog.id,
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

    const toggleSelect = (id) => {
        setSelectedIds((prev) => (prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]));
    };

    const toggleSelectAll = () => {
        setSelectedIds((prev) => (prev.length === cardList.length ? [] : cardList.map((item) => item.id)));
    };

    const changeStatus = async (nextOnSale) => {
        setBusy(true);
        for (const id of selectedIds) {
            await updateCardData(() => {}, authenticationData, id, {onSale: nextOnSale});
        }
        await load(pageNumber);
        setSelectedIds([]);
        setBusy(false);
    };

    const handleDelete = async () => {
        if (!window.confirm(`Удалить ${selectedIds.length} товар(ов)? Действие необратимо.`)) return;
        setBusy(true);
        for (const id of selectedIds) {
            await fetch(`${API_BASE_URL}/api/catalog/deleteProduct`, {
                method: 'POST',
                headers: {'Content-Type': 'application/json'},
                body: JSON.stringify({id}),
            });
        }
        await load(pageNumber);
        setSelectedIds([]);
        setBusy(false);
    };

    const hasSelection = selectedIds.length > 0;
    const singleSelected = selectedIds.length === 1
        ? cardList.find((item) => item.id === selectedIds[0])
        : null;

    return (
        <TabPane
            footer={(
                <>
                    {pagesCount > 1 ? (
                        <div className={t.pagination}>
                            <button type="button" className={t.pageBtn} disabled={pageNumber <= 1}
                                    onClick={() => goToPage(pageNumber - 1)}>‹</button>
                            <span className={t.pageInfo}>{pageNumber} / {pagesCount}</span>
                            <button type="button" className={t.pageBtn} disabled={pageNumber >= pagesCount}
                                    onClick={() => goToPage(pageNumber + 1)}>›</button>
                        </div>
                    ) : null}
                    <button type="button" className={s.btn} onClick={() => load(pageNumber)}>Обновить</button>
                    <button type="button" className={`${s.btn} ${s.btnPrimary}`} onClick={onClose}>Закрыть</button>
                </>
            )}
        >
            <div className={t.actionBar}>
                <span className={t.selectionInfo}>
                    {hasSelection ? `Выбрано: ${selectedIds.length}` : 'Ничего не выбрано'}
                </span>
                <div className={t.actionGroup}>
                    <button type="button" className={`${t.actionBtn} ${t.actionBtnPrimary}`}
                            disabled={!singleSelected}
                            onClick={() => openCard(singleSelected)}>
                        Редактировать
                    </button>
                    <button type="button" className={t.actionBtn} disabled={!hasSelection || busy}
                            onClick={() => changeStatus(true)}>
                        В продажу
                    </button>
                    <button type="button" className={t.actionBtn} disabled={!hasSelection || busy}
                            onClick={() => changeStatus(false)}>
                        Снять
                    </button>
                    <button type="button" className={`${t.actionBtn} ${t.actionBtnDanger}`}
                            disabled={!hasSelection || busy}
                            onClick={handleDelete}>
                        Удалить
                    </button>
                </div>
            </div>

            <div className={t.workArea}>
                <div className={t.tableWrap}>
                    <table className={t.table}>
                        <thead>
                            <tr>
                                <th className={t.checkCol}>
                                    <input type="checkbox" className={t.checkbox}
                                           checked={cardList.length > 0 && selectedIds.length === cardList.length}
                                           onChange={toggleSelectAll} aria-label="Выделить всё" />
                                </th>
                                <th>Название</th>
                                <th className={t.numCol}>Цена</th>
                                <th className={t.statusCol}>Статус</th>
                            </tr>
                        </thead>
                        <tbody>
                            {loading ? (
                                <tr><td colSpan={4} className={t.emptyCell}>Загрузка…</td></tr>
                            ) : cardList.length === 0 ? (
                                <tr><td colSpan={4} className={t.emptyCell}>В каталоге нет товаров</td></tr>
                            ) : (
                                cardList.map((card) => {
                                    const selected = selectedIds.includes(card.id);
                                    return (
                                        <tr key={card.id}
                                            className={selected ? t.rowSelected : ''}
                                            onClick={() => toggleSelect(card.id)}
                                            onDoubleClick={() => openCard(card)}>
                                            <td className={t.checkCol}>
                                                <input type="checkbox" className={t.checkbox} checked={selected}
                                                       onChange={() => toggleSelect(card.id)}
                                                       onClick={(e) => e.stopPropagation()}
                                                       aria-label={`Выбрать ${card.name}`} />
                                            </td>
                                            <td className={t.nameCell} title={card.name}>{card.name}</td>
                                            <td className={t.numCol}>{card.price}</td>
                                            <td className={t.statusCol}>
                                                <span className={card.onSale ? t.badgeOn : t.badgeOff}>
                                                    {card.onSale ? 'В продаже' : 'Снят'}
                                                </span>
                                            </td>
                                        </tr>
                                    );
                                })
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </TabPane>
    );
};

export default CardsPanel;
