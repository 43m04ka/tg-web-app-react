import React, {useCallback, useState} from 'react';
import {Button, Field, Input, Note, Select, Tabs, Textarea, Toggle} from '../../ui';
import {toast, toastFail} from '../../platform/notify';
import {parseLinks, startParse} from './api';
import {
    PS_CATEGORY_HINT,
    SOURCES,
    emptyParseForm,
    parseProblem,
    queueBusy,
    toParsePayload
} from './catalogsModel';
import style from './CatalogsScreen.module.scss';

const MODES = [
    {id: 'catalog', title: 'По категории'},
    {id: 'links', title: 'По ссылкам'}
];

const PS_PAGES = [
    {value: 'auto', title: 'Вся категория'},
    {value: 'limit', title: 'Ограничить страницами'}
];

const XBOX_LIMITS = [
    {value: 'pages', title: 'Ограничить страницами'},
    {value: 'items', title: 'Ограничить числом позиций'}
];

export default function ParseForm({catalog, source, queue, onStarted}) {
    const [form, setForm] = useState(() => emptyParseForm(source));
    const [busy, setBusy] = useState(false);

    const set = useCallback((field) => (event) => {
        const {value} = event.target;
        setForm((prev) => ({...prev, [field]: value}));
    }, []);

    const problem = parseProblem(form);
    const occupied = queueBusy(queue, form.source);

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

    return (
        <div className={style.form}>
            <Tabs
                items={MODES}
                value={form.mode}
                onChange={(mode) => setForm((prev) => ({...prev, mode}))}
            />

            <Field label="Источник" hint="Определяет, каким разборщиком читать страницы">
                <Select options={SOURCES} value={form.source} onChange={set('source')}/>
            </Field>

            {occupied ? <Note tone="warning">{occupied}. Задача встанет в очередь.</Note> : null}

            {form.mode === 'links' ? (
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
                        hint={isXbox ? 'Можно оставить пустой — тогда берётся весь каталог' : PS_CATEGORY_HINT}
                    >
                        <Input mono value={form.categoryUrl} onChange={set('categoryUrl')}/>
                    </Field>

                    {isXbox ? (
                        <>
                            <Field label="Ограничение">
                                <Select options={XBOX_LIMITS} value={form.limitMode} onChange={set('limitMode')}/>
                            </Field>

                            {form.limitMode === 'pages' ? (
                                <Field label="Страниц" hint="Ноль — без ограничения">
                                    <Input type="number" min="0" value={form.countPages} onChange={set('countPages')}/>
                                </Field>
                            ) : (
                                <Field label="Позиций" hint="Считаются реально сохранённые, а не просмотренные">
                                    <Input type="number" min="1" value={form.countItems} onChange={set('countItems')}/>
                                </Field>
                            )}
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
                        </>
                    )}
                </>
            )}

            <Toggle
                checked={form.parceAddons}
                label="Забирать дополнения"
                onChange={(value) => setForm((prev) => ({...prev, parceAddons: value}))}
            />

            <Toggle
                checked={form.safeMode}
                label="Безопасный режим"
                onChange={(value) => setForm((prev) => ({...prev, safeMode: value}))}
            />

            {problem ? <Note tone="danger">{problem}</Note> : null}

            <Button variant="primary" disabled={busy || Boolean(problem)} onClick={submit}>
                {busy ? 'Ставим в очередь…' : 'Запустить парс'}
            </Button>
        </div>
    );
}
