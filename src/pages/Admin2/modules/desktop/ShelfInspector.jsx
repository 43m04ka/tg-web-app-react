import React, {useCallback, useEffect, useMemo, useState} from 'react';
import {Button, ButtonRow, Field, Input, Inspector, InspectorSection, Note, SearchInput, Toggle} from '../../ui';
import {askConfirm} from '../../platform/notify';
import {keys} from '../../platform/resources';
import {useMutation} from '../../platform/useMutation';
import {createDesktopShelf, deleteDesktopShelf, updateDesktopShelf} from './api';
import {emptyShelf, shelfProblem, toShelfDraft, toShelfPayload, toggleCatalog} from './desktopModel';
import style from './DesktopScreen.module.scss';

const normalize = (value) => String(value || '').trim().toLowerCase();

export default function ShelfInspector({shelf, groups, count, onDraft, onClose}) {
    const isNew = !shelf;

    const [draft, setDraft] = useState(() => (isNew ? emptyShelf(count) : toShelfDraft(shelf)));
    const [query, setQuery] = useState('');

    useEffect(() => {
        onDraft(draft);
    }, [draft, onDraft]);

    const dirty = useMemo(() => {
        if (isNew) return Boolean(draft.title.trim() || draft.catalogIds.length);
        return JSON.stringify(toShelfPayload(draft)) !== JSON.stringify(toShelfPayload(toShelfDraft(shelf)));
    }, [draft, shelf, isNew]);

    const problem = shelfProblem(draft);

    const save = useMutation(
        (input) => (isNew ? createDesktopShelf(input) : updateDesktopShelf(shelf.id, input)),
        {
            invalidates: [keys.desktopShelves],
            done: isNew ? 'Сводный каталог создан' : 'Сводный каталог сохранён',
            onDone: onClose
        }
    );

    const remove = useMutation(() => deleteDesktopShelf(shelf.id), {
        invalidates: [keys.desktopShelves],
        done: 'Сводный каталог удалён',
        onDone: onClose
    });

    const askRemove = useCallback(async () => {
        const answer = await askConfirm({
            title: 'Удалить сводный каталог?',
            text: shelf.title,
            consequence: 'Полка пропадёт с главной ПК. Обычные каталоги и товары останутся.',
            confirmText: 'Удалить',
            tone: 'danger'
        });

        if (answer) remove.run();
    }, [shelf, remove]);

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
            title={isNew ? 'Новый сводный каталог' : (shelf.title || 'Сводный каталог')}
            subtitle="Полка на главной ПК"
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
            <InspectorSection title="Полка">
                <Field label="Название" required>
                    <Input
                        value={draft.title}
                        placeholder="Популярное"
                        onChange={(event) => setDraft((prev) => ({...prev, title: event.target.value}))}
                    />
                </Field>

                <Toggle
                    checked={draft.isHidden}
                    label="Скрыть с главной"
                    onChange={(value) => setDraft((prev) => ({...prev, isHidden: value}))}
                />
            </InspectorSection>

            <InspectorSection
                title={`Каталоги · ${draft.catalogIds.length}`}
                note="Товары отмеченных каталогов идут в одну полку. Одна и та же игра из PS Турция и PS Индия становится одной карточкой с выбором региона и меньшей ценой."
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
