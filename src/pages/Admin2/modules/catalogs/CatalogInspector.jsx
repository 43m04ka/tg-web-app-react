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
    Note,
    Toggle
} from '../../ui';
import {askConfirm, toast, toastFail} from '../../platform/notify';
import {invalidate} from '../../platform/cache';
import {keys} from '../../platform/resources';
import {
    changeSaleStatus,
    clearCatalog,
    deleteCatalog,
    expirePromotions,
    setIndiaExchange,
    startRecheck
} from './api';
import {pageTitleOf, saleState, sourceOfPage} from './catalogsModel';
import ParseForm from './ParseForm';

const TABS = [
    {id: 'parse', title: 'Парс'},
    {id: 'recheck', title: 'Перепроверка'},
    {id: 'service', title: 'Обслуживание'}
];

export default function CatalogInspector({catalog, pages, queue, onClose, onRemoved}) {
    const [tab, setTab] = useState('parse');
    const [busy, setBusy] = useState(false);
    const [limit, setLimit] = useState('50');
    const [autoFix, setAutoFix] = useState(false);

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

    const runRecheck = useCallback(() => {
        run(
            () => startRecheck({
                bdPath: catalog.path,
                source: source === 'xbox' ? 'xbox' : 'ps',
                platform: source,
                limit: Number(limit) || 50,
                autoFix
            }),
            'Перепроверка поставлена в очередь'
        );
    }, [run, catalog, source, limit, autoFix]);

    const runExpire = useCallback(async (dryRun) => {
        const answer = await run(() => expirePromotions(dryRun), dryRun ? 'Сухой прогон выполнен' : 'Акции сняты');

        if (answer && dryRun) {
            toast({
                tone: 'info',
                title: 'Сухой прогон',
                text: `Под снятие попадает позиций: ${answer.affected ?? answer.count ?? 0}`
            });
        }
    }, [run]);

    return (
        <Inspector
            open
            width="m"
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

            {tab === 'recheck' ? (
                <InspectorSection
                    title="Перепроверка цен"
                    note="Сверяет цены каталога с источником. Идёт через ту же очередь, что и парс, отчёт забирается из полосы задач."
                >
                    <Field label="Сколько позиций сверить" hint="Больше — дольше и заметнее для источника">
                        <Input type="number" min="1" value={limit} onChange={(event) => setLimit(event.target.value)}/>
                    </Field>

                    <Toggle
                        checked={autoFix}
                        label="Чинить расхождения сразу"
                        onChange={setAutoFix}
                    />

                    {autoFix ? (
                        <Note tone="warning">
                            Цены разошедшихся позиций будут переписаны без вашего подтверждения.
                            Для первого прогона надёжнее выключить и посмотреть отчёт.
                        </Note>
                    ) : null}

                    <Button variant="primary" disabled={busy} onClick={runRecheck}>
                        Запустить перепроверку
                    </Button>
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
