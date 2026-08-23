import React, {useCallback, useEffect, useMemo, useRef, useState} from 'react';
import {useNavigate} from 'react-router-dom';
import s from './StructurePanel.module.scss';
import {useServer} from '../useServer';
import useData from '../../../useData';
import {useFeedback} from '../../../Elements/Feedback/Feedback';
import StructureBlockForm from './StructureBlockForm';
import BannerPanel from './BannerPanel';
import {describeBlock, describeTarget, detectKind} from './structureKinds';
import {hasStructure, typeName, STRUCTURELESS_SECTIONS} from './pageOptions';

// СТРУКТУРА СТРАНИЦЫ
// ------------------
// Правая половина экрана «Страницы»: карусель и основное содержимое выбранной страницы.
//
// Раньше это были два почти дословно совпадающих компонента (Head и Body, 258 и 277 строк)
// внутри отдельного раздела меню со своим выбором страницы. Отличались они списком колонок
// и набором полей формы, всё остальное — поиск, drag&drop, копирование, удаление —
// было скопировано и уже начало расходиться. Здесь это одна панель, а разницу между
// группами описывает structureKinds.js.

const GROUPS = [
    {key: 'banners', label: 'Карусель', hint: 'Верхняя карусель страницы'},
    {key: 'body', label: 'Тело сайта', hint: 'Каталоги и баннеры под каруселью'},
    {key: 'head', label: 'Карусель старого бота', hint: 'Слайдер прежнего дизайна — пока жив старый бот'},
];

// Баннеры лежат в своей таблице и к structureCatalogs отношения не имеют —
// общий у них только экран, на котором их правят.
const isBlockGroup = (group) => group !== 'banners';

