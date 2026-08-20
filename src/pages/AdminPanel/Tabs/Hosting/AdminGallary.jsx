import React, {useEffect, useMemo, useState} from 'react';
import {useHosting} from '../../../../hooks/useHosting';
import CopyButton from './CopyButton';
import {useFeedback} from '../../Elements/Feedback/Feedback';
import s from './Hosting.module.scss';

// ХОСТИНГ
// -------
// Файловый менеджер загруженных картинок. Экран был написан целиком инлайновыми
// стилями с захардкоженными цветами (#1c1c1e, #0a84ff, тени под кнопками) — в светлой
// теме он оставался тёмным, а «Удалить?» спрашивал нативный window.confirm.

const AdminGallery = () => {
    const {
        items, loading, error, currentPath,
        fetchContents, uploadFiles, createFolder, deleteItem, clearError,
    } = useHosting();

    const {showToast, confirm} = useFeedback();

    const [newFolderName, setNewFolderName] = useState('');

    useEffect(() => {
        fetchContents('');
    }, [fetchContents]);

    // Ошибка хука приходит строкой и живёт до clearError — показываем её тостом
    // и сразу гасим, иначе она повисала бы красной плашкой над списком
    useEffect(() => {
        if (!error) return;
        showToast(error, 'error');
        clearError();
    }, [error, showToast, clearError]);

    const crumbs = useMemo(() => currentPath.split('/').filter(Boolean), [currentPath]);

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

    return (
        <div className={s['screen']}>
            <header className={s['header']}>
                <div className={s['headerTop']}>
                    <h1 className={s['title']}>Хостинг</h1>
                    <span className={s['counter']}>
                        {loading ? 'Загрузка…' : `${items.length} шт.`}
                    </span>
                </div>

                <div className={s['toolbar']}>
                    <input type="file" onChange={handleUpload} disabled={loading} id="upload" hidden multiple/>
                    <label htmlFor="upload"
                           className={`${s['btn']} ${s['btnPrimary']} ${loading ? s['btnDisabled'] : ''}`}>
                        {loading ? 'Загрузка…' : 'Загрузить файл'}
                    </label>

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

                    <button type="button" className={s['btn']} onClick={() => fetchContents(currentPath)}>
                        Обновить
                    </button>
                </div>

                {/* Раньше здесь был только текущий путь и кнопка «Назад» на один уровень:
                    из вложенной папки к корню приходилось возвращаться по шагу */}
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

            <div className={s['gridWrap']}>
                {items.length === 0 ? (
                    <div className={s['empty']}>
                        <div className={s['emptyGlyph']}>📂</div>
                        {loading ? 'Загрузка…' : 'Папка пуста'}
                    </div>
                ) : (
                    <div className={s['grid']}>
                        {items.map((item) => (
                            <div key={item.path}
                                 className={`${s['card']} ${item.type === 'folder' ? s['folderCard'] : ''}`}
                                 onClick={item.type === 'folder' ? () => fetchContents(item.path) : undefined}>
                                {item.type === 'folder' ? (
                                    <>
                                        <div className={s['folderGlyph']}>📁</div>
                                        <div className={s['cardName']}>{item.name}</div>
                                    </>
                                ) : (
                                    <>
                                        <img className={s['thumb']} src={item.url} alt={item.name}/>
                                        <div className={s['fileName']} title={item.name}>{item.name}</div>
                                        <CopyButton url={item.url}/>
                                    </>
                                )}

                                <button type="button" className={s['removeBtn']}
                                        aria-label="Удалить"
                                        onClick={(event) => {
                                            event.stopPropagation();
                                            handleDelete(item);
                                        }}>
                                    ✕
                                </button>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

export default AdminGallery;
