import React, {useCallback, useState} from 'react';
import {
    Badge,
    Button,
    ButtonRow,
    Field,
    Inspector,
    InspectorRows,
    InspectorSection,
    Input,
    Note
} from '../../ui';
import {askConfirm, toast, toastFail} from '../../platform/notify';
import {invalidate} from '../../platform/cache';
import {keys} from '../../platform/resources';
import {
    cancelAssociationsSchedule,
    changeSaleStatus,
    clearCatalog,
    deleteCatalog,
    expirePromotions,
    exportCatalog,
    fetchAssociationsSchedule,
    importCatalog,
    runAssociations,
    scheduleAssociations,
    setIndiaExchange
} from './api';
import {pageTitleOf, saleState, sourceOfPage} from './catalogsModel';
import {useResource} from '../../platform/useResource';
import ParseForm from './ParseForm';
import style from './CatalogsScreen.module.scss';

const TABS = [
    {id: 'parse', title: 'Парс'},
    {id: 'service', title: 'Обслуживание'}
];

export default function CatalogInspector({catalog, pages, queue, onClose, onRemoved}) {
    const [tab, setTab] = useState('parse');
    const [busy, setBusy] = useState(false);
    const [runAt, setRunAt] = useState('');

    const schedule = useResource(keys.associationsSchedule, fetchAssociationsSchedule);
    const plannedAt = schedule.data?.scheduled ? schedule.data.runAtIso : null;

    const source = sourceOfPage(catalog, pages) || 'ps';
    const sale = saleState(catalog);

    const run = useCallback(async (action, done) => {
        setBusy(true);

        try {
            const answer = await action();
            invalidate(keys.catalogList);
            toast({tone: 'positive', title: done, text: answer?.message || ''});

            return answer;
        } catch (error) {
            toastFail(error.message || 'Не получилось', error.hint || '');
            return null;
        } finally {
            setBusy(false);
        }
    }, []);

    const askClear = useCallback(async () => {
        const answer = await askConfirm({
            title: `Очистить каталог «${catalog.path}»?`,
            text: 'Все товары каталога будут удалены, сам каталог останется.',
            consequence: 'Вернуть их можно только повторным парсом.',
            confirmText: 'Очистить',
            tone: 'danger'
        });

        if (answer) run(() => clearCatalog(catalog.id), 'Каталог очищен');
    }, [catalog, run]);

    const askDelete = useCallback(async () => {
        const answer = await askConfirm({
            title: `Удалить каталог «${catalog.path}»?`,
            text: 'Вместе с каталогом уходят все его товары.',
            consequence: 'Блоки витрины, которые вели сюда, останутся пустыми.',
            confirmText: 'Удалить',
            tone: 'danger'
        });

        if (!answer) return;

        const done = await run(() => deleteCatalog(catalog.id), 'Каталог удалён');
        if (done) {
            onRemoved?.();
            onClose();
        }
    }, [catalog, run, onRemoved, onClose]);

    const toggleSale = useCallback(async () => {
        const next = catalog.onSale === 2 ? false : true;

        const answer = await askConfirm({
            title: next ? 'Вернуть каталог в продажу?' : 'Снять каталог с продажи?',
            text: next
                ? 'Все товары каталога снова появятся у покупателей.'
                : 'Товары останутся в базе, но исчезнут с витрины.',
            confirmText: next ? 'Вернуть' : 'Снять',
            tone: next ? 'accent' : 'danger'
        });

        if (answer) run(() => changeSaleStatus(catalog.id, next), next ? 'Каталог в продаже' : 'Каталог снят с продажи');
    }, [catalog, run]);

    const askIndia = useCallback(async () => {
        const answer = await askConfirm({
            title: 'Сделать каталог источником индийского курса?',
            text: 'По ценам этого каталога считается пересчёт рупий для витрины Индии.',
            consequence: 'Прежний источник курса перестанет им быть — он может быть только один.',
            confirmText: 'Назначить',
            tone: 'danger'
        });

        if (answer) run(() => setIndiaExchange(catalog.id), 'Источник курса назначен');
    }, [catalog, run]);

    const runExpire = useCallback(async (dryRun) => {
        const answer = await run(() => expirePromotions(dryRun), dryRun ? 'Сухой прогон выполнен' : 'Акции сняты');
        if (!answer) return;

        const scanned = answer.scanned ?? 0;
        const expired = answer.expired ?? 0;
        const stuck = answer.skippedNoSource ?? 0;

        toast({
            tone: stuck > 0 ? 'warning' : 'info',
            title: dryRun ? `Под снятие попадает: ${expired}` : `Снято акций: ${expired}`,
            text: [
                `проверено ${scanned}`,
                stuck > 0 ? `${stuck} не снять: у позиций нет базовой цены источника, поможет перепарс` : null
            ].filter(Boolean).join(' · ')
        });
    }, [run]);

    return (
        <Inspector
            open
            width="l"
            title={catalog.path}
            subtitle={pageTitleOf(catalog, pages) || 'Витрина не найдена'}
            badge={<Badge tone={sale.tone}>{sale.title}</Badge>}
            tabs={TABS}
            tab={tab}
            onTab={setTab}
            onClose={onClose}
            footer={(
                <ButtonRow>
                    <Button variant="ghost" onClick={onClose}>Закрыть</Button>
                </ButtonRow>
            )}
        >
            {tab === 'parse' ? (
                <InspectorSection
                    title="Запуск парса"
                    note="Один источник — одна очередь. Параллельно две задачи не пойдут, вторая встанет ждать."
                >
                    <ParseForm
                        catalog={catalog}
                        source={source}
                        queue={queue}
                        onStarted={() => invalidate(keys.parseQueue)}
                    />
                </InspectorSection>
            ) : null}

            {tab === 'service' ? (
                <>
                    <InspectorSection title="Состояние">
                        <InspectorRows
                            items={[
                                {label: 'Путь', value: catalog.path},
                                {label: 'Витрина', value: pageTitleOf(catalog, pages) || '—'},
                                {label: 'Продажи', value: sale.title},
                                {
                                    label: 'Источник курса Индии',
                                    value: catalog.isExchangeIndiaCatalog ? 'да' : 'нет'
                                }
                            ]}
                        />
                    </InspectorSection>

                    <InspectorSection title="Продажи">
                        <Button variant="secondary" disabled={busy} onClick={toggleSale}>
                            {catalog.onSale === 2 ? 'Снять каталог с продажи' : 'Вернуть каталог в продажу'}
                        </Button>
                    </InspectorSection>

                    <InspectorSection
                        title="Акции"
                        note="Источник не сообщает об окончании скидки, поэтому просроченные акции снимаются отдельно."
                    >
                        <ButtonRow>
                            <Button size="s" variant="ghost" disabled={busy} onClick={() => runExpire(true)}>
                                Сухой прогон
                            </Button>
                            <Button size="s" variant="secondary" disabled={busy} onClick={() => runExpire(false)}>
                                Снять закончившиеся
                            </Button>
                        </ButtonRow>
                    </InspectorSection>

                    <InspectorSection
                        title="Курс Индии"
                        note="Источник курса может быть только один: назначение снимает флаг с прежнего каталога."
                    >
                        <Button
                            size="s"
                            variant="ghost"
                            disabled={busy || catalog.isExchangeIndiaCatalog}
                            onClick={askIndia}
                        >
                            {catalog.isExchangeIndiaCatalog ? 'Уже источник курса' : 'Сделать источником курса'}
                        </Button>
                    </InspectorSection>

                    <InspectorSection
                        title="Похожие карточки"
                        note="Связи между изданиями и платформами считаются пересчётом. Он тяжёлый, поэтому его можно отложить на ночь."
                    >
                        {plannedAt ? (
                            <Note tone="accent">
                                Пересчёт запланирован на {new Date(plannedAt).toLocaleString('ru-RU')}.
                            </Note>
                        ) : null}

                        <ButtonRow>
                            <Button
                                size="s"
                                variant="secondary"
                                disabled={busy}
                                onClick={() => run(() => runAssociations(), 'Пересчёт связей запущен')}
                            >
                                Пересчитать сейчас
                            </Button>

                            {plannedAt ? (
                                <Button
                                    size="s"
                                    variant="ghost"
                                    disabled={busy}
                                    onClick={() => run(
                                        async () => {
                                            const answer = await cancelAssociationsSchedule();
                                            invalidate(keys.associationsSchedule);
                                            return answer;
                                        },
                                        'Запланированный пересчёт отменён'
                                    )}
                                >
                                    Отменить запланированный
                                </Button>
                            ) : null}
                        </ButtonRow>

                        <Field label="Отложить пересчёт" hint="Пусто — не планировать">
                            <Input
                                type="datetime-local"
                                value={runAt}
                                onChange={(event) => setRunAt(event.target.value)}
                            />
                        </Field>

                        <Button
                            size="s"
                            variant="ghost"
                            disabled={busy || !runAt}
                            onClick={() => run(
                                async () => {
                                    const answer = await scheduleAssociations(new Date(runAt).toISOString());
                                    invalidate(keys.associationsSchedule);
                                    setRunAt('');
                                    return answer;
                                },
                                'Пересчёт запланирован'
                            )}
                        >
                            Запланировать
                        </Button>
                    </InspectorSection>

                    <InspectorSection
                        title="Обмен с Excel"
                        note="Выгрузка отдаёт товары каталога таблицей, загрузка принимает её обратно. Пригодится для правки цен пачкой."
                    >
                        <ButtonRow>
                            <Button
                                size="s"
                                variant="ghost"
                                disabled={busy}
                                onClick={() => run(() => exportCatalog(catalog.id, catalog.path), 'Файл выгружен')}
                            >
                                Выгрузить в Excel
                            </Button>

                            <label className={style.importPick}>
                                <input
                                    type="file"
                                    accept=".xlsx,.xls"
                                    className={style.importInput}
                                    onChange={(event) => {
                                        const file = event.target.files?.[0] || null;
                                        event.target.value = '';
                                        if (file) run(() => importCatalog(catalog.id, file), 'Файл загружен');
                                    }}
                                />
                                Загрузить из Excel
                            </label>
                        </ButtonRow>
                    </InspectorSection>

                    <InspectorSection title="Опасное">
                        <ButtonRow>
                            <Button variant="danger" disabled={busy} onClick={askClear}>Очистить каталог</Button>
                            <Button variant="danger" disabled={busy} onClick={askDelete}>Удалить каталог</Button>
                        </ButtonRow>
                    </InspectorSection>
                </>
            ) : null}
        </Inspector>
    );
}
