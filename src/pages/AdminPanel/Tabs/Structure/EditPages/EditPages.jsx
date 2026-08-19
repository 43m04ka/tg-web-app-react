import React, {useCallback, useEffect, useMemo, useState} from 'react';
import useGlobalData from "../../../../../hooks/useGlobalData";
import style from "./EditPages.module.scss";
import PageForm from "./PageForm";
import StructurePanel from "./StructurePanel";
import WorkTabs, {useWorkTabs} from "../../../Elements/WorkTabs/WorkTabs";
import {BOT_OPTIONS, typeName, botName} from "./pageOptions";

// СТРАНИЦЫ ВИТРИНЫ
// ----------------
// Экран разделён надвое: слева сами страницы, справа — оформление выбранной.
// Раньше это были два раздела меню («Страницы» и «Структура»), и в каждом страница
// выбиралась заново, своим способом: в одном таблицей, в другом списком кнопок,
// который появлялся только после нажатия «вернуться к выбору страницы».

const STATUS_FILTERS = [
    {key: 'all', label: 'Все'},
    {key: 'visible', label: 'Отображены'},
    {key: 'hidden', label: 'Скрыты'},
];

const PagesList = ({onCountChange}) => {
    const {pageList, updatePageList} = useGlobalData();
    const {openTab, closeTab, updateTab} = useWorkTabs();

    const [search, setSearch] = useState('');
    const [botFilter, setBotFilter] = useState('');
    const [statusFilter, setStatusFilter] = useState('all');
    const [selectedId, setSelectedId] = useState(null);

    // Список приходит из общего стора; true — админский режим, со скрытыми страницами
    const reload = useCallback(() => updatePageList(true), [updatePageList]);

    useEffect(() => {
        reload();
    }, [reload]);

    const visibleList = useMemo(() => {
        const query = search.trim().toLowerCase();

        return [...(pageList || [])]
            .filter((page) => {
                if (botFilter && page.botType !== botFilter) return false;
                if (statusFilter === 'hidden' && page.isHidden !== 1) return false;
                if (statusFilter === 'visible' && page.isHidden === 1) return false;

                if (!query) return true;
                return String(page.name || '').toLowerCase().includes(query)
                    || String(page.link || '').toLowerCase().includes(query)
                    || String(page.id).includes(query);
            })
            // Порядок в боте задаётся serialNumber — список показывает его же,
            // чтобы «первая страница» в админке и в боте означали одно и то же
            .sort((a, b) => (a.serialNumber ?? 0) - (b.serialNumber ?? 0)
                || String(a.name || '').localeCompare(String(b.name || '')));
    }, [pageList, search, botFilter, statusFilter]);

    const selectedPage = useMemo(
        () => (pageList || []).find((page) => page.id === selectedId) || null,
        [pageList, selectedId],
    );

    // Страницу удалили или отфильтровали — правая половина не должна остаться
    // с оформлением того, чего на экране больше нет
    useEffect(() => {
        if (selectedId === null) return;
        if (!visibleList.some((page) => page.id === selectedId)) setSelectedId(null);
    }, [visibleList, selectedId]);

    useEffect(() => {
        if (!pageList) {
            onCountChange('Загрузка…');
            return;
        }
        onCountChange(`${visibleList.length} из ${pageList.length}`);
    }, [pageList, visibleList.length, onCountChange]);

    const openPage = useCallback((page) => {
        const id = page ? `page-${page.id}` : 'page-new';

        openTab({
            id,
            title: page ? page.name || `Страница ${page.id}` : 'Новая страница',
            subtitle: page ? `${typeName(page.type)} · ${botName(page.botType)}` : 'Создание',
            entity: 'page',
            entityId: page?.id ?? -1,
            content: (
                <PageForm
                    pageId={page?.id ?? -1}
                    onClose={() => closeTab(id)}
                    onSaved={reload}
                />
            ),
        });
    }, [openTab, closeTab, reload]);

    // Переименование страницы обновляет подпись открытой вкладки
    useEffect(() => {
        (pageList || []).forEach((page) => updateTab(`page-${page.id}`, {
            title: page.name || `Страница ${page.id}`,
            subtitle: `${typeName(page.type)} · ${botName(page.botType)}`,
        }));
    }, [pageList, updateTab]);

    const filtersActive = Boolean(search || botFilter || statusFilter !== 'all');

    return (
        <div className={style['screen']}>
            <header className={style['header']}>
                <h1 className={style['title']}>Страницы</h1>
                <span className={style['counter']}>
                    {pageList ? `${visibleList.length} из ${pageList.length}` : 'Загрузка…'}
                </span>
                <span className={style['headerHint']}>
                    Слева — страницы, справа — оформление выбранной
                </span>
            </header>

            <div className={style['split']}>
                <section className={style['pane']}>
                    <div className={style['toolbar']}>
                        <div className={style['searchField']}>
                            <svg className={style['searchIcon']} viewBox="0 0 24 24" width="16" height="16"
                                 fill="none" stroke="currentColor" strokeWidth="2" aria-hidden>
                                <circle cx="11" cy="11" r="7"/>
                                <path d="m20 20-3.5-3.5" strokeLinecap="round"/>
                            </svg>
                            <input className={style['searchInput']}
                                   placeholder="Поиск по названию, ссылке или ID"
                                   value={search}
                                   onChange={(event) => setSearch(event.target.value)}/>
                            {search ? (
                                <button type="button" className={style['searchClear']}
                                        onClick={() => setSearch('')} aria-label="Очистить">
                                    ✕
                                </button>
                            ) : null}
                        </div>

                        <button type="button" className={`${style['btn']} ${style['btnPrimary']}`}
                                onClick={() => openPage(null)}>
                            Создать
                        </button>
                        <button type="button" className={style['btn']}
                                disabled={!selectedPage}
                                title={selectedPage ? undefined : 'Сначала выберите страницу'}
                                onClick={() => openPage(selectedPage)}>
                            Редактировать
                        </button>
                        <button type="button" className={style['btn']} onClick={reload}>
                            Обновить
                        </button>
                    </div>

                    {/* Фильтры отдельной строкой: в половине экрана они не помещаются
                        рядом с поиском и кнопками и ломались бы в три ряда */}
                    <div className={style['toolbar']}>
                        <select className={style['filterSelect']} value={botFilter}
                                onChange={(event) => setBotFilter(event.target.value)}>
                            <option value="">Все площадки</option>
                            {BOT_OPTIONS.map((option) => (
                                <option key={option.key} value={option.key}>{option.name}</option>
                            ))}
                        </select>

                        <div className={style['segmented']}>
                            {STATUS_FILTERS.map((filter) => (
                                <button key={filter.key} type="button"
                                        className={`${style['segment']} ${statusFilter === filter.key ? style['segmentActive'] : ''}`}
                                        onClick={() => setStatusFilter(filter.key)}>
                                    {filter.label}
                                </button>
                            ))}
                        </div>

                        {filtersActive ? (
                            <button type="button" className={style['btnGhost']}
                                    onClick={() => {
                                        setSearch('');
                                        setBotFilter('');
                                        setStatusFilter('all');
                                    }}>
                                Сбросить
                            </button>
                        ) : null}
                    </div>

                    <div className={style['tableWrap']}>
                        <table className={style['table']}>
                            <thead>
                                <tr>
                                    <th className={style['orderCol']}>№</th>
                                    <th>Название</th>
                                    <th className={style['typeCol']}>Тип</th>
                                    <th className={style['botCol']}>Площадка</th>
                                    <th className={style['statusCol']}>Статус</th>
                                </tr>
                            </thead>
                            <tbody>
                                {!pageList ? (
                                    <tr><td colSpan={5} className={style['emptyCell']}>Загрузка…</td></tr>
                                ) : visibleList.length === 0 ? (
                                    <tr>
                                        <td colSpan={5} className={style['emptyCell']}>
                                            {filtersActive ? 'Под фильтры ничего не подошло' : 'Страниц пока нет'}
                                        </td>
                                    </tr>
                                ) : visibleList.map((page) => (
                                    <tr key={page.id}
                                        className={page.id === selectedId ? style['rowSelected'] : ''}
                                        onClick={() => setSelectedId(page.id)}
                                        onDoubleClick={() => openPage(page)}>
                                        <td className={`${style['orderCol']} ${style['mono']}`}>{page.serialNumber ?? '—'}</td>
                                        <td className={style['nameCell']}>
                                            <span className={style['nameRow']}>
                                                {page.barIcon ? (
                                                    <img className={style['barIcon']} src={page.barIcon} alt=""/>
                                                ) : <span className={style['barIconEmpty']} aria-hidden/>}
                                                <span className={style['name']}>{page.name || `Страница ${page.id}`}</span>
                                            </span>
                                            <span className={style['rowMeta']}>
                                                <span className={style['mono']}>ID {page.id}</span>
                                                {page.link ? <span className={style['link']}>{page.link}</span> : null}
                                            </span>
                                        </td>
                                        <td className={style['typeCol']}>{typeName(page.type)}</td>
                                        <td className={style['botCol']}>{botName(page.botType)}</td>
                                        <td className={style['statusCol']}>
                                            <span className={page.isHidden === 1 ? style['badgeOff'] : style['badgeOn']}>
                                                {page.isHidden === 1 ? 'Скрыта' : 'Отображена'}
                                            </span>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </section>

                <section className={style['pane']}>
                    <div className={style['paneHead']}>
                        <span className={style['paneTitle']}>Оформление</span>
                        <span className={style['paneSubtitle']}>
                            {selectedPage
                                ? `${selectedPage.name || `Страница ${selectedPage.id}`} · ${typeName(selectedPage.type)}`
                                : 'страница не выбрана'}
                        </span>
                    </div>

                    <StructurePanel page={selectedPage}/>
                </section>
            </div>
        </div>
    );
};

const EditPages = () => {
    const [subtitle, setSubtitle] = useState('');

    return (
        <WorkTabs rootTitle="Страницы" rootSubtitle={subtitle}>
            <PagesList onCountChange={setSubtitle}/>
        </WorkTabs>
    );
};

export default EditPages;
