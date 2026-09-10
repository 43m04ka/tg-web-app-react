import React, {useCallback, useState} from 'react';
import {Button, ButtonRow, Field, Input, Note, Select, Tabs, Textarea, Toggle} from '../../ui';
import {toast, toastFail} from '../../platform/notify';
import {parseLinks, startParse} from './api';
import {
    PS_CATEGORY_HINT,
    SOURCES,
    emptyParseForm,
    parseProblem,
    queueBusy,
    toParsePayload,
    toggleIn
} from './catalogsModel';
import {
    PS_FILTER_PLATFORMS,
    PS_FILTER_TYPES,
    PS_SORT_OPTIONS,
    XBOX_FILTER_GROUPS,
    XBOX_LIMIT_HINTS,
    XBOX_LIMIT_MODES,
    XBOX_PRESETS,
    XBOX_SORT_OPTIONS,
    emptyXboxFilters
} from './parseOptions';
import style from './CatalogsScreen.module.scss';

const MODES = [
    {id: 'catalog', title: 'По категории'},
    {id: 'links', title: 'По ссылкам'}
];

const PS_PAGES = [
    {value: 'auto', title: 'Вся категория'},
    {value: 'limit', title: 'Ограничить страницами'}
];

function Chips({items, picked, onToggle}) {
    return (
        <div className={style.chips}>
            {items.map((item) => {
                const value = item.value ?? item;
                const label = item.label ?? item;
                const on = (picked || []).includes(value);

                return (
                    <button
                        key={value}
                        type="button"
                        className={`${style.chip} ${on ? style.chipOn : ''}`}
                        onClick={() => onToggle(value)}
                    >
                        {label}
                    </button>
                );
            })}
        </div>
    );
}

