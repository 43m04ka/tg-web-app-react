import React, {useCallback, useEffect, useMemo, useRef, useState} from 'react';
import style from './InfoBlock.module.scss';
import {useServer} from './useServer';
import WorkTabs, {useWorkTabs} from '../../Elements/WorkTabs/WorkTabs';
import {useFeedback} from '../../Elements/Feedback/Feedback';
import InfoBlockForm from './InfoBlockForm';

// АКЦИИ В РАЗДЕЛЕ «ЕЩЁ»
// ---------------------
// Плоский список: у блока три поля, отдельная панель справа была бы пустой.
// Строка открывает вкладку с формой — тем же способом, что «Заказы» и «Промокоды».

const InfoBlockList = ({onCountChange}) => {
    const server = useServer();
    const serverRef = useRef(server);
    serverRef.current = server;

    const {openTab, closeTab, updateTab} = useWorkTabs();
    const {showToast} = useFeedback();

    const [blockList, setBlockList] = useState(null);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');

    // Вкладка живёт дольше рендера, в котором её открыли: внутрь уходят только id
    // и стабильные колбэки, сам блок форма достаёт из актуального списка через ref
    const listRef = useRef([]);
    listRef.current = blockList || [];

    const load = useCallback(async () => {
        setLoading(true);
        try {
            const result = await serverRef.current.getInfoBlockList();
            setBlockList(result);
        } catch (error) {
            showToast(error.message || 'Не удалось загрузить список блоков', 'error');
            setBlockList([]);
        } finally {
            setLoading(false);
        }
    }, [showToast]);

    useEffect(() => { load(); }, [load]);

    const visibleList = useMemo(() => {
        const query = search.trim().toLowerCase();
        const list = blockList || [];

        if (!query) return list;

        return list.filter((block) => String(block.name || '').toLowerCase().includes(query)
            || String(block.body || '').toLowerCase().includes(query));
    }, [blockList, search]);

    useEffect(() => {
        if (loading) {
            onCountChange('Загрузка…');
            return;
        }
        onCountChange(`${visibleList.length} из ${(blockList || []).length}`);
    }, [loading, visibleList.length, blockList, onCountChange]);

    const findBlock = useCallback(
        (blockId) => listRef.current.find((block) => block.id === blockId) || null,
        [],
    );

    const openBlock = useCallback((block) => {
        const id = block ? `infoblock-${block.id}` : 'infoblock-new';

        openTab({
            id,
            title: block ? block.name || `Блок ${block.id}` : 'Новый блок',
            subtitle: block ? (block.path ? 'со ссылкой' : 'без ссылки') : 'Создание',
            entity: 'infoblock',
            entityId: block?.id ?? -1,
            content: (
                <InfoBlockForm
                    blockId={block?.id ?? -1}
                    findBlock={findBlock}
                    onClose={() => closeTab(id)}
                    onSaved={load}
                />
            ),
        });
    }, [openTab, closeTab, findBlock, load]);

    // Переименование не закрывает вкладку, а обновляет её подпись
    useEffect(() => {
        (blockList || []).forEach((block) => updateTab(`infoblock-${block.id}`, {
            title: block.name || `Блок ${block.id}`,
            subtitle: block.path ? 'со ссылкой' : 'без ссылки',
        }));
    }, [blockList, updateTab]);

    return (
        <div className={style['screen']}>
            <header className={style['header']}>
                <div className={style['headerTop']}>
                    <h1 className={style['title']}>Акции в «ещё»</h1>
                    <span className={style['counter']}>
                        {loading ? 'Загрузка…' : `${visibleList.length} из ${(blockList || []).length}`}
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
                               placeholder="Поиск по заголовку или описанию"
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
                            onClick={() => openBlock(null)}>
                        Создать
                    </button>
                    <button type="button" className={style['btn']} onClick={load}>
                        Обновить
                    </button>
                </div>
            </header>

            <div className={style['tableWrap']}>
                <table className={style['table']}>
                    <thead>
                        <tr>
                            <th className={style['idCol']}>ID</th>
                            <th>Заголовок</th>
                            <th>Описание</th>
                            <th className={style['linkCol']}>Ссылка</th>
                        </tr>
                    </thead>
                    <tbody>
                        {visibleList.length === 0 ? (
                            <tr>
                                <td className={style['emptyCell']} colSpan={4}>
                                    {loading
                                        ? 'Загрузка…'
                                        : (search.trim() ? 'Под поиск ничего не подошло' : 'Блоков пока нет')}
                                </td>
                            </tr>
                        ) : visibleList.map((block) => (
                            <tr key={block.id} onClick={() => openBlock(block)}>
                                <td className={style['mono']}>{block.id}</td>
                                <td className={style['nameCell']}>{block.name || '—'}</td>
                                <td className={style['bodyCell']}>{block.body || '—'}</td>
                                <td className={style['linkCol']}>
                                    {block.path ? (
                                        <span className={style['link']}>{block.path}</span>
                                    ) : (
                                        <span className={style['badgeMuted']}>нет</span>
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

const InfoBlock = () => {
    const [subtitle, setSubtitle] = useState('');

    return (
        <WorkTabs rootTitle="Акции в «ещё»" rootSubtitle={subtitle}>
            <InfoBlockList onCountChange={setSubtitle}/>
        </WorkTabs>
    );
};

export default InfoBlock;
