import React from 'react';
import {Badge, Button, Field, Input, Note, Stat, StatRow} from '../../ui';
import {SCHEDULE_AHEAD_DAYS, STATE_TITLES, recipientsTitle, testVerdict} from './broadcastModel';
import style from './BroadcastScreen.module.scss';

function TestReport({report}) {
    if (!report) return null;

    const verdict = testVerdict(report);
    const errors = report.errorsSample || [];

    return (
        <Note tone={verdict.tone === 'positive' ? 'accent' : verdict.tone}>
            <span className={style.reportTitle}>{verdict.title}</span>
            {errors.length ? (
                <ul className={style.reportList}>
                    {errors.map((item) => (
                        <li key={item.chatId}>Чат {item.chatId}: {item.message}</li>
                    ))}
                </ul>
            ) : null}
        </Note>
    );
}

export default function SendPanel({
    stats,
    state,
    busy,
    schedule,
    problem,
    testDone,
    testReport,
    sending,
    onSchedule,
    onSendTest,
    onSendProduction
}) {
    const production = stats?.productionUniqueRecipients ?? 0;
    const admins = stats?.testAdminRecipients ?? 0;

    return (
        <div className={style.send}>
            <StatRow>
                <Stat label="Получателей" value={production.toLocaleString('ru-RU')}/>
                <Stat label="Админов для пробы" value={admins.toLocaleString('ru-RU')}/>
                <Stat
                    label="Очередь"
                    value={STATE_TITLES[state] || state || '—'}
                    tone={state === 'idle' ? 'positive' : 'accent'}
                />
            </StatRow>

            {busy ? (
                <Note tone="warning">
                    {state === 'running'
                        ? 'Рассылка уже идёт. Вторую сервер не примет — дождитесь конца.'
                        : 'Рассылка запланирована. Отмените её в полосе задач, чтобы отправить другую.'}
                </Note>
            ) : null}

            <div className={style.sendBlock}>
                <span className={style.sendTitle}>Когда отправить</span>

                <Field
                    label="Отложить запуск"
                    hint={`Пусто — уходит сразу. Максимум ${SCHEDULE_AHEAD_DAYS} дней вперёд.`}
                >
                    <Input
                        type="datetime-local"
                        value={schedule}
                        onChange={(event) => onSchedule(event.target.value)}
                    />
                </Field>
            </div>

            {problem ? <Note tone="danger">{problem}</Note> : null}

            <div className={style.sendActions}>
                <Button
                    variant="secondary"
                    disabled={busy || Boolean(sending) || Boolean(problem)}
                    loading={sending === 'test'}
                    onClick={onSendTest}
                >
                    {sending === 'test' ? 'Отправляем пробу…' : `Проба на админов (${admins})`}
                </Button>

                <Button
                    variant="primary"
                    disabled={busy || Boolean(sending) || Boolean(problem) || !testDone}
                    loading={sending === 'production'}
                    onClick={onSendProduction}
                >
                    {sending === 'production' ? 'Отправляем…' : `Отправить всем — ${recipientsTitle(production)}`}
                </Button>
            </div>

            <TestReport report={testReport}/>

            {testDone ? (
                <Badge tone="positive">Проба этого сообщения дошла</Badge>
            ) : (
                <Note>
                    Отправка всем откроется после удачной пробы. Проба уходит только админам и показывает сообщение
                    таким, каким его получит покупатель. Любая правка сбрасывает пробу.
                </Note>
            )}
        </div>
    );
}
