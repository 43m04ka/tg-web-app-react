import React, {useCallback, useMemo, useRef, useState} from 'react';
import {
    Badge,
    Button,
    EmptyState,
    ErrorState,
    Note,
    SearchInput,
    SkeletonRows,
} from '../../ui';
import {useResource} from '../../platform/useResource';
import {useMutation} from '../../platform/useMutation';
import {keys} from '../../platform/resources';
import {invalidate} from '../../platform/cache';
import {askConfirm, toast, toastFail} from '../../platform/notify';
import {createFolder, deleteFile, deleteFolder, fetchFolder, uploadFiles} from './api';
import {MAX_FILES, MAX_SIZE_MB, checkFiles, crumbsOf, parentOf, splitEntries} from './mediaModel';
import {pluralOf} from '../../../../shared/lib/plural';
import style from './MediaBrowser.module.scss';

const FOLDER_WORDS = ['папка', 'папки', 'папок'];
const FILE_WORDS = ['файл', 'файла', 'файлов'];

const countTitle = (count, words) => `${count} ${pluralOf(count, words)}`;

const copyAddress = async (url) => {
    try {
        await navigator.clipboard.writeText(url);
        toast({tone: 'positive', title: 'Адрес скопирован'});
    } catch {
        toastFail('Буфер обмена недоступен', url);
    }
};

