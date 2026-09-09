import React, {useCallback, useMemo, useState} from 'react';
import {
    Button,
    ButtonRow,
    Field,
    Input,
    Inspector,
    InspectorSection,
    Note,
    Select,
    Toggle
} from '../../ui';
import {askConfirm} from '../../platform/notify';
import {keys} from '../../platform/resources';
import {useMutation} from '../../platform/useMutation';
import {createPage, deletePage, updatePage} from './api';
import {BOT_OPTIONS, PRICING_NOTES, TYPE_OPTIONS, typeName} from './pageOptions';

const toDraft = (page) => ({
    name: page?.name ?? '',
    link: page?.link ?? '',
    barIcon: page?.barIcon ?? '',
    type: page?.type ?? 'other',
    botType: page?.botType ?? 'tg',
    serialNumber: page?.serialNumber ?? 0,
    isHidden: Boolean(page?.isHidden)
});

const toPayload = (draft) => ({
    name: draft.name.trim(),
    link: draft.link.trim(),
    barIcon: draft.barIcon.trim(),
    type: draft.type,
    botType: draft.botType,
    serialNumber: Number(draft.serialNumber) || 0,
    isHidden: draft.isHidden ? 1 : 0
});

export default function PageInspector({page, onClose, onRemoved}) {
    const isNew = !page;
    const [draft, setDraft] = useState(() => toDraft(page));

    const dirty = useMemo(() => {
        const base = toDraft(page);
        return isNew || Object.keys(base).some((field) => String(base[field]) !== String(draft[field]));
    }, [draft, page, isNew]);

    const typeChanged = !isNew && draft.type !== page.type;

    const save = useMutation(
        (input) => (isNew ? createPage(input) : updatePage(page.id, input)),
        {
            invalidates: [keys.pages, keys.structure],
            done: isNew ? 'Страница заведена' : 'Страница сохранена',
            onDone: onClose
        }
    );

    const remove = useMutation(() => deletePage(page.id), {
        invalidates: [keys.pages, keys.structure],
        done: 'Страница удалена',
        onDone: () => {
            onRemoved?.();
            onClose();
        }
    });

    const set = useCallback((field) => (event) => {
        const {value} = event.target;
        setDraft((prev) => ({...prev, [field]: value}));
    }, []);

    const askRemove = useCallback(async () => {
        const answer = await askConfirm({
            title: `Удалить страницу «${page.name || 'без названия'}»?`,
            text: 'Вместе со страницей сервер удалит её каталоги, блоки оформления и подсказки поиска.',
            consequence: 'Удаление каскадное и необратимое.',
            confirmText: 'Удалить',
            tone: 'danger'
        });

        if (answer) remove.run();
    }, [page, remove]);

    const nameProblem = draft.name.trim() ? '' : 'Без названия страницу не найти в списке';

    return (
        <Inspector
            open
            width="s"
            title={isNew ? 'Новая страница' : (page.name || 'Страница')}
            subtitle={isNew ? 'Появится в списке площадки' : typeName(page.type)}
            dirty={dirty}
            onClose={onClose}
            footer={(
                <ButtonRow>
                    <Button
                        variant="primary"
                        disabled={save.loading || !dirty || Boolean(nameProblem)}
                        onClick={() => save.run(toPayload(draft))}
                    >
                        {save.loading ? 'Сохраняем…' : 'Сохранить'}
                    </Button>

                    <Button variant="ghost" onClick={onClose}>Отмена</Button>

                    {isNew ? null : (
                        <Button variant="danger" disabled={remove.loading} onClick={askRemove}>Удалить</Button>
                    )}
                </ButtonRow>
            )}
        >
            <InspectorSection title="Как называется">
                <Field label="Название" error={nameProblem} required>
                    <Input value={draft.name} placeholder="PlayStation Турция" onChange={set('name')}/>
                </Field>

                <Field label="Иконка в панели" hint="Ссылка на картинку или эмодзи">
                    <Input value={draft.barIcon} onChange={set('barIcon')}/>
                </Field>

                <Field label="Ссылка" hint="Куда ведёт пункт, если страница внешняя">
                    <Input value={draft.link} onChange={set('link')}/>
                </Field>
            </InspectorSection>

            <InspectorSection
                title="Где показывается"
                note="Площадка определяет, в каком боте или на каком сайте видна страница."
            >
                <Field label="Площадка">
                    <Select options={BOT_OPTIONS} value={draft.botType} onChange={set('botType')}/>
                </Field>

                <Field label="Порядок" hint="Меньше — выше в списке">
                    <Input type="number" value={draft.serialNumber} onChange={set('serialNumber')}/>
                </Field>

                <Toggle
                    checked={draft.isHidden}
                    label="Скрыть от покупателей"
                    onChange={(value) => setDraft((prev) => ({...prev, isHidden: value}))}
                />
            </InspectorSection>

            <InspectorSection
                title="Тип витрины"
                note="Тип решает, каким парсером наполняются каталоги и как считается цена."
            >
                <Field label="Тип" hint={PRICING_NOTES[draft.type] || 'Обычная покупка позиций из каталога.'}>
                    <Select options={TYPE_OPTIONS} value={draft.type} onChange={set('type')}/>
                </Field>

                {typeChanged ? (
                    <Note tone="danger">
                        Тип меняется с «{typeName(page.type)}» на «{typeName(draft.type)}».
                        Это меняет расчёт цены и поток заказа для всех каталогов страницы —
                        сверьте цены сразу после сохранения.
                    </Note>
                ) : null}
            </InspectorSection>
        </Inspector>
    );
}
