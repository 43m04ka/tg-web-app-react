import React, {useCallback, useEffect, useMemo, useState} from 'react';
import {
    Badge,
    Button,
    ButtonRow,
    EmptyState,
    ErrorState,
    Field,
    Input,
    Mono,
    Note,
    Panel,
    Select,
    SkeletonRows,
    Toggle,
} from '../../ui';
import {useResource} from '../../platform/useResource';
import {useMutation} from '../../platform/useMutation';
import {keys} from '../../platform/resources';
import {toastFail} from '../../platform/notify';
import {createPage, fetchPages, updatePage} from './api';
import {ICON_SIZE, shrinkImage} from './icon';
import style from './ServicesScreen.module.scss';

const BOT_OPTIONS = [
    {value: 'tg', title: 'Telegram'},
    {value: 'web', title: 'Сайт'},
    {value: 'vk-ps', title: 'VK · PS'},
    {value: 'vk-xbox', title: 'VK · Xbox'},
];

const BOT_TITLES = Object.fromEntries(BOT_OPTIONS.map((item) => [item.value, item.title]));

const toDraft = (page) => ({
    name: page.name || '',
    link: page.link || '',
    botType: page.botType || 'tg',
    serialNumber: String(page.serialNumber ?? 0),
    barIcon: page.barIcon || '',
    isHidden: Number(page.isHidden) === 1,
});

export default function PageSettings() {
    const pages = useResource(keys.structure, fetchPages);

    const servicePages = useMemo(
        () => (pages.data?.result || [])
            .filter((page) => page.type === 'services')
            .slice()
            .sort((left, right) => (left.serialNumber || 0) - (right.serialNumber || 0)),
        [pages.data],
    );

    const [pageId, setPageId] = useState('');
    const [draft, setDraft] = useState(null);

    const current = useMemo(
        () => servicePages.find((page) => String(page.id) === String(pageId)) || servicePages[0] || null,
        [servicePages, pageId],
    );

    useEffect(() => {
        setDraft(current ? toDraft(current) : null);
    }, [current]);

    const save = useMutation(updatePage, {invalidates: [keys.structure], done: 'Страница сохранена'});
    const add = useMutation(createPage, {invalidates: [keys.structure], done: 'Страница создана'});

    const set = useCallback((field, value) => setDraft((state) => ({...state, [field]: value})), []);

    const dirty = useMemo(() => {
        if (!current || !draft) return false;
        return JSON.stringify(draft) !== JSON.stringify(toDraft(current));
    }, [current, draft]);

    const onIcon = useCallback(async (file) => {
        if (!file) return;

        try {
            set('barIcon', await shrinkImage(file, 128));
        } catch (error) {
            toastFail('Иконка не загрузилась', error.message);
        }
    }, [set]);

    const onSave = useCallback(() => {
        if (!current || !draft) return;

        save.run({
            pageId: current.id,
            updateData: {
                name: draft.name.trim(),
                link: draft.link.trim(),
                botType: draft.botType,
                serialNumber: Number(draft.serialNumber) || 0,
                barIcon: draft.barIcon,
                isHidden: draft.isHidden ? 1 : 0,
            },
        });
    }, [save, current, draft]);

    const onCreate = useCallback(() => {
        add.run({
            name: 'Сервисы',
            link: 'services',
            type: 'services',
            botType: 'tg',
            serialNumber: (pages.data?.result || []).length,
            isHidden: 1,
            barIcon: '',
        });
    }, [add, pages.data]);

    if (pages.isLoading) {
        return <Panel scroll wide><SkeletonRows count={7}/></Panel>;
    }

    if (pages.error) {
        return <Panel scroll wide><ErrorState error={pages.error} onRetry={pages.refresh}/></Panel>;
    }

    if (!servicePages.length) {
        return (
            <Panel scroll wide title="Страница витрины">
                <EmptyState
                    title="Страницы «Сервисы» ещё нет"
                    text="Бренды продаются на странице типа services. Создайте её — она появится скрытой, а показать можно после настройки."
                    action={{title: 'Создать страницу', run: onCreate}}
                />
            </Panel>
        );
    }

    return (
        <Panel
            scroll
            wide
            title="Страница витрины"
            subtitle="Как раздел «Сервисы» выглядит у покупателя"
            actions={<Button size="s" variant="secondary" loading={add.loading} onClick={onCreate}>Добавить страницу</Button>}
        >
            {servicePages.length > 1 ? (
                <Field label="Площадка">
                    <Select
                        options={servicePages.map((page) => ({
                            value: String(page.id),
                            title: `${page.name || 'Без названия'} · ${BOT_TITLES[page.botType] || page.botType}`,
                        }))}
                        value={String(current?.id || '')}
                        onChange={(event) => setPageId(event.target.value)}
                    />
                </Field>
            ) : null}

            {draft ? (
                <div className={style.form}>
                    <div className={style.formGrid}>
                        <Field label="Название" hint="Подпись вкладки в боте">
                            <Input value={draft.name} onChange={(event) => set('name', event.target.value)}/>
                        </Field>

                        <Field label="Ссылка" hint="Часть адреса страницы">
                            <Input value={draft.link} mono onChange={(event) => set('link', event.target.value)}/>
                        </Field>

                        <Field label="Площадка">
                            <Select
                                options={BOT_OPTIONS}
                                value={draft.botType}
                                onChange={(event) => set('botType', event.target.value)}
                            />
                        </Field>

                        <Field label="Порядок">
                            <Input
                                value={draft.serialNumber}
                                inputMode="numeric"
                                onChange={(event) => set('serialNumber', event.target.value)}
                            />
                        </Field>
                    </div>

                    <div className={style.iconRow}>
                        {draft.barIcon
                            ? <img className={style.iconPreview} src={draft.barIcon} alt=""/>
                            : <span className={style.iconEmpty}>⚙</span>}

                        <div className={style.iconActions}>
                            <label className={style.upload}>
                                <input type="file" accept="image/*" onChange={(event) => onIcon(event.target.files?.[0])}/>
                                <span>Иконка вкладки</span>
                            </label>
                            {draft.barIcon ? (
                                <Button size="s" variant="ghost" onClick={() => set('barIcon', '')}>Убрать</Button>
                            ) : null}
                            <span className={style.uploadNote}>Ужимается до {Math.round(ICON_SIZE / 1.5)} px.</span>
                        </div>
                    </div>

                    <Toggle
                        checked={draft.isHidden}
                        onChange={(next) => set('isHidden', next)}
                        label="Скрыта из меню"
                    />

                    <div className={style.pageInfo}>
                        <span>Тип страницы</span>
                        <Badge tone="accent">services</Badge>
                        <Mono muted>#{current.id}</Mono>
                    </div>

                    <Note>
                        Тип страницы менять здесь нельзя: по оплате «services» ведёт себя как обычный каталог,
                        и смена типа поменяла бы поток заказа. Порядок вкладок сервер пересчитывает сам.
                    </Note>

                    <ButtonRow>
                        <Button variant="primary" disabled={!dirty} loading={save.loading} onClick={onSave}>Сохранить</Button>
                        <Button variant="ghost" disabled={!dirty} onClick={() => setDraft(toDraft(current))}>Отменить правки</Button>
                    </ButtonRow>
                </div>
            ) : null}
        </Panel>
    );
}
