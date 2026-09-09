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
    rangeQuery
} from './overviewModel';
import style from './OverviewScreen.module.scss';

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
    const range = RANGES.find((item) => item.id === rangeId) || RANGES[1];
    const query = useMemo(() => rangeQuery(range.days), [range.days]);

    const stats = useResource(
        keys.overview(rangeId),
        () => fetchOverview(query),
        {refreshMs: 120000}
    );

    const settings = useResource(keys.settings, () => http('/settings/all'));
    const maintenance = valueOf(settings.data?.settings, 'maintenance_mode');
    const maintenanceUntil = valueOf(settings.data?.settings, 'maintenance_mode_until');

    const report = stats.data || null;
    const bars = useMemo(() => barHeights(report?.byDay), [report]);
    const attention = attentionRows(report?.attention);

    const openOrders = (filter) => navigate(`/admin2/orders${filter ? `?${filter}` : ''}`);

    return (
        <div className={style.screen}>
            <HeaderActions>
                <Tabs items={RANGES.map((item) => ({id: item.id, title: item.title}))} value={rangeId} onChange={setRangeId}/>
                <Button variant="ghost" size="s" onClick={stats.refresh}>Обновить</Button>
            </HeaderActions>

            <section className={style.section}>
                <StatRow>
                    <Stat
                        label={`Выручка за ${range.days} дней`}
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
                <header className={style.head}>
                    <h2 className={style.title}>Склады кодов</h2>
                    <span className={style.hint}>ручная выдача сюда не попадает</span>
                </header>

                {report?.stock?.items?.length ? (
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
                            note={maintenance && maintenanceUntil ? `до ${maintenanceUntil}` : ''}
                        />
                    </StatRow>

                    {settings.error ? <ErrorState error={settings.error} onRetry={settings.refresh}/> : null}
                </section>
            </div>
        </div>
    );
}
