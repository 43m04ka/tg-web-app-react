import React, {useCallback, useEffect, useMemo, useState} from 'react';
import useGlobalData from '../../../../../hooks/useGlobalData';
import useData from '../../../useData';
import {useServer} from '../useServer';
import StartPagePreview from './StartPagePreview';
import EditStartPageItem from './EditStartPageItem';
import {START_PAGE_DEFAULTS, encodeStartPageContent} from './startPageContent';
import style from './EditStartPages.module.scss';

const PLATFORMS = [
    {key: 'tg', name: 'Telegram'},
    {key: 'vk-xbox', name: 'VK Xbox'},
    {key: 'vk-ps', name: 'VK PS'},
    {key: 'web', name: 'Web'},
];

const EditStartPages = () => {
    const {pageList, updatePageList} = useGlobalData();
    const {authenticationData} = useData();
    const {getStartPageList, updateStartPage} = useServer();

    const [platform, setPlatform] = useState('tg');
    const [allItems, setAllItems] = useState([]);
    const [loading, setLoading] = useState(false);
    const [editItem, setEditItem] = useState(null);
    const [createType, setCreateType] = useState(null);
    const [draggedItem, setDraggedItem] = useState(null);
    const [dropTargetId, setDropTargetId] = useState(null);

    const loadItems = useCallback(async () => {
        setLoading(true);
        await getStartPageList((result) => {
            setAllItems(Array.isArray(result) ? result : []);
            setLoading(false);
        });
    }, [getStartPageList]);

    useEffect(() => {
        updatePageList(true);
        loadItems();
    }, []);

    const platformItems = useMemo(
        () => allItems
            .filter((item) => item.platform === platform)
            .sort((a, b) => a.serialNumber - b.serialNumber),
        [allItems, platform],
    );

    const handleAdd = (type) => {
        const nextSerial = platformItems.length
            ? Math.max(...platformItems.map((item) => item.serialNumber)) + 1
            : 0;

        const draft = {
            type,
            platform,
            serialNumber: nextSerial,
            structurePageId: null,
            icon: '',
            text: '',
            pattern: '',
        };

        setCreateType(type);
        setEditItem(draft);
    };

    const handleDragStart = (event, item) => {
        setDraggedItem(item);
        event.dataTransfer.effectAllowed = 'move';
    };

    const handleDragOver = (event, targetItem) => {
        event.preventDefault();
        event.dataTransfer.dropEffect = 'move';
        if (draggedItem && draggedItem.id !== targetItem.id) {
            setDropTargetId(targetItem.id);
        }
    };

    const handleDrop = async (event, targetItem) => {
        event.preventDefault();
        setDropTargetId(null);

        if (!draggedItem || draggedItem.id === targetItem.id) {
            setDraggedItem(null);
            return;
        }

        const currentList = [...platformItems];
        const fromIndex = currentList.findIndex((item) => item.id === draggedItem.id);
        const toIndex = currentList.findIndex((item) => item.id === targetItem.id);

        if (fromIndex === -1 || toIndex === -1) {
            setDraggedItem(null);
            return;
        }

        const reordered = [...currentList];
        const [moved] = reordered.splice(fromIndex, 1);
        reordered.splice(toIndex, 0, moved);

        setDraggedItem(null);

        const updates = reordered.map((item, index) => ({
            id: item.id,
            serialNumber: index,
        }));

        for (const update of updates) {
            await updateStartPage(authenticationData, update.id, {serialNumber: update.serialNumber});
        }

        await loadItems();
    };

    const handleDragEnd = () => {
        setDraggedItem(null);
        setDropTargetId(null);
    };

    const closeEditor = () => {
        setEditItem(null);
        setCreateType(null);
    };

    const editorItem = editItem
        ? (editItem.id ? editItem : {...editItem, type: createType || editItem.type})
        : null;

    return (
        <div className={style.mainContainer}>
            <div className={style.childContainer}>
                <div className={style.header}>
                    <div>
                        <div className={style.headerTitle}>Первая страница</div>
                    </div>
                    <button type="button" className={style.reloadButton} onClick={loadItems} disabled={loading}>
                        ⟳ Обновить
                    </button>
                </div>
                
                <div className={style.platformTabs}>
                    {PLATFORMS.map((item) => (
                        <button
                            key={item.key}
                            type="button"
                            className={`${style.platformTab} ${platform === item.key ? style.platformTabActive : ''}`}
                            onClick={() => setPlatform(item.key)}
                        >
                            {item.name}
                        </button>
                    ))}
                </div>

                <div className={style.toolbar}>
                    <button type="button" className={style.addButton} onClick={() => handleAdd('title')}>
                        + Заголовок
                    </button>
                    <button type="button" className={style.addButton} onClick={() => handleAdd('label')}>
                        + Надпись
                    </button>
                    <button type="button" className={style.addButton} onClick={() => handleAdd('page')}>
                        + Страница
                    </button>
                    <button type="button" className={style.addButton} onClick={() => handleAdd('link')}>
                        + Ссылка
                    </button>
                </div>
            </div>

            <StartPagePreview
                items={platformItems}
                pageList={pageList}
                draggedItem={draggedItem}
                dropTargetId={dropTargetId}
                onEdit={setEditItem}
                onDragStart={handleDragStart}
                onDragOver={handleDragOver}
                onDrop={handleDrop}
                onDragEnd={handleDragEnd}
            />

            {editorItem ? (
                <EditStartPageItem
                    item={editorItem}
                    platform={platform}
                    onClose={closeEditor}
                    onSaved={loadItems}
                />
            ) : null}
        </div>
    );
};

export default EditStartPages;
