import React, {useCallback, useEffect, useMemo, useRef, useState} from 'react';
import style from './Search.module.scss';
import {useServer} from './useServer';
import useGlobalData from '../../legacy/useGlobalData';
import WorkTabs, {useWorkTabs} from '../../Elements/WorkTabs/WorkTabs';
import {useFeedback} from '../../Elements/Feedback/Feedback';
import ClueForm from './ClueForm';

// ПОДСКАЗКИ В ПОИСКЕ
// ------------------
// Плоский список подсказок со всех страниц витрины. Раньше страница выбиралась
// собственным рядом кнопок-вкладок (при десятке страниц он уезжал в две строки),
// подсказка создавалась в попапе, редактировать её было нельзя вовсе,
// а удаление срабатывало с первого клика и перезагружало список по таймеру.

const CluesList = ({onCountChange}) => {
    const server = useServer();
    const serverRef = useRef(server);
    serverRef.current = server;

    const {pageList, updatePageList} = useGlobalData();
    const {openTab, closeTab, updateTab} = useWorkTabs();
    const {showToast} = useFeedback();

    const [clueList, setClueList] = useState([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [pageFilter, setPageFilter] = useState('');

    const load = useCallback(async () => {
        setLoading(true);
        try {
            const result = await serverRef.current.getClueList();
            setClueList(result);
        } catch (error) {
            showToast(error.message || 'Не удалось загрузить подсказки', 'error');
            setClueList([]);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => { load(); }, [load]);

    // Фильтр по странице берёт админский список — со скрытыми страницами тоже
    useEffect(() => { updatePageList(true); }, [updatePageList]);

    const pageNameById = useMemo(() => {
        const map = {};
        (pageList || []).forEach((page) => {
            map[page.id] = page.name || `Страница ${page.id}`;
        });
        return map;
    }, [pageList]);

    // Подсказок мало (десятки на всю витрину), поэтому фильтруем на клиенте:
    // отдельный запрос на каждое нажатие клавиши тут ничего не экономит
    const visibleList = useMemo(() => {
        const query = search.trim().toLowerCase();

        return [...(clueList || [])]
            .filter((clue) => {
                if (pageFilter && String(clue.structurePageId) !== String(pageFilter)) return false;
                if (!query) return true;
                return String(clue.name || '').toLowerCase().includes(query);
            })
            .sort((a, b) => String(a.name || '').localeCompare(String(b.name || '')));
    }, [clueList, search, pageFilter]);

    useEffect(() => {
        onCountChange(loading ? 'Загрузка…' : `${visibleList.length} из ${clueList.length}`);
    }, [loading, visibleList.length, clueList.length, onCountChange]);

    const openClue = useCallback((clue) => {
        const id = clue ? `clue-${clue.id}` : 'clue-new';

        openTab({
            id,
            title: clue ? (clue.name || `Подсказка ${clue.id}`) : 'Новая подсказка',
            subtitle: clue ? (pageNameById[clue.structurePageId] || 'Страница не найдена') : 'Создание',
            entity: 'clue',
            entityId: clue?.id ?? -1,
            content: (
                <ClueForm
                    clueId={clue?.id ?? -1}
                    initialName={clue?.name ?? ''}
                    initialPageId={clue?.structurePageId ?? (pageFilter ? Number(pageFilter) : null)}
                    onClose={() => closeTab(id)}
                    onSaved={load}
                />
            ),
        });
    }, [openTab, closeTab, load, pageNameById, pageFilter]);

    // Переименование подсказки не закрывает вкладку, а обновляет её подпись
    useEffect(() => {
        clueList.forEach((clue) => updateTab(`clue-${clue.id}`, {
            title: clue.name || `Подсказка ${clue.id}`,
            subtitle: pageNameById[clue.structurePageId] || 'Страница не найдена',
        }));
    }, [clueList, pageNameById, updateTab]);

    const filtersActive = Boolean(search || pageFilter);

    return (
        <div className={style['screen']}>
            <header className={style['header']}>
                <div className={style['headerTop']}>
                    <h1 className={style['title']}>Подсказки в поиске</h1>
                    <span className={style['counter']}>
                        {loading ? 'Загрузка…' : `${visibleList.length} из ${clueList.length}`}
                    </span>
                </div>

                <div className={style['toolbar']}>
                    <div className={style['searchField']}>
                        <svg className={style['searchIcon']} viewBox="0 0 24 24" width="16" height="16"
                             fill="none" stroke="currentColor" strokeWidth="2" aria-hidden>
                            <circle cx="11" cy="11" r="7"/>
                            <path d="m20 20-3.5-3.5" strokeLinecap="round"/>
                        </svg>
                        <input className={style['searchInput']}
                               placeholder="Поиск по тексту подсказки"
                               value={search}
                               onChange={(event) => setSearch(event.target.value)}/>
                        {search ? (
                            <button type="button" className={style['searchClear']}
                                    onClick={() => setSearch('')} aria-label="Очистить">
                                ✕
                            </button>
                        ) : null}
                    </div>

                    {/* Страниц в витрине много, поэтому фильтр — список, а не ряд вкладок */}
                    <select className={style['filterSelect']} value={pageFilter}
                            onChange={(event) => setPageFilter(event.target.value)}>
                        <option value="">Все страницы</option>
                        {(pageList || []).map((page) => (
                            <option key={page.id} value={page.id}>
                                {page.name || `Страница ${page.id}`}
                            </option>
                        ))}
                    </select>

                    <button type="button" className={`${style['btn']} ${style['btnPrimary']}`}
                            onClick={() => openClue(null)}>
                        Создать
                    </button>
                    <button type="button" className={style['btn']} onClick={load}>
                        Обновить
                    </button>
                    {filtersActive ? (
                        <button type="button" className={style['btn']}
                                onClick={() => {
                                    setSearch('');
                                    setPageFilter('');
                                }}>
                            Сбросить
                        </button>
                    ) : null}
                </div>
            </header>

            <div className={style['tableWrap']}>
                <table className={style['table']}>
                    <thead>
                        <tr>
                            <th className={style['idCol']}>ID</th>
                            <th>Текст подсказки</th>
                            <th className={style['pageCol']}>Страница</th>
                        </tr>
                    </thead>
                    <tbody>
                        {visibleList.length === 0 ? (
                            <tr>
                                <td className={style['emptyCell']} colSpan={3}>
                                    {loading
                                        ? 'Загрузка…'
                                        : (filtersActive ? 'Под фильтры ничего не подошло' : 'Подсказок пока нет')}
                                </td>
                            </tr>
                        ) : visibleList.map((clue) => (
                            <tr key={clue.id} onClick={() => openClue(clue)}>
                                <td className={style['mono']}>{clue.id}</td>
                                <td>{clue.name || '—'}</td>
                                <td className={style['pageCol']}>
                                    {pageNameById[clue.structurePageId] ? (
                                        <span className={style['badge']}>{pageNameById[clue.structurePageId]}</span>
                                    ) : (
                                        <span className={style['mono']}>страница не найдена</span>
                                    )}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

const Search = () => {
    const [subtitle, setSubtitle] = useState('');

    return (
        <WorkTabs rootTitle="Подсказки в поиске" rootSubtitle={subtitle}>
            <CluesList onCountChange={setSubtitle}/>
        </WorkTabs>
    );
};

export default Search;