export default function ParseForm({catalog, source, queue, onStarted}) {
    const [form, setForm] = useState(() => emptyParseForm(source));
    const [busy, setBusy] = useState(false);

    const set = useCallback((field) => (event) => {
        const {value} = event.target;
        setForm((prev) => ({...prev, [field]: value}));
    }, []);

    const patch = useCallback((fields) => setForm((prev) => ({...prev, ...fields})), []);

    const problem = parseProblem(form);
    const occupied = queueBusy(queue, form.source);

    const applyPreset = useCallback((preset) => {
        patch({
            xboxFilters: {...emptyXboxFilters(), ...preset.filters},
            xboxSort: preset.sort
        });
    }, [patch]);

    const submit = useCallback(async () => {
        if (problem || busy) return;

        setBusy(true);

        try {
            const payload = toParsePayload(form, catalog);

            const answer = form.mode === 'links'
                ? await parseLinks(form.source, payload)
                : await startParse(form.source, payload);

            toast({
                tone: 'positive',
                title: 'Задача поставлена',
                text: answer?.message || 'Следите за ней в полосе задач'
            });

            onStarted?.();
        } catch (error) {
            toastFail(error.message || 'Не получилось запустить парс', error.hint || '');
        } finally {
            setBusy(false);
        }
    }, [problem, busy, form, catalog, onStarted]);

    const isXbox = form.source === 'xbox';
    const isLinks = form.mode === 'links';

    return (
        <div className={style.form}>
            <Tabs items={MODES} value={form.mode} onChange={(mode) => patch({mode})}/>

            <Field label="Источник" hint="Определяет, каким разборщиком читать страницы">
                <Select options={SOURCES} value={form.source} onChange={set('source')}/>
            </Field>

            {occupied ? <Note tone="warning">{occupied}. Задача встанет в очередь.</Note> : null}

            {isLinks ? (
                <Field label="Ссылки на карточки" hint="По одной в строке">
                    <Textarea
                        rows={6}
                        value={form.links}
                        placeholder={'https://store.playstation.com/...\nhttps://store.playstation.com/...'}
                        onChange={set('links')}
                    />
                </Field>
            ) : (
                <>
                    <Field
                        label={isXbox ? 'Ссылка на категорию' : 'Категория'}
                        hint={isXbox
                            ? 'Необязательна: каталог у витрины один, нужный срез задают фильтры. Из вставленной ссылки фильтры возьмутся сами.'
                            : PS_CATEGORY_HINT}
                    >
                        <Input mono value={form.categoryUrl} onChange={set('categoryUrl')}/>
                    </Field>

                    {isXbox ? (
                        <>
                            <Field label="Готовый срез" hint="Заполняет фильтры и сортировку разом">
                                <ButtonRow>
                                    {XBOX_PRESETS.map((preset) => (
                                        <Button
                                            key={preset.key}
                                            size="s"
                                            variant="ghost"
                                            onClick={() => applyPreset(preset)}
                                        >
                                            {preset.label}
                                        </Button>
                                    ))}
                                </ButtonRow>
                            </Field>

                            <Field label="Ограничение" hint={XBOX_LIMIT_HINTS[form.limitMode]}>
                                <Select options={XBOX_LIMIT_MODES} value={form.limitMode} onChange={set('limitMode')}/>
                            </Field>

                            {form.limitMode === 'pages' ? (
                                <Field label="Страниц">
                                    <Input type="number" min="0" value={form.countPages} onChange={set('countPages')}/>
                                </Field>
                            ) : null}

                            {form.limitMode === 'items' ? (
                                <Field label="Позиций">
                                    <Input type="number" min="1" value={form.countItems} onChange={set('countItems')}/>
                                </Field>
                            ) : null}

                            {XBOX_FILTER_GROUPS.map((group) => (
                                <Field key={group.key} label={group.label}>
                                    <Chips
                                        items={group.choices}
                                        picked={form.xboxFilters[group.key]}
                                        onToggle={(value) => patch({
                                            xboxFilters: {
                                                ...form.xboxFilters,
                                                [group.key]: toggleIn(form.xboxFilters[group.key], value)
                                            }
                                        })}
                                    />
                                </Field>
                            ))}

                            <Field label="Сортировка">
                                <Select options={XBOX_SORT_OPTIONS} value={form.xboxSort} onChange={set('xboxSort')}/>
                            </Field>
                        </>
                    ) : (
                        <>
                            <Field label="Объём">
                                <Select options={PS_PAGES} value={form.pagesMode} onChange={set('pagesMode')}/>
                            </Field>

                            {form.pagesMode === 'limit' ? (
                                <Field label="Страниц">
                                    <Input type="number" min="0" value={form.countPages} onChange={set('countPages')}/>
                                </Field>
                            ) : null}

                            <Field label="Тип товара">
                                <Chips
                                    items={PS_FILTER_TYPES}
                                    picked={form.filterTypes}
                                    onToggle={(value) => patch({filterTypes: toggleIn(form.filterTypes, value)})}
                                />
                            </Field>

                            <Field label="Платформа">
                                <Chips
                                    items={PS_FILTER_PLATFORMS}
                                    picked={form.filterPlatforms}
                                    onToggle={(value) => patch({filterPlatforms: toggleIn(form.filterPlatforms, value)})}
                                />
                            </Field>

                            <Field label="Сортировка">
                                <Select options={PS_SORT_OPTIONS} value={form.sortName} onChange={set('sortName')}/>
                            </Field>

                            {form.sortName !== 'default' ? (
                                <Toggle
                                    checked={form.sortAscending}
                                    label="По возрастанию"
                                    onChange={(value) => patch({sortAscending: value})}
                                />
                            ) : null}
                        </>
                    )}

                    <Field
                        label="Дата окончания акции"
                        hint="Проставится всем товарам парса. Пусто — брать из источника."
                    >
                        <Input type="date" value={form.promoDate} onChange={set('promoDate')}/>
                    </Field>

                    <Toggle
                        checked={form.isShallow}
                        label="Поверхностный парс"
                        onChange={(value) => patch({isShallow: value, parceAddons: value ? false : form.parceAddons})}
                    />

                    {form.isShallow ? (
                        <Note tone="neutral">
                            Один запрос на страницу из 24 товаров вместо захода в каждую карточку.
                            Быстро, но без описаний, картинок и дополнений.
                        </Note>
                    ) : null}
                </>
            )}

            <Toggle
                checked={form.parceAddons}
                label="Забирать дополнения"
                disabled={!isLinks && form.isShallow}
                onChange={(value) => patch({parceAddons: value})}
            />

            <Toggle
                checked={form.safeMode}
                label="Безопасный режим"
                disabled={!isLinks && form.isShallow}
                onChange={(value) => patch({safeMode: value})}
            />

            {!isLinks && form.isShallow ? (
                <Note tone="neutral">
                    Безопасный режим утраивает паузы между заходами в карточки, а поверхностный
                    парс в них не заходит — здесь он ничего не меняет.
                </Note>
            ) : null}

            {problem ? <Note tone="danger">{problem}</Note> : null}

            <Button variant="primary" disabled={busy || Boolean(problem)} onClick={submit}>
                {busy ? 'Ставим в очередь…' : 'Запустить парс'}
            </Button>
        </div>
    );
}
