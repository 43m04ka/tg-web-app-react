import React, {useMemo, useState} from 'react';
import {useNavigate} from 'react-router-dom';
import {http} from '../../platform/http';
import {keys} from '../../platform/resources';
import {useResource} from '../../platform/useResource';
import {summarize, useTasks} from '../../platform/tasks';
import {usePageHeader} from '../../shell/pageHeader';
import HeaderActions from '../../shell/HeaderActions';
import {Badge} from '../../ui/primitives/Badge';
import {Button} from '../../ui/primitives/Button';
import {Stat, StatRow} from '../../ui/primitives/Data';
import {EmptyState, ErrorState, Note, Skeleton, SkeletonRows} from '../../ui/primitives/Feedback';
import {Input, Select} from '../../ui/primitives/Field';
import {Tabs} from '../../ui/primitives/Tabs';
import {fetchOverview} from './api';
import {
    PLATFORM_TITLES,
    RANGES,
    TYPE_TITLES,
    attentionRows,
    barHeights,
    dayLabel,
    moneyTitle,
    percentTitle,
    periodTitle,
    profitSlice,
    rangeQuery
} from './overviewModel';

const PROFIT_PLATFORMS = [
    {value: '', title: 'Все площадки'},
    ...Object.entries(PLATFORM_TITLES).map(([value, title]) => ({value, title}))
];
import style from './OverviewScreen.module.scss';
import {formatMoscow} from '../../platform/moscowTime';

const valueOf = (settings, key) => {
    const entry = settings?.[key];
    if (entry && typeof entry === 'object' && 'value' in entry) return entry.value;

    return entry;
};

