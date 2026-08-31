import React, {useEffect, useMemo, useRef, useState} from 'react';
import {useHosting} from '../../legacy/useHosting';
import {useFeedback} from '../../Elements/Feedback/Feedback';
import s from './Hosting.module.scss';

const FolderIcon = () => (
    <svg className={s['icon']} viewBox="0 0 24 24" width="28" height="28"
         fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden>
        <path d="M3 7.5A1.5 1.5 0 0 1 4.5 6h4l2 2.5h7A1.5 1.5 0 0 1 19 10v7.5A1.5 1.5 0 0 1 17.5 19h-13A1.5 1.5 0 0 1 3 17.5z"
              strokeLinejoin="round"/>
    </svg>
);

const FileIcon = () => (
    <svg className={s['icon']} viewBox="0 0 24 24" width="28" height="28"
         fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden>
        <path d="M6 3.5h7L18 8v12.5H6z" strokeLinejoin="round"/>
        <path d="M13 3.5V8h5" strokeLinejoin="round"/>
    </svg>
);

const CopyIcon = () => (
    <svg viewBox="0 0 24 24" width="14" height="14"
         fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden>
        <rect x="9" y="9" width="11" height="11" rx="2"/>
        <path d="M5 15V6a1 1 0 0 1 1-1h9" strokeLinecap="round"/>
    </svg>
);

const Thumb = ({url, name}) => {
    const [broken, setBroken] = useState(false);

    if (broken) {
        return (
            <div className={s['thumbFallback']}>
                <FileIcon/>
            </div>
        );
    }

    return (
        <img className={s['thumb']} src={url} alt={name} loading="lazy" onError={() => setBroken(true)}/>
    );
};