const StructurePanel = ({page}) => {
    const {
        getStructureCatalogList, createStructureCatalog,
        updateCatalogData, deleteStructureCatalog,
    } = useServer();
    const {authenticationData} = useData();
    const {showToast, confirm} = useFeedback();
    const navigate = useNavigate();

    const serverRef = useRef(null);
    serverRef.current = {getStructureCatalogList, createStructureCatalog, updateCatalogData, deleteStructureCatalog};

    const [group, setGroup] = useState('banners');
    const [items, setItems] = useState([]);
    const [loading, setLoading] = useState(false);
    const [busy, setBusy] = useState(false);
    const [search, setSearch] = useState('');

    // Форма живёт в этой же половине экрана: null — показываем список,
    // {item: null} — создание, {item} — правка
    const [editing, setEditing] = useState(null);
    const [clipboard, setClipboard] = useState(null);
    const [dragId, setDragId] = useState(null);

    const pageId = page?.id ?? null;
    const pageType = page?.type ?? null;

    const load = useCallback(async (targetGroup = group) => {
        // У витрин без блоков (Steam, Сервисы) запрашивать нечего — списка блоков
        // у них не бывает, и лишний запрос на каждый выбор строки не нужен
        if (!pageId || !hasStructure(pageType) || !isBlockGroup(targetGroup)) {
            setItems([]);
            return;
        }

        setLoading(true);
        await serverRef.current.getStructureCatalogList(pageId, targetGroup, (result) => {
            setItems(Array.isArray(result) ? result : []);
            setLoading(false);
        });
    }, [pageId, pageType, group]);

    useEffect(() => {
        setEditing(null);
        setSearch('');
        load(group);
    }, [load, group]);

    const visible = useMemo(() => {
        const query = search.trim().toLowerCase();
        if (!query) return items;

        return items.filter((item) => [item.name, item.path, item.url, String(item.serialNumber)]
            .some((value) => String(value ?? '').toLowerCase().includes(query)));
    }, [items, search]);

    /**
     * Записывает новый порядок.
     *
     * Шлём только те блоки, у которых номер реально изменился: раньше перетаскивание
     * одной строки переписывало весь список целиком — столько запросов, сколько
     * в группе блоков, даже если сдвинулись два.
     */
    const persistOrder = useCallback(async (ordered) => {
        const changed = ordered
            .map((item, index) => ({item, serialNumber: index + 1}))
            .filter(({item, serialNumber}) => item.serialNumber !== serialNumber);

        if (!changed.length) return;

        setBusy(true);
        try {
            for (const {item, serialNumber} of changed) {
                await serverRef.current.updateCatalogData(null, authenticationData, item.id, {serialNumber});
            }
            await load(group);
        } catch (error) {
            showToast(error.message || 'Не удалось изменить порядок', 'error');
        } finally {
            setBusy(false);
        }
    }, [authenticationData, load, group, showToast]);

    const move = useCallback((item, delta) => {
        const index = items.findIndex((entry) => entry.id === item.id);
        const target = index + delta;
        if (index === -1 || target < 0 || target >= items.length) return;

        const ordered = [...items];
        ordered.splice(target, 0, ordered.splice(index, 1)[0]);
        setItems(ordered);
        persistOrder(ordered);
    }, [items, persistOrder]);

    const handleDrop = (targetItem) => {
        if (dragId === null || dragId === targetItem.id) {
            setDragId(null);
            return;
        }

        const from = items.findIndex((entry) => entry.id === dragId);
        const to = items.findIndex((entry) => entry.id === targetItem.id);
        setDragId(null);
        if (from === -1 || to === -1) return;

        const ordered = [...items];
        ordered.splice(to, 0, ordered.splice(from, 1)[0]);
        setItems(ordered);
        persistOrder(ordered);
    };

    const handleSubmit = async (payload) => {
        try {
            if (editing?.item) {
                await serverRef.current.updateCatalogData(null, authenticationData, editing.item.id, payload);
                showToast('Блок сохранён', 'success');
            } else {
                await serverRef.current.createStructureCatalog(authenticationData, payload);
                showToast('Блок создан', 'success');
            }
            setEditing(null);
            await load(group);
        } catch (error) {
            showToast(error.message || 'Не удалось сохранить блок', 'error');
        }
    };

    const handleDelete = async (item) => {
        const agreed = await confirm({
            title: 'Удалить блок?',
            text: `${describeBlock(item, group)}${item.name ? ` — «${item.name}»` : ''}. Действие необратимо.`,
            confirmLabel: 'Удалить',
            danger: true,
        });
        if (!agreed) return;

        setBusy(true);
        try {
            await serverRef.current.deleteStructureCatalog(authenticationData, item.id);
            showToast('Блок удалён', 'success');
            await load(group);
        } catch (error) {
            showToast(error.message || 'Не удалось удалить блок', 'error');
        } finally {
            setBusy(false);
        }
    };

    /**
     * Копия блока внутри той же группы.
     *
     * Именно внутри: типы карусели и тела не пересекаются, и вставка слайдера
     * в основное содержимое дала бы блок с типом, которого витрина там не ждёт.
     * Поэтому в буфере лежит и группа, а кнопка вставки видна только в ней.
     */
    const handlePaste = async () => {
        if (!clipboard || clipboard.group !== group) return;

        setBusy(true);
        try {
            const {id, createdAt, updatedAt, ...rest} = clipboard.item;
            await serverRef.current.createStructureCatalog(authenticationData, {
                ...rest,
                structurePageId: pageId,
                group,
                serialNumber: items.length + 1,
            });
            showToast('Блок вставлен', 'success');
            await load(group);
        } catch (error) {
            showToast(error.message || 'Не удалось вставить блок', 'error');
        } finally {
            setBusy(false);
        }
    };

    // Витрина без блоков (Steam, Сервисы) выглядит так же, как «ничего не выбрано»:
    // кнопки групп неактивны, вместо списка — объяснение, почему настраивать нечего.
    const structureless = page && !hasStructure(page.type);
    const section = structureless ? STRUCTURELESS_SECTIONS[page.type] : null;

    const groupBar = (
        <div className={s['groupBar']}>
            {GROUPS.map((option) => (
                <button key={option.key} type="button"
                        className={`${s['groupBtn']} ${group === option.key ? s['groupBtnActive'] : ''}`}
                        title={option.hint}
                        disabled={!page}
                        onClick={() => setGroup(option.key)}>
                    {option.label}
                </button>
            ))}
            {isBlockGroup(group) ? (
                <span className={s['groupCount']}>
                    {loading ? 'Загрузка…' : `${items.length} ${items.length === 1 ? 'блок' : 'блоков'}`}
                </span>
            ) : null}
        </div>
    );

    // Баннеры живут в своей таблице, а не в блоках страницы, поэтому им не мешает
    // ни отсутствие структуры у витрины (Steam, Сервисы), ни её тип.
    if (page && group === 'banners') {
        return (
            <div className={s['panel']}>
                {groupBar}
                <BannerPanel page={page}/>
            </div>
        );
    }

    if (!page || structureless) {
        return (
            <div className={s['panel']}>
                {groupBar}
                <div className={s['placeholder']}>
                    <p className={s['placeholderTitle']}>
                        {structureless ? 'Каталоги не настраиваются' : 'Страница не выбрана'}
                    </p>
                    <p className={s['placeholderText']}>
                        {structureless
                            ? `Для витрин «${typeName(page.type)}» карусель и тело сайта не используются — страница собирается не блоками.`
                            : 'Выберите страницу слева — здесь появятся её карусель и основное содержимое.'}
                    </p>

                    {section ? (
                        <button type="button" className={`${s['btn']} ${s['btnPrimary']}`}
                                onClick={() => navigate(section.path)}>
                            Перейти в «{section.label}»
                        </button>
                    ) : null}
                </div>
            </div>
        );
    }

    if (editing) {
        return (
            <div className={s['panel']}>
                <StructureBlockForm
                    group={group}
                    item={editing.item}
                    structurePageId={pageId}
                    nextSerialNumber={items.length + 1}
                    onSubmit={handleSubmit}
                    onCancel={() => setEditing(null)}
                />
            </div>
        );
    }

    return (
        <div className={s['panel']}>
            {groupBar}

            <div className={s['panelTools']}>
                <input className={s['searchInput']} placeholder="Поиск по названию, пути или номеру"
                       value={search} onChange={(event) => setSearch(event.target.value)}/>
                <button type="button" className={`${s['btn']} ${s['btnPrimary']}`}
                        disabled={busy} onClick={() => setEditing({item: null})}>
                    Добавить блок
                </button>
                {clipboard?.group === group ? (
                    <button type="button" className={s['btn']} disabled={busy} onClick={handlePaste}>
                        Вставить копию
                    </button>
                ) : null}
                <button type="button" className={s['btn']} disabled={busy} onClick={() => load(group)}>
                    Обновить
                </button>
            </div>

            <div className={s['blockList']}>
                {loading ? (
                    <p className={s['empty']}>Загрузка…</p>
                ) : visible.length === 0 ? (
                    <p className={s['empty']}>
                        {search ? 'Под поиск ничего не подошло' : 'В этой группе пока нет блоков'}
                    </p>
                ) : visible.map((item, index) => {
                    const kind = detectKind(item, group);

                    return (
                        <article key={item.id}
                                 className={`${s['block']} ${dragId === item.id ? s['blockDragging'] : ''}`}
                                 draggable={!search}
                                 onDragStart={() => setDragId(item.id)}
                                 onDragOver={(event) => event.preventDefault()}
                                 onDrop={() => handleDrop(item)}
                                 onDoubleClick={() => setEditing({item})}>
                            <div className={s['blockOrder']}>
                                <span className={s['blockNum']}>{item.serialNumber}</span>
                                {/* Стрелки рядом с перетаскиванием: мышью через длинный
                                    список тащить неудобно, а порядок здесь меняют часто */}
                                <button type="button" className={s['moveBtn']}
                                        disabled={busy || Boolean(search) || index === 0}
                                        title="Выше" onClick={() => move(item, -1)}>↑
                                </button>
                                <button type="button" className={s['moveBtn']}
                                        disabled={busy || Boolean(search) || index === visible.length - 1}
                                        title="Ниже" onClick={() => move(item, 1)}>↓
                                </button>
                            </div>

                            <div className={s['blockPreview']}>
                                {item.url ? (
                                    <img className={s['blockImage']} src={item.url} alt=""/>
                                ) : item.imageIcon ? (
                                    <img className={s['blockIcon']} src={item.imageIcon} alt=""/>
                                ) : (
                                    <span className={s['blockNoImage']}
                                          style={item.backgroundColor ? {background: item.backgroundColor} : undefined}/>
                                )}
                            </div>

                            <div className={s['blockBody']}>
                                <span className={s['blockTitle']}>
                                    {item.name || describeBlock(item, group)}
                                </span>
                                <span className={s['blockMeta']}>
                                    <span className={s['blockKind']}>{kind.label}</span>
                                    <span className={s['blockTarget']}>{describeTarget(item, group)}</span>
                                </span>
                            </div>

                            <div className={s['blockActions']}>
                                <button type="button" className={s['btn']} onClick={() => setEditing({item})}>
                                    Изменить
                                </button>
                                <button type="button" className={s['btn']}
                                        title="Скопировать в буфер этой группы"
                                        onClick={() => {
                                            setClipboard({item, group});
                                            showToast('Блок скопирован — вставьте его кнопкой сверху', 'info');
                                        }}>
                                    Копировать
                                </button>
                                <button type="button" className={`${s['btn']} ${s['btnDanger']}`}
                                        disabled={busy} onClick={() => handleDelete(item)}>
                                    Удалить
                                </button>
                            </div>
                        </article>
                    );
                })}
            </div>
        </div>
    );
};

export default StructurePanel;
