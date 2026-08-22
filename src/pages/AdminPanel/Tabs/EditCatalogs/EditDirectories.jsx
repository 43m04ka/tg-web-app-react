import React, {useCallback, useEffect, useMemo, useRef, useState} from 'react';
import {useServer} from "./useServer";
import useGlobalData from '../../legacy/useGlobalData';
import useData from "../../useData";
import style from "./EditDirectories.module.scss";
import WorkTabs, {useWorkTabs} from "../../Elements/WorkTabs/WorkTabs";
import ImportData from "./ImportData/ImportData";
import ParsePanel from './Panels/ParsePanel';
import CardsPanel from './Panels/CardsPanel';
import CreateCatalogPanel from './Panels/CreateCatalogPanel';
import RecalculatePanel from './Panels/RecalculatePanel';
import {API_BASE_URL} from '../../legacy/baseUrl';

const CatalogList = ({onCountChange}) => {
    const {deleteCatalog, changeSaleStatusCatalog} = useServer();
    const {authenticationData} = useData();
    const {catalogList, pageList, updateCatalogList, updatePageList} = useGlobalData();
    const {openTab, closeTab, closeTabsWhere, updateTab} = useWorkTabs();

    const [searchValue, setSearchValue] = useState('');
    const [page, setPage] = useState(null);
    const [selectedIds, setSelectedIds] = useState([]);
    const [busy, setBusy] = useState(false);
    const [importOpen, setImportOpen] = useState(false);

    useEffect(() => {
        updatePageList(true);
        updateCatalogList(undefined, {includeStatus: true});
    }, []);

    useEffect(() => {
        if (pageList && pageList.length > 0 && page === null) {
            setPage(pageList[0].id);
        }
    }, [pageList, page]);

    const visibleList = useMemo(() => {
        if (!catalogList) return [];
        return [...catalogList]
            .sort((a, b) => a.structurePageId - b.structurePageId)
            .filter((item) => page === null || item.structurePageId === page)
            .filter((item) => item.path?.toLowerCase().includes(searchValue.toLowerCase()));
    }, [catalogList, page, searchValue]);

    // Выделение живёт только для видимых строк: сменили страницу или поиск — лишнее отпало.
    useEffect(() => {
        setSelectedIds((prev) => prev.filter((id) => visibleList.some((item) => item.id === id)));
    }, [visibleList]);

    const currentPage = pageList?.find((item) => item.id === page) || null;
    const selectedCatalogs = visibleList.filter((item) => selectedIds.includes(item.id));
    const singleSelected = selectedCatalogs.length === 1 ? selectedCatalogs[0] : null;
    const hasSelection = selectedIds.length > 0;

    // Подпись корневой вкладки и заголовок обновляются вместе с выборкой.
    useEffect(() => {
        onCountChange(`${currentPage ? `${currentPage.name} · ` : ''}${visibleList.length} шт.`);
    }, [currentPage, visibleList.length, onCountChange]);

    const reload = useCallback(
        () => updateCatalogList(undefined, {includeStatus: true}),
        [updateCatalogList],
    );

    // Стабильный колбэк для вкладок: внутри они не должны зависеть от текущего рендера списка.
    const reloadRef = useRef(reload);
    reloadRef.current = reload;
    const stableReload = useCallback(() => reloadRef.current(), []);

    // Подпись вкладки: каталог всегда показывается вместе со своей страницей —
    // смена страницы в списке вкладки не закрывает, поэтому важно видеть, что к чему.
    const catalogSubtitle = useCallback((catalog) => {
        const pageItem = pageList?.find((item) => item.id === catalog.structurePageId);
        return pageItem ? `${pageItem.name} · ${catalog.path}` : catalog.path;
    }, [pageList]);

    // Вкладку закрываем, только если каталога больше нет вообще (удалили).
    // Фильтры и смена страницы на открытые вкладки не влияют — они самостоятельные.
    useEffect(() => {
        if (!catalogList) return;
        closeTabsWhere((tab) => tab.entity === 'catalog'
            && !catalogList.some((item) => item.id === tab.entityId));
        catalogList.forEach((item) => {
            const subtitle = catalogSubtitle(item);
            updateTab(`cards-${item.id}`, {subtitle});
            updateTab(`parse-${item.id}`, {subtitle});
            updateTab(`recalc-${item.id}`, {subtitle});
        });
    }, [catalogList, catalogSubtitle, closeTabsWhere, updateTab]);

    const toggleSelect = (id) => {
        setSelectedIds((prev) => (prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]));
    };

    const toggleSelectAll = () => {
        setSelectedIds((prev) => (prev.length === visibleList.length ? [] : visibleList.map((item) => item.id)));
    };

    const handleSaleStatus = async (nextOnSale) => {
        setBusy(true);
        for (const id of selectedIds) {
            await changeSaleStatusCatalog(() => {}, authenticationData, id, nextOnSale);
        }
        reload();
        setSelectedIds([]);
        setBusy(false);
    };

    const handleDelete = async () => {
        const names = selectedCatalogs.map((item) => item.path).join(', ');
        if (!window.confirm(`Удалить каталог(и): ${names}? Действие необратимо.`)) return;

        setBusy(true);
        for (const id of selectedIds) {
            await deleteCatalog(() => {}, authenticationData, id);
        }
        reload();
        setSelectedIds([]);
        setBusy(false);
    };

    // Очистка каталога — одна ручка на бэке: удалять товары по одному было бы
    // сотнями запросов, а сам каталог должен остаться для следующего парсинга.
    const handleClearCatalogs = async () => {
        const names = selectedCatalogs.map((item) => item.path).join(', ');
        if (!window.confirm(
            `Удалить ВСЕ товары из каталога(ов): ${names}?\nСами каталоги останутся. Действие необратимо.`,
        )) return;

        setBusy(true);
        let total = 0;
        try {
            for (const id of selectedIds) {
                const response = await fetch(`${API_BASE_URL}/api/catalog/deleteCatalogProducts`, {
                    method: 'POST',
                    headers: {'Content-Type': 'application/json'},
                    body: JSON.stringify({catalogId: id}),
                });
                const result = await response.json();
                if (!response.ok) {
                    alert(`Не удалось очистить каталог: ${result.error || response.statusText}`);
                    break;
                }
                total += result.deleted || 0;
            }
            alert(`Удалено товаров: ${total}`);
        } catch (error) {
            alert('Ошибка сети при очистке каталога: ' + error.message);
        } finally {
            reload();
            setSelectedIds([]);
            setBusy(false);
        }
    };

    const handleExport = async () => {
        if (!singleSelected) return;
        try {
            const response = await fetch(`${API_BASE_URL}/api/catalog/export/${singleSelected.id}?time=${Date.now()}`);
            if (!response.ok) {
                alert('Ошибка при экспорте: ' + response.statusText);
                return;
            }

            const blob = await response.blob();
            const url = URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = url;
            link.download = `cards_${singleSelected.id}.xlsx`;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            URL.revokeObjectURL(url);
        } catch (error) {
            alert('Ошибка при экспорте: ' + error.message);
        }
    };

    const openCards = (catalog) => {
        const id = `cards-${catalog.id}`;
        openTab({
            id,
            title: 'Товары',
            subtitle: catalogSubtitle(catalog),
            entity: 'catalog',
            entityId: catalog.id,
            // Товар внутри каталога наследует подпись со страницей и путём каталога.
            content: (
                <CardsPanel
                    catalog={catalog}
                    subtitle={catalogSubtitle(catalog)}
                    onClose={() => closeTab(id)}
                />
            ),
        });
    };

    const openParse = (catalog, structurePage) => {
        const id = `parse-${catalog.id}`;
        openTab({
            id,
            title: 'Парсинг',
            subtitle: catalogSubtitle(catalog),
            entity: 'catalog',
            entityId: catalog.id,
            content: <ParsePanel catalog={catalog} page={structurePage} onClose={() => closeTab(id)} />,
        });
    };

    const openRecalculate = (catalog) => {
        const id = `recalc-${catalog.id}`;
        openTab({
            id,
            title: 'Пересчёт цен',
            subtitle: catalogSubtitle(catalog),
            entity: 'catalog',
            entityId: catalog.id,
            content: <RecalculatePanel catalogId={catalog.id} onClose={() => closeTab(id)} />,
        });
    };

    const openCreate = () => {
        const id = 'create-catalog';
        openTab({
            id,
            title: 'Новый каталог',
            // Каталог создаётся на той странице, с которой вкладку открыли,
            // даже если в списке потом переключились на другую.
            subtitle: currentPage?.name,
            entity: 'create',
            content: (
                <CreateCatalogPanel
                    pageId={page}
                    pageName={currentPage?.name}
                    onCreated={stableReload}
                    onClose={() => closeTab(id)}
                />
            ),
        });
    };

    const statusLabel = (onSale) => (onSale === 2 ? 'В продаже' : onSale === 1 ? 'Частично' : 'Не в продаже');
    const statusClass = (onSale) => (onSale === 2 ? style['badgeOn'] : onSale === 1 ? style['badgePartial'] : style['badgeOff']);

    return (
        <div className={style['screen']}>
            <header className={style['header']}>
                <div className={style['headerTop']}>
                    <div className={style['titleBlock']}>
                        <h1 className={style['title']}>Каталоги</h1>
                        <span className={style['counter']}>
                            {currentPage ? `${currentPage.name} · ` : ''}{visibleList.length} шт.
                        </span>
                    </div>
                    <div className={style['actionGroup']}>
                        <button type="button" className={`${style['actionBtn']} ${style['actionBtnCreate']}`}
                                onClick={openCreate}>
                            <svg viewBox="0 0 24 24" width="14" height="14" fill="none"
                                 stroke="currentColor" strokeWidth="2.4" aria-hidden>
                                <path d="M12 5v14M5 12h14" strokeLinecap="round" />
                            </svg>
                            Создать каталог
                        </button>
                        <button type="button" className={style['actionBtn']} onClick={() => setImportOpen(true)}>
                            Импорт из Excel
                        </button>
                        <button type="button" className={style['actionBtnGhost']} onClick={reload}>
                            Обновить
                        </button>
                    </div>
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
                            placeholder="Поиск по пути каталога"
                            value={searchValue}
                            onChange={(event) => setSearchValue(event.target.value)}
                        />
                        {searchValue ? (
                            <button type="button" className={style['searchClear']}
                                    onClick={() => setSearchValue('')} aria-label="Очистить">✕</button>
                        ) : null}
                    </div>

                    <div className={style['pageTabs']}>
                        {pageList && [...pageList].sort((a, b) => a.name.localeCompare(b.name)).map((item) => (
                            <button
                                key={item.id}
                                type="button"
                                className={`${style['pageTab']} ${page === item.id ? style['pageTabActive'] : ''}`}
                                onClick={() => setPage(item.id)}
                            >
                                {item.name}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Панель действий появляется, когда есть выбор, — иначе она бессмысленна. */}
                <div className={`${style['actionBar']} ${hasSelection ? style['actionBarActive'] : ''}`}>
                    <span className={style['selectionInfo']}>
                        {hasSelection
                            ? `Выбрано каталогов: ${selectedIds.length}`
                            : 'Выберите каталог в списке, чтобы работать с ним'}
                    </span>
                    <div className={style['actionGroup']}>
                        <button type="button" className={`${style['actionBtn']} ${style['actionBtnPrimary']}`}
                                disabled={!singleSelected}
                                title={selectedIds.length > 1 ? 'Выберите один каталог' : undefined}
                                onClick={() => openCards(singleSelected)}>
                            Товары
                        </button>
                        <button type="button" className={style['actionBtn']}
                                disabled={!singleSelected || !currentPage}
                                onClick={() => openParse(singleSelected, currentPage)}>
                            Парсить
                        </button>
                        <button type="button" className={style['actionBtn']}
                                disabled={!singleSelected}
                                onClick={() => openRecalculate(singleSelected)}>
                            Пересчитать цены
                        </button>
                        <button type="button" className={style['actionBtn']}
                                disabled={!singleSelected}
                                onClick={handleExport}>
                            Экспорт
                        </button>

                        <span className={style['actionDivider']} aria-hidden />

                        <button type="button" className={style['actionBtn']}
                                disabled={!hasSelection || busy}
                                onClick={() => handleSaleStatus(true)}>
                            В продажу
                        </button>
                        <button type="button" className={style['actionBtn']}
                                disabled={!hasSelection || busy}
                                onClick={() => handleSaleStatus(false)}>
                            Снять
                        </button>
                        <button type="button" className={`${style['actionBtn']} ${style['actionBtnDanger']}`}
                                disabled={!hasSelection || busy}
                                title="Удалить все товары каталога, сам каталог оставить"
                                onClick={handleClearCatalogs}>
                            Очистить
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
                    <table className={style['table']}>
                        <thead>
                            <tr>
                                <th className={style['checkCol']}>
                                    <input type="checkbox" className={style['checkbox']}
                                           checked={visibleList.length > 0 && selectedIds.length === visibleList.length}
                                           onChange={toggleSelectAll} aria-label="Выделить всё" />
                                </th>
                                <th>Путь</th>
                                <th className={style['pageCol']}>Страница</th>
                                <th className={style['statusCol']}>Статус</th>
                            </tr>
                        </thead>
                        <tbody>
                            {visibleList.length === 0 ? (
                                <tr>
                                    <td colSpan={4} className={style['emptyCell']}>Каталоги не найдены</td>
                                </tr>
                            ) : (
                                visibleList.map((item) => {
                                    const selected = selectedIds.includes(item.id);
                                    const pageItem = pageList?.find((p) => p.id === item.structurePageId);
                                    return (
                                        <tr key={item.id}
                                            className={selected ? style['rowSelected'] : ''}
                                            onClick={() => toggleSelect(item.id)}
                                            onDoubleClick={() => openCards(item)}>
                                            <td className={style['checkCol']}>
                                                <input type="checkbox" className={style['checkbox']} checked={selected}
                                                       onChange={() => toggleSelect(item.id)}
                                                       onClick={(e) => e.stopPropagation()}
                                                       aria-label={`Выбрать ${item.path}`} />
                                            </td>
                                            <td className={style['pathCell']}>{item.path}</td>
                                            <td className={style['pageCol']}>{pageItem ? pageItem.name : '—'}</td>
                                            <td className={style['statusCol']}>
                                                <span className={statusClass(item.onSale)}>{statusLabel(item.onSale)}</span>
                                            </td>
                                        </tr>
                                    );
                                })
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Импорт пока остаётся модалкой: форма одноэкранная и завязана на результат загрузки. */}
            {importOpen ? (
                <ImportData
                    onClose={() => setImportOpen(false)}
                    onReload={reload}
                    catalogList={catalogList}
                />
            ) : null}
        </div>
    );
};

const EditDirectories = () => {
    const [subtitle, setSubtitle] = useState('');

    return (
        <WorkTabs rootTitle="Каталоги" rootSubtitle={subtitle}>
            <CatalogList onCountChange={setSubtitle} />
        </WorkTabs>
    );
};

export default EditDirectories;
