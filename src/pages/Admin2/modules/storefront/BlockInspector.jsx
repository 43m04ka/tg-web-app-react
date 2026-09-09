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
import {keys} from '../../platform/resources';
import {useMutation} from '../../platform/useMutation';
import {createBlock, updateBlock} from './api';
import {
    LINK_TARGETS,
    blockProblem,
    kindByKey,
    kindsFor,
    linkTarget,
    toBlockPayload,
    toFormValues
} from './blockKinds';

export default function BlockInspector({block, group, page, count, onClose}) {
    const isNew = !block;

    const [values, setValues] = useState(() => (isNew
        ? {...toFormValues(null, group), serialNumber: count}
        : toFormValues(block, group)));

    const kind = kindByKey(group, values.kind);
    const {fields} = kind;

    const dirty = useMemo(() => {
        if (isNew) return true;

        const base = toFormValues(block, group);
        return Object.keys(base).some((field) => String(base[field]) !== String(values[field]));
    }, [values, block, group, isNew]);

    const problem = blockProblem(values, group);

    const save = useMutation(
        (input) => (isNew ? createBlock(input) : updateBlock(block.id, input)),
        {
            invalidates: [keys.pageBlocks(page.id, group), keys.structure],
            done: isNew ? 'Блок добавлен' : 'Блок сохранён',
            onDone: onClose
        }
    );

    const set = useCallback((field) => (event) => {
        const {value} = event.target;
        setValues((prev) => ({...prev, [field]: value}));
    }, []);

    const submit = useCallback(() => {
        if (problem) return;

        save.run(toBlockPayload(values, {
            group,
            structurePageId: isNew ? page.id : undefined
        }));
    }, [problem, save, values, group, isNew, page]);

    return (
        <Inspector
            open
            width="s"
            title={isNew ? 'Новый блок' : (block.name || kind.label)}
            subtitle={group === 'head' ? 'Карусель' : 'Содержимое'}
            dirty={dirty}
            onClose={onClose}
            footer={(
                <ButtonRow>
                    <Button variant="primary" disabled={save.loading || Boolean(problem)} onClick={submit}>
                        {save.loading ? 'Сохраняем…' : 'Сохранить'}
                    </Button>
                    <Button variant="ghost" onClick={onClose}>Отмена</Button>
                </ButtonRow>
            )}
        >
            <InspectorSection title="Что это" note={kind.hint}>
                <Field label="Вид блока">
                    <Select
                        options={kindsFor(group).map((item) => ({value: item.key, title: item.label}))}
                        value={values.kind}
                        onChange={set('kind')}
                    />
                </Field>

                {isNew ? null : (
                    <Field label="Порядок" hint="Переставлять удобнее стрелками в списке">
                        <Input type="number" value={values.serialNumber} onChange={set('serialNumber')}/>
                    </Field>
                )}
            </InspectorSection>

            {fields.name || fields.catalogPath || fields.icon ? (
                <InspectorSection title="Содержимое">
                    {fields.name ? (
                        <Field label="Название полки" required>
                            <Input value={values.name} placeholder="Игры со скидкой" onChange={set('name')}/>
                        </Field>
                    ) : null}

                    {fields.catalogPath ? (
                        <Field label="Путь каталога" hint="Тот же путь, что у каталога в разделе «Товары»" required>
                            <Input mono value={values.path} placeholder="ps_tur_games" onChange={set('path')}/>
                        </Field>
                    ) : null}

                    {fields.icon ? (
                        <Field label="Иконка" hint="Ссылка на картинку рядом с названием">
                            <Input value={values.imageIcon} onChange={set('imageIcon')}/>
                        </Field>
                    ) : null}
                </InspectorSection>
            ) : null}

            {fields.image || fields.color ? (
                <InspectorSection title="Оформление">
                    {fields.image ? (
                        <Field label="Картинка" hint="Ссылка на изображение" required>
                            <Input value={values.url} onChange={set('url')}/>
                        </Field>
                    ) : null}

                    {fields.color ? (
                        <Field label="Цвет фона" hint="Например #101418. Пусто — фон витрины">
                            <Input mono value={values.backgroundColor} placeholder="#101418" onChange={set('backgroundColor')}/>
                        </Field>
                    ) : null}

                    <Toggle
                        checked={values.isRoundedBorderTop}
                        label="Скруглить сверху"
                        onChange={(value) => setValues((prev) => ({...prev, isRoundedBorderTop: value}))}
                    />

                    <Toggle
                        checked={values.isRoundedBorderBottom}
                        label="Скруглить снизу"
                        onChange={(value) => setValues((prev) => ({...prev, isRoundedBorderBottom: value}))}
                    />
                </InspectorSection>
            ) : null}

            {fields.link ? (
                <InspectorSection title="Куда ведёт">
                    <Field label="Цель">
                        <Select
                            options={LINK_TARGETS.map((item) => ({value: item.key, title: item.label}))}
                            value={values.linkTarget}
                            onChange={set('linkTarget')}
                        />
                    </Field>

                    <Field label={linkTarget(values.linkTarget).valueLabel} required>
                        <Input mono value={values.linkValue} onChange={set('linkValue')}/>
                    </Field>
                </InspectorSection>
            ) : null}

            {fields.deleteDate ? (
                <InspectorSection
                    title="Когда снять"
                    note="Скидочная полка живёт до этой отметки. Пусто — висит, пока не убрать руками."
                >
                    <Field label="Срок в миллисекундах" hint="Формат такой же, как хранит сервер">
                        <Input mono value={values.deleteDate} onChange={set('deleteDate')}/>
                    </Field>
                </InspectorSection>
            ) : null}

            {problem ? <Note tone="danger">{problem}</Note> : null}

            <Note tone="neutral">
                Порядок внутри группы пересчитывает сервер: при добавлении блок встаёт на
                указанное место, а те, что ниже, сдвигаются сами.
            </Note>
        </Inspector>
    );
}