export default function MediaBrowser({onPick = null, selected = '', compact = false}) {
    const [path, setPath] = useState('');
    const [search, setSearch] = useState('');
    const [folderName, setFolderName] = useState('');
    const [dragOver, setDragOver] = useState(false);

    const inputRef = useRef(null);

    const folder = useResource(keys.mediaFolder(path), () => fetchFolder(path));
    const entries = useMemo(() => splitEntries(folder.data, search), [folder.data, search]);

    const refresh = useCallback(() => invalidate(keys.media), []);

    const upload = useMutation(uploadFiles, {
        invalidates: [keys.media],
        onDone: (result) => toast({tone: 'positive', title: result?.message || 'Файлы загружены'}),
    });

    const makeFolder = useMutation(createFolder, {invalidates: [keys.media], done: 'Папка создана'});
    const dropFile = useMutation(deleteFile, {invalidates: [keys.media], done: 'Файл удалён'});
    const dropFolder = useMutation(deleteFolder, {invalidates: [keys.media], done: 'Папка удалена'});

    const send = useCallback((files) => {
        const checked = checkFiles(files);

        if (checked.tooMany) toastFail(`За раз загружается не больше ${MAX_FILES} файлов`, 'Лишние пропущены');
        if (checked.wrongType.length) toastFail('Пропущены не изображения', checked.wrongType.map((file) => file.name).join(', '));
        if (checked.tooBig.length) toastFail(`Пропущены файлы больше ${MAX_SIZE_MB} МБ`, checked.tooBig.map((file) => file.name).join(', '));

        if (checked.list.length) upload.run({files: checked.list, folder: path});
    }, [upload, path]);

    const onDrop = useCallback((event) => {
        event.preventDefault();
        setDragOver(false);
        send(event.dataTransfer.files);
    }, [send]);

    const onNewFolder = useCallback(() => {
        const name = folderName.trim();
        if (!name) return;

        makeFolder.run({folderName: name, parentPath: path});
        setFolderName('');
    }, [folderName, makeFolder, path]);

    const onDeleteFile = useCallback(async (file) => {
        const answer = await askConfirm({
            title: `Удалить «${file.name}»?`,
            text: 'Файл исчезнет с сервера сразу. Ссылки на него нигде не проверяются — если картинка стоит в карточке или баннере, там останется битый адрес.',
            confirmText: 'Удалить',
            tone: 'danger',
        });

        if (answer) dropFile.run(file.path);
    }, [dropFile]);

    const onDeleteFolder = useCallback(async (item) => {
        const answer = await askConfirm({
            title: `Удалить папку «${item.name}»?`,
            text: 'Удаляется вместе со всем содержимым, включая вложенные папки. Восстановить нельзя.',
            confirmText: 'Удалить папку',
            tone: 'danger',
        });

        if (answer) dropFolder.run(item.path);
    }, [dropFolder]);

    const crumbs = crumbsOf(path);

    return (
        <div className={`${style.browser} ${compact ? style.compact : ''}`}>
            <div className={style.bar}>
                <div className={style.barTop}>
                    {path ? (
                        <Button size="s" variant="secondary" onClick={() => setPath(parentOf(path))}>← Наверх</Button>
                    ) : null}

                    <nav className={style.crumbs}>
                        {crumbs.map((crumb, index) => (
                            <React.Fragment key={crumb.path || 'root'}>
                                {index ? <span className={style.sep}>/</span> : null}
                                <button
                                    type="button"
                                    className={`${style.crumb} ${index === crumbs.length - 1 ? style.crumbLast : ''}`}
                                    onClick={() => setPath(crumb.path)}
                                >
                                    {crumb.title}
                                </button>
                            </React.Fragment>
                        ))}
                    </nav>

                    <span className={style.summary}>
                        {countTitle(entries.folders.length, FOLDER_WORDS)} · {countTitle(entries.files.length, FILE_WORDS)}
                    </span>

                    <div className={style.barTools}>
                        <SearchInput value={search} onChange={setSearch} placeholder="Имя файла"/>
                        <Button size="s" variant="ghost" onClick={refresh}>Обновить</Button>
                    </div>
                </div>

                <div className={style.actionsCard}>
                    <button
                        type="button"
                        className={style.uploadTile}
                        disabled={upload.loading}
                        onClick={() => inputRef.current?.click()}
                    >
                        <span className={style.uploadIcon}>↑</span>
                        <span className={style.uploadText}>
                            <span className={style.uploadTitle}>{upload.loading ? 'Загружаем…' : 'Загрузить файлы'}</span>
                            <span className={style.uploadHint}>или перетащите картинки в окно ниже</span>
                        </span>
                    </button>

                    <div className={style.folderForm}>
                        <span className={style.folderFormIcon}/>
                        <input
                            className={style.folderInput}
                            value={folderName}
                            placeholder="Название новой папки"
                            onChange={(event) => setFolderName(event.target.value)}
                            onKeyDown={(event) => {
                                if (event.key === 'Enter') onNewFolder();
                            }}
                        />
                        <Button
                            size="s"
                            variant="primary"
                            disabled={!folderName.trim()}
                            loading={makeFolder.loading}
                            onClick={onNewFolder}
                        >
                            Создать папку
                        </Button>
                    </div>
                </div>
            </div>


            <input
                ref={inputRef}
                type="file"
                accept="image/*"
                multiple
                className={style.hiddenInput}
                onChange={(event) => {
                    send(event.target.files);
                    event.target.value = '';
                }}
            />

            <div
                className={`${style.dropZone} ${dragOver ? style.dropActive : ''}`}
                onDragOver={(event) => {
                    event.preventDefault();
                    setDragOver(true);
                }}
                onDragLeave={() => setDragOver(false)}
                onDrop={onDrop}
            >
                {folder.error ? <ErrorState error={folder.error} onRetry={folder.refresh}/> : null}

                {!folder.error && folder.isLoading ? <SkeletonRows count={4}/> : null}

                {!folder.error && !folder.isLoading ? (
                    <>
                        {entries.folders.length ? (
                            <section className={style.group}>
                            <span className={style.groupTitle}>
                                Папки
                                <span className={style.groupCount}>{entries.folders.length}</span>
                            </span>
                            <div className={style.folders}>
                                {entries.folders.map((item) => (
                                    <div key={item.path} className={style.folder}>
                                        <button type="button" className={style.folderOpen} onClick={() => setPath(item.path)}>
                                            <span className={style.folderIcon}/>
                                            <span className={style.folderName}>{item.name}</span>
                                        </button>
                                        <Button size="s" variant="ghost" onClick={() => onDeleteFolder(item)}>Удалить</Button>
                                    </div>
                                ))}
                            </div>
                            </section>
                        ) : null}

                        {entries.files.length ? (
                            <section className={style.group}>
                            <span className={style.groupTitle}>
                                Файлы
                                <span className={style.groupCount}>{entries.files.length}</span>
                                <span className={style.groupHint}>клик по картинке копирует адрес</span>
                            </span>
                            <div className={style.grid}>
                                {entries.files.map((file) => (
                                    <figure
                                        key={file.path}
                                        className={`${style.tile} ${selected === file.url ? style.tileActive : ''}`}
                                    >
                                        <button
                                            type="button"
                                            className={style.thumbButton}
                                            onClick={() => (onPick ? onPick(file) : copyAddress(file.url))}
                                            title={onPick ? 'Выбрать' : 'Скопировать адрес'}
                                        >
                                            <img className={style.thumb} src={file.url} alt={file.name} loading="lazy"/>
                                        </button>

                                        <figcaption className={style.caption}>
                                            <span className={style.name} title={file.name}>{file.name}</span>
                                            <div className={style.tileActions}>
                                                <Button size="s" variant="ghost" onClick={() => copyAddress(file.url)}>Адрес</Button>
                                                <Button size="s" variant="ghost" onClick={() => onDeleteFile(file)}>Удалить</Button>
                                            </div>
                                        </figcaption>
                                    </figure>
                                ))}
                            </div>
                            </section>
                        ) : null}

                        {!entries.folders.length && !entries.files.length ? (
                            <EmptyState
                                title={search ? 'Ничего не нашлось' : 'В папке пусто'}
                                text={search ? 'Измените запрос' : 'Перетащите картинки сюда или нажмите «Загрузить файлы»'}
                            />
                        ) : null}
                    </>
                ) : null}
            </div>

            {compact ? null : (
                <Note>
                    {`Принимаются только изображения, до ${MAX_FILES} штук за раз и не больше ${MAX_SIZE_MB} МБ каждое. `}
                    Имя файла приводится к латинице, к нему добавляется отметка времени.
                </Note>
            )}

            {upload.loading ? <Badge tone="info">Загрузка идёт</Badge> : null}
        </div>
    );
}
