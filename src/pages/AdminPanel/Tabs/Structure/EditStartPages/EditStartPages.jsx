import React, {useCallback, useEffect, useMemo, useRef, useState} from 'react';
import useGlobalData from '../../../legacy/useGlobalData';
import useData from '../../../useData';
import {useServer} from '../useServer';
import StartPagePreview from './StartPagePreview';
import StartPageForm from './StartPageForm';
import WorkTabs, {useWorkTabs} from '../../../Elements/WorkTabs/WorkTabs';
import {useFeedback} from '../../../Elements/Feedback/Feedback';
import {TYPE_LABELS} from './startPageContent';
import {BOT_OPTIONS} from '../EditPages/pageOptions';
import style from './EditStartPages.module.scss';

// СТАРТОВЫЙ ЭКРАН
// ---------------
// Слева порядок элементов, справа — живое превью того же списка компонентами витрины.
// Элемент открывается вкладкой, а не попапом поверх превью: раньше форма перекрывала
// ровно то, что ею и правишь.

const PLATFORMS = BOT_OPTIONS;

const ADD_TYPES = ['title', 'label', 'page', 'link'];

const StartPagesScreen = ({onCountChange}) => {
    const {pageList, updatePageList} = useGlobalData();
    const {authenticationData} = useData();

    const server = useServer();
    const serverRef = useRef(server);
    serverRef.current = server;

    const authRef = useRef(authenticationData);
    authRef.current = authenticationData;

    const {openTab, closeTab, closeTabsWhere, updateTab} = useWorkTabs();
    const {showToast} = useFeedback();

    const [platform, setPlatform] = useState('tg');
    const [allItems, setAllItems] = useState([]);
    const [loading, setLoading] = useState(true);
    const [savingOrder, setSavingOrder] = useState(false);
    const [draggedItem, setDraggedItem] = useState(null);
    const [dropTargetId, setDropTargetId] = useState(null);

    const load = useCallback(async () => {
        setLoading(true);
        try {
            const result = await serverRef.current.getStartPageList();
            setAllItems(Array.isArray(result) ? result : []);
        } catch (error) {
            showToast(error.message || 'Не удалось загрузить стартовый экран', 'error');
            setAllItems([]);
        } finally {
            setLoading(false);
        }
    }, [showToast]);

    useEffect(() => {
        updatePageList(true);
        load();
    }, [load, updatePageList]);

    const platformItems = useMemo(
        () => allItems
            .filter((item) => item.platform === platform)
            .sort((a, b) => a.serialNumber - b.serialNumber),
        [allItems, platform],
    );

    const itemsRef = useRef([]);
    itemsRef.current = platformItems;

    useEffect(() => {
        onCountChange(loading
            ? 'Загрузка…'
            : `${PLATFORMS.find((item) => item.key === platform)?.name} · ${platformItems.length} шт.`);
    }, [loading, platform, platformItems.length, onCountChange]);

    const openItem = useCallback((item) => {
        const id = item?.id ? `startpage-${item.id}` : `startpage-new-${item.type}`;

        openTab({
            id,
            title: item?.id ? (TYPE_LABELS[item.type] || 'Элемент') : `Новый: ${TYPE_LABELS[item.type]}`,
            subtitle: item?.id ? `ID ${item.id}` : 'Создание',
            entity: 'startpage',
            entityId: item?.id ?? -1,
            content: (
                <StartPageForm
                    item={item}
                    platform={item.platform || platform}
                    onClose={() => closeTab(id)}
                    onSaved={load}
                />
            ),
        });
    }, [openTab, closeTab, load, platform]);

    // Элемент удалили — его вкладка вела бы в никуда. Сверяем с полным списком,
    // а не с выборкой платформы: переключение вкладок платформ ничего не закрывает
    useEffect(() => {
        if (loading) return;
        const alive = new Set(allItems.map((item) => item.id));
        closeTabsWhere((tab) => tab.entity === 'startpage' && tab.entityId > 0 && !alive.has(tab.entityId));
    }, [allItems, loading, closeTabsWhere]);

    useEffect(() => {
        allItems.forEach((item) => updateTab(`startpage-${item.id}`, {
            title: TYPE_LABELS[item.type] || 'Элемент',
            subtitle: `ID ${item.id}`,
        }));
    }, [allItems, updateTab]);

    const handleAdd = (type) => {
        const nextSerial = platformItems.length
            ? Math.max(...platformItems.map((item) => item.serialNumber)) + 1
            : 0;

        openItem({type, platform, serialNumber: nextSerial, structurePageId: null});
    };

    /**
     * Сохранение порядка. Раньше сюда уходил запрос на каждый элемент списка —
     * при перетаскивании первой карточки вниз перезаписывались serialNumber у всех.
     * Теперь запросы уходят только по тем, у кого номер реально изменился.
     */
    const persistOrder = useCallback(async (reordered) => {
        const changed = reordered
            .map((item, index) => ({item, serialNumber: index}))
            .filter(({item, serialNumber}) => item.serialNumber !== serialNumber);

        if (!changed.length) return;

        // Оптимистично показываем новый порядок: иначе список прыгает обратно
        // до конца всех запросов
        setAllItems((prev) => prev.map((item) => {
            const patch = changed.find((entry) => entry.item.id === item.id);
            return patch ? {...item, serialNumber: patch.serialNumber} : item;
        }));

        setSavingOrder(true);
        try {
            for (const {item, serialNumber} of changed) {
                await serverRef.current.updateStartPage(authRef.current, item.id, {serialNumber});
            }
        } catch (error) {
            showToast(error.message || 'Не удалось сохранить порядок', 'error');
            await load();
        } finally {
            setSavingOrder(false);
        }
    }, [showToast, load]);

    // Стрелки: тащить мышью через длинный список неудобно, а на сенсорном экране нечем
    const move = useCallback((item, offset) => {
        const list = [...itemsRef.current];
        const from = list.findIndex((entry) => entry.id === item.id);
        const to = from + offset;
        if (from === -1 || to < 0 || to >= list.length) return;

        const [moved] = list.splice(from, 1);
        list.splice(to, 0, moved);
        persistOrder(list);
    }, [persistOrder]);

    const handleDragStart = (event, item) => {
        setDraggedItem(item);
        event.dataTransfer.effectAllowed = 'move';
    };

    const handleDragOver = (event, targetItem) => {
        event.preventDefault();
        event.dataTransfer.dropEffect = 'move';
        if (draggedItem && draggedItem.id !== targetItem.id) setDropTargetId(targetItem.id);
    };

    const handleDrop = (event, targetItem) => {
        event.preventDefault();
        setDropTargetId(null);

        if (!draggedItem || draggedItem.id === targetItem.id) {
            setDraggedItem(null);
            return;
        }

        const list = [...platformItems];
        const from = list.findIndex((item) => item.id === draggedItem.id);
        const to = list.findIndex((item) => item.id === targetItem.id);
        setDraggedItem(null);

        if (from === -1 || to === -1) return;

        const [moved] = list.splice(from, 1);
        list.splice(to, 0, moved);
        persistOrder(list);
    };

    const handleDragEnd = () => {
        setDraggedItem(null);
        setDropTargetId(null);
    };

    return (
        <div className={style['screen']}>
            <header className={style['header']}>
                <div className={style['headerTop']}>
                    <h1 className={style['title']}>Стартовый экран</h1>
                    <span className={style['counter']}>
                        {loading ? 'Загрузка…' : `${platformItems.length} шт.`}
                    </span>
                    <span className={style['headerHint']}>
                        {savingOrder ? 'Сохраняем порядок…' : 'Слева порядок, справа — превью'}
                    </span>
                </div>

                <div className={style['toolbar']}>
                    <div className={style['segmented']}>
                        {PLATFORMS.map((item) => (
                            <button key={item.key} type="button"
                                    className={`${style['segment']} ${platform === item.key ? style['segmentActive'] : ''}`}
                                    onClick={() => setPlatform(item.key)}>
                                {item.name}
                            </button>
                        ))}
                    </div>

                    <button type="button" className={style['btn']} onClick={load}>Обновить</button>
                </div>

                <div className={style['toolbar']}>
                    <span className={style['toolbarLabel']}>Добавить:</span>
                    {ADD_TYPES.map((type) => (
                        <button key={type} type="button" className={style['addBtn']}
                                onClick={() => handleAdd(type)}>
                            + {TYPE_LABELS[type]}
                        </button>
                    ))}
                </div>
            </header>

            <div className={style['split']}>
                <section className={style['pane']}>
                    <div className={style['paneHead']}>
                        <span className={style['paneTitle']}>Порядок</span>
                        <span className={style['paneSubtitle']}>сверху вниз, как у покупателя</span>
                    </div>

                    <div className={style['listWrap']}>
                        {platformItems.length === 0 ? (
                            <p className={style['empty']}>
                                {loading ? 'Загрузка…' : 'На этой платформе пока пусто — добавьте первый элемент'}
                            </p>
                        ) : platformItems.map((item, index) => (
                            <div key={item.id} className={style['row']} onClick={() => openItem(item)}>
                                <span className={style['rowOrder']}>{index + 1}</span>
                                <span className={style['rowBody']}>
                                    <span className={style['rowTitle']}>
                                        {item.title || item.text || TYPE_LABELS[item.type] || 'Элемент'}
                                    </span>
                                    <span className={style['rowMeta']}>
                                        <span className={style['tag']}>{TYPE_LABELS[item.type] || item.type}</span>
                                        <span className={style['mono']}>ID {item.id}</span>
                                    </span>
                                </span>
                                <span className={style['rowActions']} onClick={(event) => event.stopPropagation()}>
                                    <button type="button" className={style['iconBtn']}
                                            disabled={index === 0 || savingOrder}
                                            onClick={() => move(item, -1)} aria-label="Выше">↑</button>
                                    <button type="button" className={style['iconBtn']}
                                            disabled={index === platformItems.length - 1 || savingOrder}
                                            onClick={() => move(item, 1)} aria-label="Ниже">↓</button>
                                </span>
                            </div>
                        ))}
                    </div>
                </section>

                <section className={style['pane']}>
                    <div className={style['paneHead']}>
                        <span className={style['paneTitle']}>Превью</span>
                        <span className={style['paneSubtitle']}>компонентами витрины</span>
                    </div>

                    <StartPagePreview
                        items={platformItems}
                        pageList={pageList}
                        draggedItem={draggedItem}
                        dropTargetId={dropTargetId}
                        onEdit={openItem}
                        onDragStart={handleDragStart}
                        onDragOver={handleDragOver}
                        onDrop={handleDrop}
                        onDragEnd={handleDragEnd}
                    />
                </section>
            </div>
        </div>
    );
};

const EditStartPages = () => {
    const [subtitle, setSubtitle] = useState('');

    return (
        <WorkTabs rootTitle="Стартовый экран" rootSubtitle={subtitle}>
            <StartPagesScreen onCountChange={setSubtitle}/>
        </WorkTabs>
    );
};

export default EditStartPages;
