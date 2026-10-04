import React, {useEffect, useMemo, useState} from 'react';
import {
    Badge,
    Button,
    ButtonRow,
    ErrorState,
    Field,
    Input,
    Note,
    Panel,
    SkeletonRows,
    Stat,
    StatRow,
    Tabs,
    Textarea,
    Time,
    Toggle,
    Workspace,
} from '../../ui';
import {usePageHeader} from '../../shell/pageHeader';
import {useResource} from '../../platform/useResource';
import {useMutation} from '../../platform/useMutation';
import {keys} from '../../platform/resources';
import {fetchSubscriptionInfo, refreshSubscriptionInfo, saveSubscriptionEdits} from './api';
import style from './SubscriptionsScreen.module.scss';

const REGION_TITLES = {tr: 'Турция', in: 'Индия'};
const SERVICE_TITLES = {psplus: 'PS Plus', eaplay: 'EA Play', gtaplus: 'GTA+'};

const REGION_ORDER = ['tr', 'in'];
const SERVICE_ORDER = ['psplus', 'eaplay', 'gtaplus'];

const rank = (list, value) => (list.includes(value) ? list.indexOf(value) : list.length);

const recordId = (record) => `${record.region}:${record.service}`;

const draftOf = (record) => ({
    note: record.edits?.note || '',
    tiers: Object.fromEntries(record.tiers.map((tier) => [tier.key, {description: record.edits?.tiers?.[tier.key]?.description || ''}])),
    sections: Object.fromEntries(record.sections.map((section) => [section.key, {
        hidden: Boolean(record.edits?.sections?.[section.key]?.hidden),
        title: record.edits?.sections?.[section.key]?.title || '',
    }])),
});

const monthsLabel = (months) => (months === 12 ? '12 мес' : `${months} мес`);

