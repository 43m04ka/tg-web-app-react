import React, {useCallback, useEffect, useState} from 'react';
import {
    Badge,
    Button,
    EmptyState,
    ErrorState,
    Mono,
    Note,
    Panel,
    ProgressBar,
    SkeletonRows,
    Workspace
} from '../../ui';
import {usePageHeader} from '../../shell/pageHeader';
import HeaderActions from '../../shell/HeaderActions';
import {askConfirm, toast, toastFail} from '../../platform/notify';
import {invalidate} from '../../platform/cache';
import {keys} from '../../platform/resources';
import {useResource} from '../../platform/useResource';
import {cancelPlan, fetchActivePlan, fetchPlan, fetchPlans, pausePlan} from './api';
import {dateTitle, durationTitle, isActive, nowLine, progress, statusOf, stepStateOf, stepTarget} from './agentModel';
import style from './AgentScreen.module.scss';

const useNow = (enabled) => {
    const [now, setNow] = useState(Date.now());

    useEffect(() => {
        if (!enabled) return undefined;

        const timerId = setInterval(() => setNow(Date.now()), 1000);
        return () => clearInterval(timerId);
    }, [enabled]);

    return now;
};

function StepRow({step, index, current, planStatus}) {
    const state = stepStateOf(step.state);
    const isCurrent = index === current && ['running', 'review', 'paused'].includes(planStatus);

    return (
        <div className={`${style.step} ${isCurrent ? style.stepCurrent : ''}`}>
            <span className={style.stepNumber}>{index + 1}</span>

            <span className={style.stepBody}>
                <span className={style.stepTitle}>
                    {step.title}
                    <Badge tone={state.tone}>{state.title}</Badge>
                    {step.danger ? <Badge tone="danger">меняет данные</Badge> : null}
                </span>

                <span className={style.stepMeta}>
                    <Mono muted>{stepTarget(step)}</Mono>
                    {step.result?.status ? <span>HTTP {step.result.status}</span> : null}
                    {step.result?.ms ? <span>{durationTitle(step.result.ms)}</span> : null}
                </span>

                {step.body ? (
                    <details className={style.details}>
                        <summary>Тело запроса</summary>
                        <pre className={style.pre}>{JSON.stringify(step.body, null, 2)}</pre>
                    </details>
                ) : null}

                {step.result ? (
                    <details className={style.details} open={step.state === 'failed'}>
                        <summary>Ответ сервера</summary>
                        <pre className={style.pre}>{step.result.body || '(пусто)'}</pre>
                    </details>
                ) : null}

                {step.verdict ? (
                    <span className={style.verdict}>
                        Проверка: {step.verdict.decision === 'continue' ? 'продолжить' : 'пауза'}
                        {step.verdict.reason ? ` — ${step.verdict.reason}` : ''}
                    </span>
                ) : null}
            </span>
        </div>
    );
}

function PlanView({plan, now, onPause, onCancel}) {
    const status = statusOf(plan.status);
    const done = progress(plan);
    const active = isActive(plan);

    return (
        <div className={style.plan}>
            <div className={style.planHead}>
                <span className={style.planTitle}>
                    №{plan.id} · {plan.title}
                    <Badge tone={status.tone}>{status.title}</Badge>
                    {plan.version > 1 ? <Badge tone="neutral">версия {plan.version}</Badge> : null}
                </span>

                {active ? (
                    <span className={style.planActions}>
                        {['running', 'review'].includes(plan.status) ? (
                            <Button size="s" variant="ghost" onClick={() => onPause(plan)}>Пауза</Button>
                        ) : null}
                        <Button size="s" variant="danger" onClick={() => onCancel(plan)}>Отменить</Button>
                    </span>
                ) : null}
            </div>

            {plan.summary ? <p className={style.summary}>{plan.summary}</p> : null}

            <div className={style.now}>
                <span>{nowLine(plan, now)}</span>
                <span className={style.counter}>{done.done} / {done.total}</span>
            </div>

            <ProgressBar value={done.percent} tone={plan.status === 'paused' ? 'warning' : 'accent'}/>

            {plan.status === 'review' && plan.reviewDeadline ? (
                <Note tone="neutral">
                    Если ПК не пришлёт решение до {dateTitle(plan.reviewDeadline)}, план встанет на паузу.
                </Note>
            ) : null}

            {plan.status === 'paused' ? (
                <Note tone="warning">
                    Продолжить или отменить можно кнопками в Telegram у Claude+Agent.
                </Note>
            ) : null}

            <div className={style.steps}>
                {(plan.steps || []).map((step, index) => (
                    <StepRow
                        key={`${plan.version}-${index}`}
                        step={step}
                        index={index}
                        current={plan.current}
                        planStatus={plan.status}
                    />
                ))}
            </div>

            {plan.log?.length ? (
                <details className={style.details}>
                    <summary>Журнал ({plan.log.length})</summary>
                    <div className={style.log}>
                        {plan.log.slice().reverse().map((entry, index) => (
                            <div key={`${entry.at}-${index}`} className={style.logLine}>
                                <Mono muted>{dateTitle(entry.at)}</Mono>
                                <span>{entry.text}</span>
                            </div>
                        ))}
                    </div>
                </details>
            ) : null}
        </div>
    );
}

