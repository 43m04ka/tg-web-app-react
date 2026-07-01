import React, { useEffect, useMemo, useState } from 'react';
import PopUpWindow from '../../../Elements/PopUpWindow/PopUpWindow';
import InputLabel from '../../../Elements/Input/InputLabel';
import DropBox from '../../../Elements/DropBox/DropBox';
import useData from '../../../useData';
import useGlobalData from '../../../../../hooks/useGlobalData';
import { useServer } from '../useServer';
import style from './EditStartPageItem.module.scss';
import {
    START_PAGE_DEFAULTS,
    decodeStartPageContent,
    encodeStartPageContent,
    fileToDataUrl,
} from './startPageContent';
import DropImage from '../../../Elements/DropImage/DropImage';

const TYPE_LABELS = {
    title: 'Заголовок',
    label: 'Надпись',
    page: 'Страница',
    link: 'Ссылка'
};

const EditStartPageItem = ({ item, platform, onClose, onSaved }) => {
    const isNew = !item?.id;
    const { authenticationData } = useData();
    const { pageList } = useGlobalData();
    const { createStartPage, updateStartPage, deleteStartPage } = useServer();

    const [type, setType] = useState(item?.type || 'title');
    const [text, setText] = useState(item.text || '');
    const [icon, setIcon] = useState(item.icon);
    const [color, setColor] = useState(item.color);
    const [pattern, setPattern] = useState(item.pattern);
    const [iconBar, setIconBar] = useState(item.icon_bar);
    const [url, setUrl] = useState(item.url || '');
    const [structurePageId, setStructurePageId] = useState(item?.structurePageId || null);
    const [infoLabel, setInfoLabel] = useState('');
    const [busy, setBusy] = useState(false);

    const platformPages = useMemo(
        () => (pageList || []).filter((page) => page.platform === platform && page.isHide !== 1),
        [pageList, platform],
    );

    const pageOptions = useMemo(
        () => platformPages.map((page) => ({ key: page.id, name: `${page.name} (#${page.id})` })),
        [platformPages],
    );

    const selectedPageIndex = Math.max(
        0,
        pageOptions.findIndex((option) => option.key === structurePageId),
    );

    useEffect(() => {
        if (type !== 'page' || structurePageId || !platformPages.length) {
            return;
        }
        setStructurePageId(platformPages[0].id);
    }, [type, structurePageId, platformPages]);


    const handleSave = async () => {
        setBusy(true);
        setInfoLabel('');

        const payload = {
            platform,
            type,
            url,
            iconBar,
            icon: icon,
            pattern: pattern,
            text: text,
            serialNumber: item?.serialNumber ?? 0,
        };

        console.log(payload)

        if (type === 'page') {
            if (!structurePageId) {
                setInfoLabel('Выберите страницу для карточки');
                setBusy(false);
                return;
            }
            payload.structurePageId = structurePageId;
        }

        try {
            if (isNew) {
                await createStartPage(authenticationData, payload);
            } else {
                await updateStartPage(authenticationData, item.id, {
                    type,
                    icon: icon,
                    icon_bar: iconBar,
                    url: url,
                    icon: icon,
                    pattern: pattern,
                    color: color,
                    text: text,
                    ...(type === 'page' ? { structurePageId } : {}),
                });
            }
            onSaved();
            onClose();
        } catch {
            setInfoLabel('Не удалось сохранить элемент');
        } finally {
            setBusy(false);
        }
    };

    const handleDelete = async () => {
        if (isNew) {
            onClose();
            return;
        }

        setBusy(true);
        try {
            await deleteStartPage(authenticationData, item.id);
            onSaved();
            onClose();
        } catch {
            setInfoLabel('Не удалось удалить элемент');
        } finally {
            setBusy(false);
        }
    };

    const titleText = TYPE_LABELS[type] || 'Элемент';

    return (
        <PopUpWindow
            title={isNew ? `Добавить: ${titleText}` : `Редактировать: ${titleText}`}
            onClose={onClose}
        >
            <div className={style.container}>
                <div className={style.typeRow}>
                    <button
                        type="button"
                        className={`${style.typeButton} ${type === 'title' ? style.typeButtonActive : ''}`}
                        onClick={() => setType('title')}
                        disabled={!isNew}
                    >
                        Заголовок
                    </button>
                    <button
                        type="button"
                        className={`${style.typeButton} ${type === 'label' ? style.typeButtonActive : ''}`}
                        onClick={() => setType('label')}
                        disabled={!isNew}
                    >
                        Надпись
                    </button>
                    <button
                        type="button"
                        className={`${style.typeButton} ${type === 'page' ? style.typeButtonActive : ''}`}
                        onClick={() => setType('page')}
                        disabled={!isNew}
                    >
                        Страница
                    </button>
                    <button
                        type="button"
                        className={`${style.typeButton} ${type === 'link' ? style.typeButtonActive : ''}`}
                        onClick={() => setType('link')}
                        disabled={!isNew}
                    >
                        Ссылка
                    </button>
                </div>

                {type === 'title' && (
                    <>
                        <InputLabel
                            label="Текст заголовка"
                            defaultValue={text || START_PAGE_DEFAULTS.title}
                            onChange={(event) => setText(event.target.value)}
                        />
                        <DropImage setValue={setIcon} icon={icon} label={'Иконка'} />
                    </>
                )}

                {type === 'label' && (
                    <InputLabel
                        label="Текст надписи"
                        defaultValue={text || START_PAGE_DEFAULTS.label}
                        onChange={(event) => setText(event.target.value)}
                    />
                )}

                {type === 'page' && (
                    <>
                        <div className={style.dropboxLabel}>Привязанная страница</div>
                        {pageOptions.length ? (
                            <>
                                <DropBox
                                    label={pageOptions}
                                    defaultIndex={selectedPageIndex}
                                    onChange={(index) => setStructurePageId(pageOptions[index]?.key ?? null)}
                                />
                                <InputLabel
                                    label="Текст под заголовком"
                                    defaultValue={text || ''}
                                    onChange={(event) => setText(event.target.value)}
                                />
                                <DropImage setValue={setPattern} icon={pattern} label={'Паттерн'} />
                                <DropImage setValue={setIcon} icon={icon} label={'Иконка'} />
                                <DropImage setValue={setIconBar} icon={iconBar} label={'Иконка бара'} />
                                <div className={style['colorInputGroup']}>
                                    <label className={style['colorLabel']}>Цвет</label>
                                    <input
                                        className={style['colorInput']}
                                        type="color"
                                        defaultValue={item.color || '#000000'}
                                        onChange={(e) => setColor(e.target.value)}
                                    />
                                </div>
                            </>
                        ) : (
                            <div className={style.emptyPages}>Нет страниц для выбранной платформы</div>
                        )}
                    </>
                )}

                {type === 'link' && (
                    <>
                        <InputLabel
                            label="Текст"
                            defaultValue={text || ''}
                            onChange={(event) => setText(event.target.value)}
                        />
                        <InputLabel
                            label="URL ссылки"
                            defaultValue={url || ''}
                            onChange={(event) => setUrl(event.target.value)}
                        />
                        <DropImage setValue={setIcon} icon={icon} label={'Иконка'} />
                        <div className={style['colorInputGroup']}>
                            <label className={style['colorLabel']}>Цвет</label>
                            <input
                                className={style['colorInput']}
                                type="color"
                                defaultValue={item.color || '#000000'}
                                onChange={(e) => setColor(e.target.value)}
                            />
                        </div>
                    </>
                )}

                {infoLabel ? <div className={style.infoLabel}>{infoLabel}</div> : null}

                <div className={style.actions}>
                    {!isNew ? (
                        <button type="button" className={style.deleteButton} onClick={handleDelete} disabled={busy}>
                            Удалить
                        </button>
                    ) : (
                        <span />
                    )}
                    <div className={style.actionsRight}>
                        <button type="button" className={style.cancelButton} onClick={onClose} disabled={busy}>
                            Отмена
                        </button>
                        <button type="button" className={style.saveButton} onClick={handleSave} disabled={busy}>
                            Сохранить
                        </button>
                    </div>
                </div>
            </div>
        </PopUpWindow>
    );
};

export default EditStartPageItem;
