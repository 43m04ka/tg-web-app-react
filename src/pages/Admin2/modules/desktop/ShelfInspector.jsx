import React, {useCallback, useEffect, useMemo, useState} from 'react';
import {Button, ButtonRow, Field, Input, Inspector, InspectorSection, Note, SearchInput, Select, Toggle} from '../../ui';
import {askConfirm} from '../../platform/notify';
import {keys} from '../../platform/resources';
import {useMutation} from '../../platform/useMutation';
import {createDesktopShelf, deleteDesktopShelf, updateDesktopShelf} from './api';
import {
    FLAG_OPTIONS,
    PLATFORM_OPTIONS,
    REGION_OPTIONS,
    emptyShelf,
    shelfProblem,
    toShelfDraft,
    toShelfPayload,
    toggleCatalog
} from './desktopModel';
import style from './DesktopScreen.module.scss';

const normalize = (value) => String(value || '').trim().toLowerCase();

const TEXTS = {
    shelf: {
        noun: 'Сводный каталог',
        fresh: 'Новый сводный каталог',
        subtitle: 'Полка на главной ПК',
        created: 'Сводный каталог создан',
        saved: 'Сводный каталог сохранён',
        removed: 'Сводный каталог удалён',
        askRemove: 'Удалить сводный каталог?',
        consequence: 'Полка пропадёт с главной ПК. Обычные каталоги и товары останутся.',
        placeholder: 'Популярное',
        hide: 'Скрыть с главной',
        catalogsNote: 'Товары отмеченных каталогов идут в одну полку. Одна и та же игра из PS Турция и PS Индия становится одной карточкой с выбором региона и меньшей ценой.'
    },
    filter: {
        noun: 'Категория',
        fresh: 'Новая категория',
        subtitle: 'Кнопка над полкой «Популярное» на главной ПК',
        created: 'Категория создана',
        saved: 'Категория сохранена',
        removed: 'Категория удалена',
        askRemove: 'Удалить категорию?',
        consequence: 'Кнопка пропадёт с главной ПК. Каталоги и товары останутся.',
        placeholder: 'PS5',
        hide: 'Скрыть кнопку',
        catalogsNote: 'Необязательно. Если ничего не отмечено, категория отбирает товары самой полки. Если отмечено — показывает товары этих каталогов, к ним тоже применяются платформа и витрина.'
    }
};

export default function ShelfInspector({shelf, kind = 'shelf', groups, count, onDraft, onClose}) {
    const isNew = !shelf;
    const isCategory = kind === 'filter';
    const text = TEXTS[isCategory ? 'filter' : 'shelf'];

    const [draft, setDraft] = useState(() => (isNew ? emptyShelf(count, kind) : toShelfDraft(shelf)));
    const [query, setQuery] = useState('');

    useEffect(() => {
        onDraft(draft);
    }, [draft, onDraft]);

    const dirty = useMemo(() => {
        if (isNew) return Boolean(draft.title.trim() || draft.catalogIds.length);
        return JSON.stringify(toShelfPayload(draft)) !== JSON.stringify(toShelfPayload(toShelfDraft(shelf)));
    }, [draft, shelf, isNew]);

    const problem = shelfProblem(draft);

    const setOption = useCallback((name) => (event) => {
        const value = event.target.value;
        setDraft((prev) => ({...prev, options: {...prev.options, [name]: value}}));
    }, []);

    const save = useMutation(
        (input) => (isNew ? createDesktopShelf(input) : updateDesktopShelf(shelf.id, input)),
        {
            invalidates: [keys.desktopShelves],
            done: isNew ? text.created : text.saved,
            onDone: onClose
        }
    );

    const remove = useMutation(() => deleteDesktopShelf(shelf.id), {
        invalidates: [keys.desktopShelves],
        done: text.removed,
        onDone: onClose
    });

    const askRemove = useCallback(async () => {
        const answer = await askConfirm({
            title: text.askRemove,
            text: shelf.title,
            consequence: text.consequence,
            confirmText: 'Удалить',
            tone: 'danger'
        });

        if (answer) remove.run();
    }, [shelf, remove, text]);

    const visible = useMemo(() => {
        const needle = normalize(query);
        if (!needle) return groups;

        return groups
            .map((group) => ({
                ...group,
                items: normalize(group.pageName).includes(needle)
                    ? group.items
                    : group.items.filter((item) => normalize(`${item.label} ${item.path}`).includes(needle))
            }))
            .filter((group) => group.items.length > 0);
    }, [groups, query]);

    return (
        <Inspector
            open
            width="m"
            title={isNew ? text.fresh : (shelf.title || text.noun)}
            subtitle={text.subtitle}
            dirty={dirty}
            onClose={onClose}
            footer={(
                <ButtonRow>
                    <Button
                        variant="primary"
                        disabled={save.loading || Boolean(problem)}
                        onClick={() => save.run(toShelfPayload(draft))}
                    >
                        {save.loading ? 'Сохраняем…' : 'Сохранить'}
                    </Button>
                    <Button variant="ghost" onClick={onClose}>Отмена</Button>
                    {isNew ? null : (
                        <Button variant="ghost" disabled={remove.loading} onClick={askRemove}>Удалить</Button>
                    )}
                </ButtonRow>
            )}
        >
            <InspectorSection title={isCategory ? 'Кнопка' : 'Полка'}>
                <Field label="Название" required>
                    <Input
                        value={draft.title}
                        placeholder={text.placeholder}
                        onChange={(event) => setDraft((prev) => ({...prev, title: event.target.value}))}
                    />
                </Field>

                <Toggle
                    checked={draft.isHidden}
                    label={text.hide}
                    onChange={(value) => setDraft((prev) => ({...prev, isHidden: value}))}
                />
            </InspectorSection>

            {isCategory ? (
                <InspectorSection
                    title="Что показывает"
                    note="Платформа и витрина сужают список. Кнопка появляется на сайте, только если под неё есть хотя бы одна игра."
                >
                    <Field label="Флаг на кнопке">
                        <Select options={FLAG_OPTIONS} value={draft.options.flag} onChange={setOption('flag')}/>
                    </Field>

                    <Field label="Платформа">
                        <Select options={PLATFORM_OPTIONS} value={draft.options.platform} onChange={setOption('platform')}/>
                    </Field>

                    <Field label="Витрина">
                        <Select options={REGION_OPTIONS} value={draft.options.region} onChange={setOption('region')}/>
                    </Field>
                </InspectorSection>
            ) : null}

            <InspectorSection
                title={`Каталоги · ${draft.catalogIds.length}`}
                note={text.catalogsNote}
            >
                <SearchInput value={query} onChange={setQuery} placeholder="Каталог или витрина"/>

                <div className={style.catalogGroups}>
                    {visible.map((group) => (
                        <div key={group.pageId} className={style.catalogGroup}>
                            <span className={style.catalogPage}>{group.pageName}</span>

                            {group.items.map((item) => {
                                const checked = draft.catalogIds.includes(item.id);

                                return (
                                    <label key={item.id} className={`${style.catalog} ${checked ? style.catalogOn : ''}`}>
                                        <input
                                            type="checkbox"
                                            checked={checked}
                                            onChange={() => setDraft((prev) => toggleCatalog(prev, item.id))}
                                        />
                                        <span className={style.catalogName}>{item.label}</span>
                                        {item.name ? <span className={style.catalogPath}>{item.path}</span> : null}
                                    </label>
                                );
                            })}
                        </div>
                    ))}
                </div>
            </InspectorSection>

            {problem ? <Note tone="neutral">{problem}</Note> : null}
        </Inspector>
    );
}
