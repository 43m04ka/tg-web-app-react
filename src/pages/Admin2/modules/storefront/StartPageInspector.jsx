import React, {useCallback, useMemo, useState} from 'react';
import {
    Button,
    ButtonRow,
    Field,
    Input,
    Inspector,
    InspectorSection,
    Note,
    Select
} from '../../ui';
import {askConfirm} from '../../platform/notify';
import {keys} from '../../platform/resources';
import {useMutation} from '../../platform/useMutation';
import {createStartItem, deleteStartItem, updateStartItem} from './api';
import {
    START_PLATFORMS,
    START_TYPES,
    TYPE_HINTS,
    startProblem,
    startTitle,
    toDraft,
    toPayload,
    typeTitle
} from './startModel';

export default function StartPageInspector({item, platform, pages, count, onClose}) {
    const isNew = !item;

    const [draft, setDraft] = useState(() => (isNew
        ? {...toDraft(null), platform, serialNumber: count}
        : toDraft(item)));

    const dirty = useMemo(() => {
        if (isNew) return true;

        const base = toDraft(item);
        return Object.keys(base).some((field) => String(base[field]) !== String(draft[field]));
    }, [draft, item, isNew]);

    const problem = startProblem(draft);

    const save = useMutation(
        (input) => (isNew ? createStartItem(input) : updateStartItem(item.id, input)),
        {
            invalidates: [keys.startPages, keys.structure],
            done: isNew ? 'Запись добавлена' : 'Запись сохранена',
            onDone: onClose
        }
    );

    const remove = useMutation(() => deleteStartItem(item.id), {
        invalidates: [keys.startPages, keys.structure],
        done: 'Запись убрана',
        onDone: onClose
    });

    const set = useCallback((field) => (event) => {
        const {value} = event.target;
        setDraft((prev) => ({...prev, [field]: value}));
    }, []);

    const askRemove = useCallback(async () => {
        const answer = await askConfirm({
            title: 'Убрать запись со стартового экрана?',
            text: startTitle(item, pages),
            confirmText: 'Убрать',
            tone: 'danger'
        });

        if (answer) remove.run();
    }, [item, pages, remove]);

    const pageOptions = useMemo(() => ([
        {value: '', title: 'Не выбрана'},
        ...(pages || [])
            .filter((page) => page.botType === draft.platform)
            .map((page) => ({value: String(page.id), title: page.name || `Витрина №${page.id}`}))
    ]), [pages, draft.platform]);

    const isPage = draft.type === 'page';
    const isLink = draft.type === 'link';
    const isLabel = draft.type === 'label';

    return (
        <Inspector
            open
            width="s"
            title={isNew ? 'Новая запись' : startTitle(item, pages)}
            subtitle={typeTitle(draft.type)}
            dirty={dirty}
            onClose={onClose}
            footer={(
                <ButtonRow>
                    <Button
                        variant="primary"
                        disabled={save.loading || Boolean(problem) || !dirty}
                        onClick={() => save.run(toPayload(draft))}
                    >
                        {save.loading ? 'Сохраняем…' : 'Сохранить'}
                    </Button>

                    <Button variant="ghost" onClick={onClose}>Отмена</Button>

                    {isNew ? null : (
                        <Button variant="danger" disabled={remove.loading} onClick={askRemove}>Убрать</Button>
                    )}
                </ButtonRow>
            )}
        >
            <InspectorSection title="Что это" note={TYPE_HINTS[draft.type]}>
                <Field label="Вид записи">
                    <Select options={START_TYPES} value={draft.type} onChange={set('type')}/>
                </Field>

                <Field label="Площадка" hint="Стартовый экран у каждой площадки свой">
                    <Select options={START_PLATFORMS} value={draft.platform} onChange={set('platform')}/>
                </Field>
            </InspectorSection>

            {isPage ? (
                <InspectorSection
                    title="Куда ведёт"
                    note="В списке только витрины этой площадки: плитка на чужую площадку у покупателя не откроется."
                >
                    <Field label="Витрина" required>
                        <Select
                            options={pageOptions}
                            value={draft.structurePageId}
                            onChange={set('structurePageId')}
                        />
                    </Field>

                    <Field label="Подпись" hint="Пусто — возьмём название витрины">
                        <Input value={draft.title} onChange={set('title')}/>
                    </Field>
                </InspectorSection>
            ) : null}

            {isLink ? (
                <InspectorSection title="Куда ведёт">
                    <Field label="Подпись" required>
                        <Input value={draft.title} placeholder="Наш канал" onChange={set('title')}/>
                    </Field>

                    <Field label="Адрес" required>
                        <Input mono value={draft.url} placeholder="https://t.me/..." onChange={set('url')}/>
                    </Field>
                </InspectorSection>
            ) : null}

            {draft.type === 'title' ? (
                <InspectorSection title="Заголовок">
                    <Field label="Текст" required>
                        <Input value={draft.title} placeholder="Консоли" onChange={set('title')}/>
                    </Field>
                </InspectorSection>
            ) : null}

            {isLabel ? (
                <InspectorSection title="Пояснение">
                    <Field label="Текст" required>
                        <Input value={draft.text} placeholder="Цены обновляются каждый час" onChange={set('text')}/>
                    </Field>
                </InspectorSection>
            ) : null}

            {isLabel || draft.type === 'title' ? null : (
                <InspectorSection title="Оформление">
                    <Field label="Иконка" hint="Ссылка на картинку">
                        <Input value={draft.icon} onChange={set('icon')}/>
                    </Field>

                    <Field label="Цвет" hint="Например #1f6feb">
                        <Input mono value={draft.color} placeholder="#1f6feb" onChange={set('color')}/>
                    </Field>
                </InspectorSection>
            )}

            {problem ? <Note tone="danger">{problem}</Note> : null}
        </Inspector>
    );
}