export default function SubscriptionsScreen() {
    usePageHeader('Подписки PS');

    const info = useResource(keys.subscriptionInfo, fetchSubscriptionInfo);
    const [active, setActive] = useState(null);
    const [drafts, setDrafts] = useState({});
    const [summary, setSummary] = useState(null);

    const records = useMemo(() => (info.data?.records || []).slice().sort((left, right) => (
        rank(REGION_ORDER, left.region) - rank(REGION_ORDER, right.region)
        || rank(SERVICE_ORDER, left.service) - rank(SERVICE_ORDER, right.service)
    )), [info.data]);
    const record = records.find((item) => recordId(item) === active) || records[0] || null;
    const draft = record ? drafts[recordId(record)] || draftOf(record) : null;

    useEffect(() => {
        if (!active && records.length) setActive(recordId(records[0]));
    }, [active, records]);

    const refresh = useMutation(refreshSubscriptionInfo, {
        invalidates: [keys.subscriptionInfo],
        done: 'Данные подписок обновлены',
        onDone: (result) => setSummary(result?.summary || null),
    });

    const save = useMutation(saveSubscriptionEdits, {
        invalidates: [keys.subscriptionInfo],
        done: 'Правки сохранены',
        onDone: () => setDrafts((current) => {
            const next = {...current};
            if (record) delete next[recordId(record)];
            return next;
        }),
    });

    const patch = (updater) => {
        if (!record) return;
        setDrafts((current) => ({...current, [recordId(record)]: updater(current[recordId(record)] || draftOf(record))}));
    };

    const lastRun = summary || info.data?.lastRun || null;

    return (
        <Workspace>
            <Panel
                wide
                title="Подписки PlayStation Store"
                subtitle="Уровни, цены Sony и списки игр по Турции и Индии. Обновляются сами каждый день в 12:00 МСК"
                actions={(
                    <Button variant="primary" loading={refresh.loading || info.data?.running} onClick={() => refresh.run()}>
                        Обновить сейчас
                    </Button>
                )}
                scroll
            >
                {info.error ? <ErrorState error={info.error} onRetry={info.refresh}/> : null}
                {!info.error && info.isLoading && !records.length ? <SkeletonRows count={6}/> : null}

                {!info.error && !info.isLoading && !records.length ? (
                    <Note tone="warning">Данных ещё нет — нажмите «Обновить сейчас».</Note>
                ) : null}

                {records.length ? (
                    <Tabs
                        items={records.map((item) => ({
                            id: recordId(item),
                            title: `${SERVICE_TITLES[item.service] || item.name} · ${REGION_TITLES[item.region] || item.region}`,
                        }))}
                        value={record ? recordId(record) : null}
                        onChange={setActive}
                    />
                ) : null}

                {record ? (
                    <div className={style.body}>
                        <StatRow>
                            <Stat label="Собрано" value={<Time value={record.collectedAt}/>}/>
                            <Stat label="Игр всего" value={record.sections.reduce((sum, section) => sum + section.count, 0)}/>
                            <Stat
                                label="Есть у нас на сайте"
                                value={record.sections.reduce((sum, section) => sum + section.linked, 0)}
                                note="эти игры кликабельны на странице подписки"
                            />
                            <Stat label="Следующее обновление" value={<Time value={info.data?.nextRun}/>}/>
                        </StatRow>

                        {record.error ? <Note tone="danger">{`Последнее обновление не удалось: ${record.error}. Показываются прошлые данные.`}</Note> : null}

                        <section className={style.group}>
                            <h3 className={style.groupTitle}>Уровни и официальные цены</h3>
                            {record.tiers.map((tier) => (
                                <div key={tier.key} className={style.tier}>
                                    <div className={style.tierHead}>
                                        <span className={style.tierName}>{tier.name}</span>
                                        <span className={style.plans}>
                                            {tier.plans.map((plan) => (
                                                <Badge key={plan.months} tone={plan.discountText ? 'positive' : 'neutral'}>
                                                    {`${monthsLabel(plan.months)} · ${plan.price}${plan.discountText ? ` ${plan.discountText}` : ''}`}
                                                </Badge>
                                            ))}
                                            {tier.plans.some((plan) => plan.isTrial || plan.isFree)
                                                ? <Badge tone="positive">есть пробный период</Badge>
                                                : null}
                                        </span>
                                    </div>
                                    <span className={style.benefits}>{tier.benefits.join(' · ')}</span>
                                    <Field label="Описание на сайте" hint="Пусто — описание не показывается, если у Sony оно на английском">
                                        <Textarea
                                            rows={2}
                                            value={draft.tiers[tier.key]?.description || ''}
                                            placeholder={tier.description || ''}
                                            onChange={(event) => patch((current) => ({
                                                ...current,
                                                tiers: {...current.tiers, [tier.key]: {description: event.target.value}},
                                            }))}
                                        />
                                    </Field>
                                </div>
                            ))}
                        </section>

                        <section className={style.group}>
                            <h3 className={style.groupTitle}>Разделы игр</h3>
                            {record.sections.map((section) => {
                                const sectionDraft = draft.sections[section.key] || {hidden: false, title: ''};

                                return (
                                    <div key={section.key} className={style.section}>
                                        <div className={style.sectionHead}>
                                            <Input
                                                value={sectionDraft.title}
                                                placeholder={section.title}
                                                onChange={(event) => patch((current) => ({
                                                    ...current,
                                                    sections: {...current.sections, [section.key]: {...sectionDraft, title: event.target.value}},
                                                }))}
                                            />
                                            <Badge>{`${section.count} игр · ${section.linked} у нас`}</Badge>
                                            <Toggle
                                                checked={!sectionDraft.hidden}
                                                label="На сайте"
                                                onChange={(value) => patch((current) => ({
                                                    ...current,
                                                    sections: {...current.sections, [section.key]: {...sectionDraft, hidden: !value}},
                                                }))}
                                            />
                                        </div>
                                        <span className={style.preview}>
                                            {section.preview.map((game) => (game.availableUntil
                                                ? `${game.name} (до ${new Date(game.availableUntil).toLocaleDateString('ru-RU')})`
                                                : game.name)).join(' · ')}
                                            {section.count > section.preview.length ? ' …' : ''}
                                        </span>
                                    </div>
                                );
                            })}
                        </section>

                        <Field label="Заметка под составом подписки" hint="Видна покупателю на странице выбора подписки">
                            <Textarea
                                rows={2}
                                value={draft.note}
                                onChange={(event) => patch((current) => ({...current, note: event.target.value}))}
                            />
                        </Field>

                        <ButtonRow>
                            <Button
                                variant="primary"
                                loading={save.loading}
                                disabled={!drafts[recordId(record)]}
                                onClick={() => save.run({region: record.region, service: record.service, edits: draft})}
                            >
                                Сохранить правки
                            </Button>
                            {drafts[recordId(record)] ? (
                                <Button
                                    variant="ghost"
                                    onClick={() => setDrafts((current) => {
                                        const next = {...current};
                                        delete next[recordId(record)];
                                        return next;
                                    })}
                                >
                                    Отменить
                                </Button>
                            ) : null}
                        </ButtonRow>
                    </div>
                ) : null}
            </Panel>

            <Panel title="Последнее обновление" scroll>
                {lastRun ? (
                    <div className={style.body}>
                        <StatRow>
                            <Stat label="Когда" value={<Time value={lastRun.startedAt}/>}/>
                            <Stat label="Длилось" value={`${lastRun.seconds} с`}/>
                            <Stat label="Ошибок" value={lastRun.errors.length} tone={lastRun.errors.length ? 'danger' : 'default'}/>
                        </StatRow>

                        {lastRun.errors.map((error) => <Note key={error} tone="danger">{error}</Note>)}

                    </div>
                ) : (
                    <span className={style.hint}>С момента запуска сервера обновлений ещё не было.</span>
                )}
            </Panel>
        </Workspace>
    );
}
