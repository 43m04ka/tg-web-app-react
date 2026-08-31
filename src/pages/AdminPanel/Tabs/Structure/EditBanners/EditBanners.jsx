import React, {useCallback, useEffect, useMemo, useRef, useState} from 'react';
import useGlobalData from '../../../legacy/useGlobalData';
import useData from '../../../useData';
import {useServer} from '../useServer';
import WorkTabs, {useWorkTabs} from '../../../Elements/WorkTabs/WorkTabs';
import {useFeedback} from '../../../Elements/Feedback/Feedback';
import BannerForm from './BannerForm';
import BannerPreview from './BannerPreview';
import {BANNER_TYPES, TYPE_LABELS, emptyBanner} from './bannerContent';
import s from '../EditStartPages/EditStartPages.module.scss';
import b from './EditBanners.module.scss';

// БАННЕРЫ ГЛАВНОЙ
// ---------------
// Слева порядок в карусели, справа — превью теми же пропорциями, что в боте.
// Начинка баннера лежит в data JSONB: новый вид баннера не требует миграции,
// достаточно нового значения type. Контракт — в BANNERS.md серверного репозитория.

const ALL_PAGES = 'all';

const BannersScreen = ({onCountChange}) => {
    const {pageList, updatePageList} = useGlobalData();
    const {authenticationData} = useData();

    const server = useServer();
    const serverRef = useRef(server);
    serverRef.current = server;

    const authRef = useRef(authenticationData);
    authRef.current = authenticationData;

    const {openTab, closeTab, closeTabsWhere, updateTab} = useWorkTabs();
    const {showToast} = useFeedback();

    const [allItems, setAllItems] = useState([]);
    const [pageFilter, setPageFilter] = useState(ALL_PAGES);
    const [loading, setLoading] = useState(true);
    const [savingOrder, setSavingOrder] = useState(false);

    const load = useCallback(async () => {
        setLoading(true);
        try {
            const result = await serverRef.current.getBannerList();
            setAllItems(Array.isArray(result) ? result : []);
        } catch (error) {
            showToast(error.message || 'Не удалось загрузить баннеры', 'error');
            setAllItems([]);
        } finally {
            setLoading(false);
        }
    }, [showToast]);

    useEffect(() => {
        updatePageList(true);
        load();
    }, [load, updatePageList]);

    const items = useMemo(() => {
        const list = pageFilter === ALL_PAGES
            ? allItems
            : allItems.filter((item) => String(item.pageId ?? '') === String(pageFilter));

        return [...list].sort((a, c) => a.serialNumber - c.serialNumber);
    }, [allItems, pageFilter]);

    const itemsRef = useRef([]);
    itemsRef.current = items;

    useEffect(() => {
        onCountChange(loading ? 'Загрузка…' : `${items.length} шт.`);
    }, [loading, items.length, onCountChange]);

    const openItem = useCallback((item) => {
        const id = item?.id ? `banner-${item.id}` : `banner-new-${item.type}`;

        openTab({
            id,
            title: item?.id ? (item.data?.title || TYPE_LABELS[item.type] || 'Баннер') : `Новый: ${TYPE_LABELS[item.type]}`,
            subtitle: item?.id ? `ID ${item.id}` : 'Создание',
            entity: 'banner',
            entityId: item?.id ?? -1,
            content: <BannerForm item={item} onClose={() => closeTab(id)} onSaved={load}/>,
        });
    }, [openTab, closeTab, load]);

    useEffect(() => {
        if (loading) return;
        const alive = new Set(allItems.map((item) => item.id));
        closeTabsWhere((tab) => tab.entity === 'banner' && tab.entityId > 0 && !alive.has(tab.entityId));
    }, [allItems, loading, closeTabsWhere]);

    useEffect(() => {
        allItems.forEach((item) => updateTab(`banner-${item.id}`, {
            title: item.data?.title || TYPE_LABELS[item.type] || 'Баннер',
            subtitle: `ID ${item.id}`,
        }));
    }, [allItems, updateTab]);

    const handleAdd = (type) => {
        const nextSerial = items.length ? Math.max(...items.map((item) => item.serialNumber)) + 1 : 0;
        const pageId = pageFilter === ALL_PAGES ? null : Number(pageFilter);

        openItem({...emptyBanner(type), pageId, serialNumber: nextSerial});
    };

    // Как и на стартовом экране: запросы уходят только по тем, у кого номер реально изменился
    const persistOrder = useCallback(async (reordered) => {
        const changed = reordered
            .map((item, index) => ({item, serialNumber: index}))
            .filter(({item, serialNumber}) => item.serialNumber !== serialNumber);

        if (!changed.length) return;

        setAllItems((prev) => prev.map((item) => {
            const patch = changed.find((entry) => entry.item.id === item.id);
            return patch ? {...item, serialNumber: patch.serialNumber} : item;
        }));

        setSavingOrder(true);
        try {
            for (const {item, serialNumber} of changed) {
                await serverRef.current.updateBanner(authRef.current, item.id, {serialNumber});
            }
        } catch (error) {
            showToast(error.message || 'Не удалось сохранить порядок', 'error');
            await load();
        } finally {
            setSavingOrder(false);
        }
    }, [showToast, load]);

    const move = useCallback((item, offset) => {
        const list = [...itemsRef.current];
        const from = list.findIndex((entry) => entry.id === item.id);
        const to = from + offset;
        if (from === -1 || to < 0 || to >= list.length) return;

        const [moved] = list.splice(from, 1);
        list.splice(to, 0, moved);
        persistOrder(list);
    }, [persistOrder]);

    const pageName = (pageId) => {
        if (pageId === null || pageId === undefined) return 'Все витрины';
        return (pageList || []).find((page) => page.id === pageId)?.name || `#${pageId}`;
    };

    return (
        <div className={s['screen']}>
            <header className={s['header']}>
                <div className={s['headerTop']}>
                    <h1 className={s['title']}>Баннеры главной</h1>
                    <span className={s['counter']}>{loading ? 'Загрузка…' : `${items.length} шт.`}</span>
                    <span className={s['headerHint']}>
                        {savingOrder ? 'Сохраняем порядок…' : 'Слева порядок в карусели, справа — превью'}
                    </span>
                </div>

                <div className={s['toolbar']}>
                    <select className={b['filter']} value={pageFilter}
                            onChange={(event) => setPageFilter(event.target.value)}>
                        <option value={ALL_PAGES}>Все баннеры</option>
                        <option value="">Без привязки к витрине</option>
                        {(pageList || []).filter((page) => page.isHidden !== 1).map((page) => (
                            <option key={page.id} value={String(page.id)}>{page.name}</option>
                        ))}
                    </select>

                    <button type="button" className={s['btn']} onClick={load}>Обновить</button>
                </div>

                <div className={s['toolbar']}>
                    <span className={s['toolbarLabel']}>Добавить:</span>
                    {BANNER_TYPES.map((type) => (
                        <button key={type} type="button" className={s['addBtn']} onClick={() => handleAdd(type)}>
                            + {TYPE_LABELS[type]}
                        </button>
                    ))}
                </div>
            </header>

            <div className={s['split']}>
                <section className={s['pane']}>
                    <div className={s['paneHead']}>
                        <span className={s['paneTitle']}>Порядок</span>
                        <span className={s['paneSubtitle']}>слева направо, как в карусели</span>
                    </div>

                    <div className={s['listWrap']}>
                        {items.length === 0 ? (
                            <p className={s['empty']}>
                                {loading ? 'Загрузка…' : 'Баннеров пока нет — добавьте первый'}
                            </p>
                        ) : items.map((item, index) => (
                            <div key={item.id} className={s['row']} onClick={() => openItem(item)}>
                                <span className={s['rowOrder']}>{index + 1}</span>
                                <span className={s['rowBody']}>
                                    <span className={s['rowTitle']}>
                                        {item.data?.title || TYPE_LABELS[item.type] || 'Баннер'}
                                    </span>
                                    <span className={s['rowMeta']}>
                                        <span className={s['tag']}>{TYPE_LABELS[item.type] || item.type}</span>
                                        <span className={s['tag']}>{pageName(item.pageId)}</span>
                                        {item.isHidden === 1 ? <span className={s['tag']}>скрыт</span> : null}
                                        <span className={s['mono']}>ID {item.id}</span>
                                    </span>
                                </span>
                                <span className={s['rowActions']} onClick={(event) => event.stopPropagation()}>
                                    <button type="button" className={s['iconBtn']}
                                            disabled={index === 0 || savingOrder}
                                            onClick={() => move(item, -1)} aria-label="Выше">↑</button>
                                    <button type="button" className={s['iconBtn']}
                                            disabled={index === items.length - 1 || savingOrder}
                                            onClick={() => move(item, 1)} aria-label="Ниже">↓</button>
                                </span>
                            </div>
                        ))}
                    </div>
                </section>

                <section className={s['pane']}>
                    <div className={s['paneHead']}>
                        <span className={s['paneTitle']}>Превью</span>
                        <span className={s['paneSubtitle']}>4:3, как в боте</span>
                    </div>

                    <div className={b['previewList']}>
                        {items.map((item) => (
                            <button key={item.id} type="button" className={b['previewItem']}
                                    onClick={() => openItem(item)}>
                                <BannerPreview banner={item}/>
                            </button>
                        ))}
                    </div>
                </section>
            </div>
        </div>
    );
};

const EditBanners = () => {
    const [subtitle, setSubtitle] = useState('');

    return (
        <WorkTabs rootTitle="Баннеры главной" rootSubtitle={subtitle}>
            <BannersScreen onCountChange={setSubtitle}/>
        </WorkTabs>
    );
};

export default EditBanners;