export default function OverviewScreen() {
    usePageHeader('Что происходит');

    const navigate = useNavigate();
    const tasks = useTasks();
    const {running, waiting, noticeCount, alarming} = summarize(tasks);

    const [rangeId, setRangeId] = useState('30');
    const [stockOpen, setStockOpen] = useState(false);
    const [custom, setCustom] = useState(() => rangeQuery(30));
    const [profitPlatform, setProfitPlatform] = useState('');
    const range = RANGES.find((item) => item.id === rangeId) || RANGES[1];
    const customBad = !range.days && (!custom.from || !custom.to || custom.from > custom.to);
    const query = useMemo(
        () => (range.days ? rangeQuery(range.days) : custom),
        [range.days, custom]
    );

    const stats = useResource(
        keys.overview(`${rangeId}:${query.from}:${query.to}`),
        () => fetchOverview(query),
        {refreshMs: 120000, enabled: !customBad}
    );

    const settings = useResource(keys.settings, () => http('/settings/all'));
    const maintenance = valueOf(settings.data?.settings, 'maintenance_mode');
    const maintenanceUntil = valueOf(settings.data?.settings, 'maintenance_mode_until');

    const report = stats.data || null;
    const period = periodTitle(range, query);
    const profit = profitSlice(report, profitPlatform);
    const bars = useMemo(() => barHeights(report?.byDay), [report]);
    const attention = attentionRows(report?.attention);

    const openOrders = (filter) => navigate(`/admin2/orders${filter ? `?${filter}` : ''}`);

    return (
        <div className={style.screen}>
            <HeaderActions>
                <Tabs items={RANGES.map((item) => ({id: item.id, title: item.title}))} value={rangeId} onChange={setRangeId}/>
                <Button variant="ghost" size="s" onClick={stats.refresh}>Обновить</Button>
            </HeaderActions>

            {range.days ? null : (
                <section className={style.customRange}>
                    <span className={style.customLabel}>Период, московские сутки</span>
                    <Input
                        type="date"
                        value={custom.from}
                        onChange={(event) => setCustom((prev) => ({...prev, from: event.target.value}))}
                    />
                    <span className={style.customDash}>—</span>
                    <Input
                        type="date"
                        value={custom.to}
                        onChange={(event) => setCustom((prev) => ({...prev, to: event.target.value}))}
                    />
                    {customBad ? <span className={style.customError}>Начало позже конца</span> : null}
                </section>
            )}

            <section className={style.profit}>
                <header className={style.head}>
                    <h2 className={style.title}>Чистая прибыль за {period}</h2>
                    <div className={style.profitPlatform}>
                        <Select
                            options={PROFIT_PLATFORMS}
                            value={profitPlatform}
                            onChange={(event) => setProfitPlatform(event.target.value)}
                        />
                    </div>
                </header>

                <StatRow>
                    <Stat
                        label="Чистая прибыль"
                        value={stats.isLoading && !report ? <Skeleton width={110} height={18}/> : moneyTitle(profit?.profit)}
                        tone={profit && profit.profit < 0 ? 'danger' : 'default'}
                        note={profit ? `с выручки ${moneyTitle(profit.profitRevenue)}` : ''}
                    />
                    <Stat
                        label="Маржа"
                        value={stats.isLoading && !report ? <Skeleton width={60} height={18}/> : percentTitle(profit?.margin)}
                    />
                    <Stat
                        label="Заказов в расчёте"
                        value={stats.isLoading && !report ? <Skeleton width={60} height={18}/> : (profit?.profitOrders ?? 0)}
                        note={profit ? `из ${profit.paidOrders} оплаченных` : ''}
                    />
                    <button
                        type="button"
                        className={style.statLink}
                        disabled={!profit?.noCostOrders}
                        title="Открыть эти заказы"
                        onClick={() => openOrders(new URLSearchParams({
                            cost: 'missing',
                            from: query.from,
                            to: query.to,
                            ...(profitPlatform ? {platform: profitPlatform} : {})
                        }).toString())}
                    >
                        <Stat
                            label="Без себестоимости"
                            value={stats.isLoading && !report ? <Skeleton width={60} height={18}/> : (profit?.noCostOrders ?? 0)}
                            note={profit?.noCostOrders ? 'в прибыль не входят · открыть →' : 'в прибыль не входят'}
                        />
                    </button>
                </StatRow>

                <span className={style.profitHint}>
                    Считаются оплаченные и выполненные заказы с указанной себестоимостью. У Steam она считается сама.
                </span>
            </section>

            <section className={style.section}>
                <StatRow>
                    <Stat
                        label={`Выручка за ${period}`}
                        value={stats.isLoading && !report ? <Skeleton width={110} height={18}/> : moneyTitle(report?.totals?.revenue)}
                        note={report ? `скидками отдано ${moneyTitle(report.totals.discount)}` : ''}
                    />
                    <Stat
                        label="Оплаченных заказов"
                        value={stats.isLoading && !report ? <Skeleton width={60} height={18}/> : (report?.totals?.paidOrders ?? 0)}
                        note={report ? `из ${report.totals.orders} оформлений` : ''}
                    />
                    <Stat
                        label="Средний чек"
                        value={stats.isLoading && !report ? <Skeleton width={90} height={18}/> : moneyTitle(report?.totals?.averageCheck)}
                    />
                    <Stat
                        label="Доходят до оплаты"
                        value={stats.isLoading && !report ? <Skeleton width={60} height={18}/> : percentTitle(report?.totals?.paidShare)}
                        note={report?.totals?.refundedOrders ? `возвратов ${report.totals.refundedOrders}` : 'возвратов нет'}
                    />
                </StatRow>

                {stats.error ? <ErrorState error={stats.error} onRetry={stats.refresh}/> : null}
            </section>

            <section className={style.section}>
                <header className={style.head}>
                    <h2 className={style.title}>Требуют внимания</h2>
                    <span className={style.hint}>считается по всей базе, а не за период</span>
                </header>

                {stats.isLoading && !report ? <SkeletonRows count={2}/> : (
                    <div className={style.cards}>
                        {attention.map((row) => (
                            <button
                                key={row.id}
                                type="button"
                                className={`${style.card} ${row.count > 0 && row.alarming ? style.cardAlarm : ''}`}
                                onClick={() => openOrders(row.filter)}
                            >
                                <span className={style.cardValue}>{row.count}</span>
                                <span className={style.cardTitle}>{row.title}</span>
                                <span className={style.cardNote}>{row.note}</span>
                            </button>
                        ))}
                    </div>
                )}
            </section>

            <section className={style.section}>
                <header className={style.head}>
                    <h2 className={style.title}>Выручка по дням</h2>
                    <span className={style.hint}>московские сутки</span>
                </header>

                {stats.isLoading && !report ? <Skeleton width="100%" height={120}/> : bars.length === 0 ? (
                    <EmptyState title="За период заказов не было" text="Выберите более широкое окно."/>
                ) : (
                    <div className={style.chart}>
                        {bars.map((bar) => (
                            <span
                                key={bar.day}
                                className={style.bar}
                                title={`${dayLabel(bar.day)} — ${moneyTitle(bar.value)}, заказов ${bar.orders}`}
                            >
                                <span className={style.barFill} style={{height: `${bar.height}%`}}/>
                                <span className={style.barDay}>{dayLabel(bar.day)}</span>
                            </span>
                        ))}
                    </div>
                )}
            </section>

            <div className={style.columns}>
                <section className={style.section}>
                    <header className={style.head}>
                        <h2 className={style.title}>Откуда деньги</h2>
                    </header>

                    <div className={style.table}>
                        {(report?.byType || []).map((row) => (
                            <div key={row.type} className={style.row}>
                                <span className={style.rowName}>{TYPE_TITLES[row.type] || row.type}</span>
                                <span className={style.rowNote}>{row.paidOrders} заказов</span>
                                <span className={style.rowValue}>{moneyTitle(row.revenue)}</span>
                            </div>
                        ))}

                        {report && report.byType.length === 0 ? (
                            <span className={style.rowNote}>Пусто</span>
                        ) : null}
                    </div>
                </section>

                <section className={style.section}>
                    <header className={style.head}>
                        <h2 className={style.title}>С каких площадок</h2>
                    </header>

                    <div className={style.table}>
                        {(report?.byPlatform || []).map((row) => (
                            <div key={row.platform} className={style.row}>
                                <span className={style.rowName}>{PLATFORM_TITLES[row.platform] || row.platform}</span>
                                <span className={style.rowNote}>{row.paidOrders} заказов</span>
                                <span className={style.rowValue}>{moneyTitle(row.revenue)}</span>
                            </div>
                        ))}

                        {report && report.byPlatform.length === 0 ? (
                            <span className={style.rowNote}>Пусто</span>
                        ) : null}
                    </div>
                </section>
            </div>

            <section className={style.section}>
                <button
                    type="button"
                    className={style.fold}
                    aria-expanded={stockOpen}
                    onClick={() => setStockOpen((value) => !value)}
                >
                    <h2 className={style.title}>Склады кодов</h2>
                    {report?.stock?.items?.length ? (
                        <span className={style.foldBadges}>
                            {report.stock.empty > 0 ? <Badge tone="danger">пусто: {report.stock.empty}</Badge> : null}
                            {report.stock.low > 0 ? <Badge tone="warning">на исходе: {report.stock.low}</Badge> : null}
                        </span>
                    ) : null}
                    <span className={style.hint}>ручная выдача сюда не попадает</span>
                    <i className={stockOpen ? style.foldCaretOpen : style.foldCaret}/>
                </button>

                {!stockOpen ? null : report?.stock?.items?.length ? (
                    <>
                        <Note tone={report.stock.empty > 0 ? 'danger' : 'warning'}>
                            Пусто у {report.stock.empty}, на исходе у {report.stock.low}.
                        </Note>

                        <div className={style.table}>
                            {report.stock.items.map((offer) => (
                                <div key={offer.id} className={style.row}>
                                    <span className={style.rowName}>
                                        {[offer.groupName, offer.denomination].filter(Boolean).join(' · ')}
                                    </span>
                                    <span className={style.rowNote}>бренд №{offer.brandId}</span>
                                    <span className={style.rowValue}>
                                        {offer.available === 0
                                            ? <Badge tone="danger">пусто</Badge>
                                            : `${offer.available} шт`}
                                    </span>
                                </div>
                            ))}
                        </div>

                        <Button size="s" variant="ghost" onClick={() => navigate('/admin2/services')}>
                            Открыть склады
                        </Button>
                    </>
                ) : report ? (
                    <Note tone="neutral">Складов на нуле нет.</Note>
                ) : (
                    <SkeletonRows count={2}/>
                )}
            </section>

            <div className={style.columns}>
                <section className={style.section}>
                    <header className={style.head}>
                        <h2 className={style.title}>Задачи</h2>
                    </header>

                    <StatRow>
                        <Stat
                            label="В работе"
                            value={running.length}
                            note={waiting.length ? `ещё ${waiting.length} в очереди` : 'очередь пуста'}
                        />
                        <Stat
                            label="Итоги без разбора"
                            value={noticeCount}
                            tone={alarming ? 'danger' : 'default'}
                            note={alarming ? 'есть завершения с ошибкой' : 'ошибок нет'}
                        />
                    </StatRow>
                </section>

                <section className={style.section}>
                    <header className={style.head}>
                        <h2 className={style.title}>Витрина</h2>
                    </header>

                    <StatRow>
                        <Stat
                            label="Режим"
                            value={settings.isLoading ? <Skeleton width={80} height={18}/> : (maintenance ? 'Техработы' : 'Работает')}
                            tone={maintenance ? 'danger' : 'positive'}
                            note={maintenance && maintenanceUntil ? `до ${formatMoscow(maintenanceUntil)}` : ''}
                        />
                    </StatRow>

                    {settings.error ? <ErrorState error={settings.error} onRetry={settings.refresh}/> : null}
                </section>
            </div>
        </div>
    );
}