export default function AgentScreen() {
    usePageHeader('Агент');

    const [selectedId, setSelectedId] = useState(null);

    const activePlan = useResource(keys.agentActive, fetchActivePlan, {refreshMs: 3000});
    const history = useResource(keys.agentPlans, fetchPlans, {refreshMs: 15000});
    const selected = useResource(['agent', 'plan', selectedId], () => fetchPlan(selectedId), {
        enabled: Boolean(selectedId),
        refreshMs: 5000,
    });

    const current = activePlan.data?.result || null;
    const shown = selectedId ? selected.data?.result || null : current;
    const now = useNow(Boolean(shown && isActive(shown)));

    const refreshAll = useCallback(() => {
        invalidate(keys.agentActive);
        invalidate(keys.agentPlans);
        if (selectedId) invalidate(['agent', 'plan', selectedId]);
    }, [selectedId]);

    const pause = useCallback(async (plan) => {
        try {
            await pausePlan(plan.id);
            refreshAll();
            toast({tone: 'positive', title: 'План встанет на паузу после текущего шага'});
        } catch (error) {
            toastFail(error.message || 'Не получилось поставить на паузу', error.hint || '');
        }
    }, [refreshAll]);

    const cancel = useCallback(async (plan) => {
        const answer = await askConfirm({
            title: `Отменить план «${plan.title}»?`,
            text: 'Оставшиеся шаги не выполнятся. Уже сделанное не откатывается.',
            confirmText: 'Отменить план',
            tone: 'danger'
        });

        if (!answer) return;

        try {
            await cancelPlan(plan.id);
            refreshAll();
            toast({tone: 'positive', title: 'План отменён'});
        } catch (error) {
            toastFail(error.message || 'Не получилось отменить', error.hint || '');
        }
    }, [refreshAll]);

    const plans = history.data?.result || [];

    return (
        <Workspace>
            <HeaderActions>
                <Button size="s" variant="ghost" onClick={refreshAll}>Обновить</Button>
            </HeaderActions>

            <Panel
                title={selectedId ? 'План из истории' : 'Текущий план'}
                wide
                scroll
                actions={selectedId ? (
                    <Button size="s" variant="ghost" onClick={() => setSelectedId(null)}>К текущему</Button>
                ) : null}
            >
                {activePlan.error && !activePlan.data ? (
                    <ErrorState error={activePlan.error} onRetry={activePlan.refresh}/>
                ) : null}

                {(selectedId ? selected.isLoading : activePlan.isLoading) && !shown ? <SkeletonRows count={4}/> : null}

                {!selectedId && activePlan.data && !current ? (
                    <EmptyState
                        title="Активного плана нет"
                        text="Агент присылает план в Telegram. После подтверждения кнопкой ход выполнения виден здесь."
                    />
                ) : null}

                {shown ? <PlanView plan={shown} now={now} onPause={pause} onCancel={cancel}/> : null}
            </Panel>

            <Panel title="История" subtitle={plans.length ? `${plans.length} последних` : ''} scroll>
                {history.isLoading && !history.data ? <SkeletonRows count={3}/> : null}
                {history.error && !history.data ? <ErrorState error={history.error} onRetry={history.refresh}/> : null}
                {history.data && !plans.length ? <EmptyState title="Планов ещё не было"/> : null}

                <div className={style.history}>
                    {plans.map((plan) => {
                        const status = statusOf(plan.status);
                        const done = progress(plan);

                        return (
                            <button
                                key={plan.id}
                                type="button"
                                className={`${style.historyItem} ${shown?.id === plan.id ? style.historyItemActive : ''}`}
                                onClick={() => setSelectedId(isActive(plan) ? null : plan.id)}
                            >
                                <span className={style.historyTitle}>
                                    №{plan.id} · {plan.title}
                                </span>
                                <span className={style.historyMeta}>
                                    <Badge tone={status.tone}>{status.title}</Badge>
                                    <span>{done.done} / {done.total}</span>
                                    <span>{dateTitle(plan.createdAt)}</span>
                                </span>
                            </button>
                        );
                    })}
                </div>
            </Panel>
        </Workspace>
    );
}