const AdminGallery = () => {
    const {
        items, loading, error, currentPath,
        fetchContents, uploadFiles, createFolder, deleteItem, clearError,
    } = useHosting();

    const {showToast, confirm} = useFeedback();

    const [newFolderName, setNewFolderName] = useState('');
    const [search, setSearch] = useState('');
    const [dragging, setDragging] = useState(false);
    const dragDepth = useRef(0);

    useEffect(() => {
        fetchContents('');
    }, [fetchContents]);

    useEffect(() => {
        if (!error) return;
        showToast(error, 'error');
        clearError();
    }, [error, showToast, clearError]);

    const crumbs = useMemo(() => currentPath.split('/').filter(Boolean), [currentPath]);

    const visibleItems = useMemo(() => {
        const query = search.trim().toLowerCase();

        return [...(items || [])]
            .filter((item) => !query || String(item.name || '').toLowerCase().includes(query))
            .sort((a, b) => {
                if (a.type !== b.type) return a.type === 'folder' ? -1 : 1;
                return String(a.name || '').localeCompare(String(b.name || ''));
            });
    }, [items, search]);

    const folderCount = visibleItems.filter((item) => item.type === 'folder').length;
    const fileCount = visibleItems.length - folderCount;

    const handleUpload = async (event) => {
        const selectedFiles = event.target.files;
        if (!selectedFiles.length) return;

        await uploadFiles(selectedFiles, currentPath);
        event.target.value = null;
    };

    const handleCreateFolder = () => {
        const name = newFolderName.trim();
        if (!name) return;

        createFolder(name, currentPath);
        setNewFolderName('');
    };

    const handleDelete = async (item) => {
        const agreed = await confirm({
            title: item.type === 'folder' ? 'Удалить папку?' : 'Удалить файл?',
            text: item.type === 'folder'
                ? `«${item.name}» удалится вместе со всем содержимым. Ссылки на файлы внутри перестанут работать.`
                : `«${item.name}» удалится с хостинга. Если ссылка на него уже стоит в каталоге или баннере, картинка пропадёт с витрины.`,
            confirmLabel: 'Удалить',
            danger: true,
        });
        if (!agreed) return;

        deleteItem(item.path, item.type);
    };

    const handleCopy = (item) => {
        navigator.clipboard.writeText(item.url);
        showToast('Ссылка скопирована', 'success');
    };

    const handleDrop = (event) => {
        event.preventDefault();
        dragDepth.current = 0;
        setDragging(false);

        const dropped = event.dataTransfer?.files;
        if (dropped?.length) uploadFiles(dropped, currentPath);
    };

    return (
        <div className={s['screen']}>
            <header className={s['header']}>
                <div className={s['headerTop']}>
                    <h1 className={s['title']}>Хостинг</h1>
                    <span className={s['counter']}>
                        {loading ? 'Загрузка…' : `${folderCount} папок · ${fileCount} файлов`}
                    </span>
                </div>

                <div className={s['toolbar']}>
                    <div className={s['searchField']}>
                        <svg className={s['searchIcon']} viewBox="0 0 24 24" width="16" height="16"
                             fill="none" stroke="currentColor" strokeWidth="2" aria-hidden>
                            <circle cx="11" cy="11" r="7"/>
                            <path d="m20 20-3.5-3.5" strokeLinecap="round"/>
                        </svg>
                        <input className={s['searchInput']}
                               placeholder="Поиск в этой папке"
                               value={search}
                               onChange={(event) => setSearch(event.target.value)}/>
                        {search ? (
                            <button type="button" className={s['searchClear']}
                                    onClick={() => setSearch('')} aria-label="Очистить">
                                ✕
                            </button>
                        ) : null}
                    </div>

                    <div className={s['folderField']}>
                        <input className={s['folderInput']}
                               value={newFolderName}
                               placeholder="Новая папка"
                               onChange={(event) => setNewFolderName(event.target.value)}
                               onKeyDown={(event) => {
                                   if (event.key === 'Enter') handleCreateFolder();
                               }}/>
                        <button type="button" className={s['folderBtn']}
                                disabled={!newFolderName.trim()}
                                onClick={handleCreateFolder}>
                            Создать
                        </button>
                    </div>

                    <div className={s['toolbarEnd']}>
                        <button type="button" className={s['btn']} onClick={() => fetchContents(currentPath)}>
                            Обновить
                        </button>

                        <input type="file" onChange={handleUpload} disabled={loading} id="upload" hidden multiple/>
                        <label htmlFor="upload"
                               className={`${s['btn']} ${s['btnPrimary']} ${loading ? s['btnDisabled'] : ''}`}>
                            {loading ? 'Загрузка…' : 'Загрузить файлы'}
                        </label>
                    </div>
                </div>

                <nav className={s['breadcrumbs']}>
                    <button type="button" className={s['crumb']}
                            disabled={!crumbs.length}
                            onClick={() => fetchContents('')}>
                        /data
                    </button>
                    {crumbs.map((crumb, index) => (
                        <React.Fragment key={`${crumb}-${index}`}>
                            <span className={s['crumbSep']}>/</span>
                            <button type="button" className={s['crumb']}
                                    disabled={index === crumbs.length - 1}
                                    onClick={() => fetchContents(crumbs.slice(0, index + 1).join('/'))}>
                                {crumb}
                            </button>
                        </React.Fragment>
                    ))}
                </nav>
            </header>

            <div className={`${s['gridWrap']} ${dragging ? s['gridWrapDrag'] : ''}`}
                 onDragEnter={(event) => {
                     event.preventDefault();
                     dragDepth.current += 1;
                     setDragging(true);
                 }}
                 onDragOver={(event) => event.preventDefault()}
                 onDragLeave={() => {
                     dragDepth.current = Math.max(0, dragDepth.current - 1);
                     if (!dragDepth.current) setDragging(false);
                 }}
                 onDrop={handleDrop}>
                {visibleItems.length === 0 ? (
                    <div className={s['empty']}>
                        <FolderIcon/>
                        <span>
                            {loading
                                ? 'Загрузка…'
                                : (search.trim() ? 'Ничего не найдено' : 'Папка пуста — перетащите сюда файлы')}
                        </span>
                    </div>
                ) : (
                    <div className={s['grid']}>
                        {visibleItems.map((item) => (
                            <div key={item.path}
                                 className={`${s['card']} ${item.type === 'folder' ? s['folderCard'] : ''}`}
                                 title={item.type === 'folder' ? item.name : 'Нажмите, чтобы скопировать ссылку'}
                                 onClick={item.type === 'folder'
                                     ? () => fetchContents(item.path)
                                     : () => handleCopy(item)}>
                                {item.type === 'folder' ? (
                                    <>
                                        <FolderIcon/>
                                        <div className={s['cardName']}>{item.name}</div>
                                    </>
                                ) : (
                                    <>
                                        <Thumb url={item.url} name={item.name}/>
                                        <div className={s['fileName']} title={item.name}>{item.name}</div>
                                    </>
                                )}

                                <div className={s['cardActions']}>
                                    {item.type === 'file' ? (
                                        <button type="button" className={s['cardBtn']}
                                                aria-label="Скопировать ссылку"
                                                onClick={(event) => {
                                                    event.stopPropagation();
                                                    handleCopy(item);
                                                }}>
                                            <CopyIcon/>
                                        </button>
                                    ) : null}

                                    <button type="button" className={`${s['cardBtn']} ${s['cardBtnDanger']}`}
                                            aria-label="Удалить"
                                            onClick={(event) => {
                                                event.stopPropagation();
                                                handleDelete(item);
                                            }}>
                                        ✕
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                )}

                {dragging ? <div className={s['dropHint']}>Отпустите файлы — загрузим в /data/{currentPath}</div> : null}
            </div>
        </div>
    );
};

export default AdminGallery;
