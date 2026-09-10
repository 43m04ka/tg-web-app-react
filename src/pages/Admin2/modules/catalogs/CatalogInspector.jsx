import React, {useCallback, useState} from 'react';
import {useNavigate} from 'react-router-dom';
import {
    Badge,
    Button,
    ButtonRow,
    Inspector,
    InspectorSection,
    Input
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
import {SOURCES, pageTitleOf, saleState, sourceOfPage} from './catalogsModel';
import {formatMoscow, fromMoscowInput} from '../../platform/moscowTime';
import {useResource} from '../../platform/useResource';
import ParseForm from './ParseForm';
import style from './CatalogsScreen.module.scss';

const TABS = [
    {id: 'parse', title: 'Парс'},
    {id: 'service', title: 'Обслуживание'}
];

function ServiceGroup({title, children}) {
    return (
        <section className={style.svcGroup}>
            <span className={style.svcGroupTitle}>{title}</span>
            <div className={style.svcRows}>{children}</div>
        </section>
    );
}

function ServiceRow({title, hint, danger = false, children, extra = null}) {
    return (
        <div className={danger ? style.svcRowDanger : style.svcRow}>
            <div className={style.svcMain}>
                <div className={style.svcText}>
                    <span className={style.svcTitle}>{title}</span>
                    {hint ? <span className={style.svcHint}>{hint}</span> : null}
                </div>
                <div className={style.svcActions}>{children}</div>
            </div>
            {extra}
        </div>
    );
}

export default function CatalogInspector({catalog, pages, queue, onClose, onRemoved}) {
    const [tab, setTab] = useState('parse');
    const [busy, setBusy] = useState(false);
    const [runAt, setRunAt] = useState('');
    const navigate = useNavigate();

    const schedule = useResource(keys.associationsSchedule, fetchAssociationsSchedule);
    const plannedAt = schedule.data?.scheduled ? schedule.data.runAtIso : null;

    const source = sourceOfPage(catalog, pages) || 'ps';
    const sale = saleState(catalog);
    const onSale = catalog.onSale === 2;

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
                <div className={style.svc}>
                    <div className={style.svcSummary}>
                        <div className={style.svcFacts}>
                            <span className={style.svcFact}>
                                <span className={style.svcFactLabel}>Витрина</span>
                                {pageTitleOf(catalog, pages) || '—'}
                            </span>
                            <span className={style.svcFact}>
                                <span className={style.svcFactLabel}>Источник</span>
                                {(SOURCES.find((item) => item.value === source) || {}).title || source}
                            </span>
                            <span className={style.svcFact}>
                                <span className={style.svcFactLabel}>Продажи</span>
                                <Badge tone={sale.tone}>{sale.title}</Badge>
                            </span>
                            {catalog.isExchangeIndiaCatalog ? (
                                <span className={style.svcFact}>
                                    <span className={style.svcFactLabel}>Курс</span>
                                    <Badge tone="accent">источник курса Индии</Badge>
                                </span>
                            ) : null}
                        </div>

                        <Button
                            size="s"
                            variant="secondary"
                            onClick={() => navigate(`/admin2/products?catalogId=${catalog.id}`)}
                        >
                            Товары каталога →
                        </Button>
                    </div>

                    <ServiceGroup title="Витрина">
                        <ServiceRow
                            title={onSale ? 'Каталог продаётся' : 'Каталог скрыт'}
                            hint={onSale
                                ? 'Товары видны покупателям. Снятие прячет их с витрины, из базы ничего не удаляется.'
                                : 'Покупатели товары не видят, но они лежат в базе и вернутся одной кнопкой.'}
                        >
                            <Button size="s" variant={onSale ? 'ghost' : 'primary'} disabled={busy} onClick={toggleSale}>
                                {onSale ? 'Снять с продажи' : 'Вернуть в продажу'}
                            </Button>
                        </ServiceRow>
                    </ServiceGroup>

                    <ServiceGroup title="Цены и акции">
                        <ServiceRow
                            title="Закончившиеся акции"
                            hint="Источник не сообщает, когда скидка кончилась. Проверка покажет, сколько позиций попадёт под снятие, ничего не меняя."
                        >
                            <Button size="s" variant="ghost" disabled={busy} onClick={() => runExpire(true)}>Проверить</Button>
                            <Button size="s" variant="secondary" disabled={busy} onClick={() => runExpire(false)}>Снять</Button>
                        </ServiceRow>

                        {source === 'ps_india' || catalog.isExchangeIndiaCatalog ? (
                            <ServiceRow
                                title="Курс рупии"
                                hint={catalog.isExchangeIndiaCatalog
                                    ? 'По ценам этого каталога пересчитываются рупии для витрины Индии.'
                                    : 'Источник курса один на всю витрину: назначение снимет флаг с прежнего каталога.'}
                            >
                                <Button size="s" variant="ghost" disabled={busy || catalog.isExchangeIndiaCatalog} onClick={askIndia}>
                                    {catalog.isExchangeIndiaCatalog ? 'Уже источник' : 'Сделать источником'}
                                </Button>
                            </ServiceRow>
                        ) : null}
                    </ServiceGroup>

                    <ServiceGroup title="Данные">
                        <ServiceRow title="Выгрузить в Excel" hint="Все товары каталога одной таблицей — удобно править цены пачкой.">
                            <Button
                                size="s"
                                variant="ghost"
                                disabled={busy}
                                onClick={() => run(() => exportCatalog(catalog.id, catalog.path), 'Файл выгружен')}
                            >
                                Выгрузить
                            </Button>
                        </ServiceRow>

                        <ServiceRow title="Загрузить из Excel" hint="Принимает выгруженную таблицу обратно и обновляет товары каталога.">
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
                                Выбрать файл
                            </label>
                        </ServiceRow>

                        <ServiceRow
                            title="Похожие карточки"
                            hint={plannedAt
                                ? `Пересчёт связей запланирован на ${formatMoscow(plannedAt)}. Идёт по всем каталогам сразу.`
                                : 'Связи между изданиями и платформами по всем каталогам. Пересчёт тяжёлый — его можно отложить на ночь.'}
                            extra={(
                                <div className={style.svcSchedule}>
                                    <span className={style.svcFactLabel}>Отложить до, МСК</span>
                                    <Input
                                        type="datetime-local"
                                        value={runAt}
                                        onChange={(event) => setRunAt(event.target.value)}
                                    />
                                    <Button
                                        size="s"
                                        variant="ghost"
                                        disabled={busy || !runAt}
                                        onClick={() => run(
                                            async () => {
                                                const answer = await scheduleAssociations(fromMoscowInput(runAt));
                                                invalidate(keys.associationsSchedule);
                                                setRunAt('');
                                                return answer;
                                            },
                                            'Пересчёт запланирован'
                                        )}
                                    >
                                        Запланировать
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
                                            Отменить план
                                        </Button>
                                    ) : null}
                                </div>
                            )}
                        >
                            <Button
                                size="s"
                                variant="secondary"
                                disabled={busy}
                                onClick={() => run(() => runAssociations(), 'Пересчёт связей запущен')}
                            >
                                Пересчитать сейчас
                            </Button>
                        </ServiceRow>
                    </ServiceGroup>

                    <ServiceGroup title="Опасная зона">
                        <ServiceRow danger title="Очистить каталог" hint="Удалит все товары, сам каталог останется. Вернуть их можно только перепарсом.">
                            <Button size="s" variant="danger" disabled={busy} onClick={askClear}>Очистить</Button>
                        </ServiceRow>
                        <ServiceRow danger title="Удалить каталог" hint="Вместе со всеми товарами. Блоки витрины, которые вели сюда, опустеют.">
                            <Button size="s" variant="danger" disabled={busy} onClick={askDelete}>Удалить</Button>
                        </ServiceRow>
                    </ServiceGroup>
                </div>
            ) : null}
        </Inspector>
    );
}
