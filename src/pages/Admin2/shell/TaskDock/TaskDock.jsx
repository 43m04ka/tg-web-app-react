import React, {useState} from 'react';
import Icon from '../Icon';
import NoticeDetails from './NoticeDetails';
import {cancelProcess, cancelWaiting, dismissNotice, setProcessNotification, summarize, useTasks} from '../../platform/tasks';
import {askConfirm, toastFail} from '../../platform/notify';
import {IconButton} from '../../ui/primitives/Button';
import {Badge, Count, Dot} from '../../ui/primitives/Badge';
import {ProgressBar} from '../../ui/primitives/Feedback';
import {Toggle} from '../../ui/primitives/Field';
import style from './TaskDock.module.scss';

const SOURCE_TITLES = {
    ps: 'PlayStation',
    xbox: 'Xbox',
};

const noticeTone = (level) => {
    if (level === 'error') return 'danger';
    if (level === 'warning') return 'warning';
    return 'info';
};

const shortTime = (value) => new Date(value).toLocaleTimeString('ru-RU', {hour: '2-digit', minute: '2-digit'});

function ProcessCard({item}) {
    const waiting = item.state === 'waiting';

    const cancel = async () => {
        const confirmed = await askConfirm({
            title: waiting ? 'Снять задачу из очереди?' : 'Отменить задачу?',
            text: item.name,
            consequence: waiting
                ? 'Задача не запустится, уже сделанное не затрагивается'
                : 'Отмена срабатывает на ближайшей проверке внутри задачи, сохранённые позиции остаются',
            confirmText: waiting ? 'Снять' : 'Отменить задачу',
            tone: 'danger',
        });

        if (!confirmed) return;

        try {
            if (waiting && item.queueId) await cancelWaiting(item.queueId);
            else await cancelProcess(item.id);
        } catch (failure) {
            toastFail('Не удалось отменить', failure.message);
        }
    };

    const toggleNotification = async (next) => {
        try {
            await setProcessNotification(item.id, next);
        } catch (failure) {
            toastFail('Не удалось изменить уведомление', failure.message);
        }
    };

    return (
        <article className={`${style.card} ${item.cancelled ? style.cardCancelled : ''}`}>
            <div className={style.cardHead}>
                <span className={style.cardName}>{item.name || 'Задача'}</span>
                {waiting ? <Badge tone="neutral">в очереди</Badge> : null}
                {item.source ? <Badge tone="accent">{SOURCE_TITLES[item.source] || item.source}</Badge> : null}
                {item.cancelled ? <Badge tone="danger">отменяется</Badge> : null}
                <span className={style.cardEta}>{item.etaText ? `≈ ${item.etaText}` : 'считаем'}</span>
                <IconButton label="Отменить" onClick={cancel}>
                    <Icon name="cancel"/>
                </IconButton>
            </div>

            <div className={style.cardText}>{item.text || ''}</div>

            <div className={style.cardProgress}>
                <ProgressBar
                    value={waiting ? 100 : item.progress}
                    tone={item.cancelled ? 'danger' : 'accent'}
                    muted={waiting}
                />
                <span className={style.cardPercent}>{waiting ? '—' : `${Math.round(item.progress || 0)}%`}</span>
            </div>

            <div className={style.cardFoot}>
                <Toggle
                    checked={Boolean(item.notification)}
                    onChange={toggleNotification}
                    label="Сообщить в Telegram"
                />
            </div>
        </article>
    );
}

function NoticeCard({item, onOpen}) {
    const close = async () => {
        try {
            await dismissNotice(item.id);
        } catch (failure) {
            toastFail('Не удалось закрыть', failure.message);
        }
    };

    return (
        <article className={style.notice}>
            <div className={style.noticeHead}>
                <Dot tone={noticeTone(item.level)}/>
                <span className={style.noticeName}>{item.name || 'Итог задачи'}</span>
                <span className={style.noticeTime}>{shortTime(item.createdAt)}</span>
                <IconButton label="Закрыть" onClick={close}>×</IconButton>
            </div>

            <div className={style.noticeText}>{item.text}</div>

            {item.detailsCount ? (
                <button type="button" className={style.noticeMore} onClick={() => onOpen(item.id)}>
                    Разобрать · {item.detailsCount}
                </button>
            ) : null}
        </article>
    );
}

export default function TaskDock() {
    const [open, setOpen] = useState(false);
    const [noticeId, setNoticeId] = useState(null);

    const tasks = useTasks();
    const {running, waiting, leader, total, noticeCount, alarming} = summarize(tasks);

    const queueLines = Object.entries(tasks.queue || {})
        .map(([source, state]) => ({
            source,
            running: state?.running ? 1 : 0,
            waiting: (state?.waiting || []).length,
        }))
        .filter((line) => line.running || line.waiting);

    const headline = total
        ? [
            `${total} ${total === 1 ? 'задача' : 'задачи'}`,
            leader ? `${leader.name} ${Math.round(leader.progress || 0)}%` : null,
            leader && leader.etaText ? `≈ ${leader.etaText}` : null,
        ].filter(Boolean).join(' · ')
        : 'Фоновых задач нет';

    return (
        <>
            <div className={`${style.dock} ${open ? style.dockOpen : ''}`}>
                {open ? (
                    <div className={style.panel}>
                        <section className={style.column}>
                            <header className={style.columnHead}>
                                <span className={style.columnTitle}>Идёт</span>
                                <Count value={running.length + waiting.length}/>
                                {queueLines.map((line) => (
                                    <span key={line.source} className={style.queueLine}>
                                        {SOURCE_TITLES[line.source] || line.source}: {line.running ? 'идёт 1' : 'свободно'}
                                        {line.waiting ? `, ждёт ${line.waiting}` : ''}
                                    </span>
                                ))}
                            </header>

                            <div className={style.columnBody}>
                                {running.concat(waiting).length
                                    ? running.concat(waiting).map((item) => <ProcessCard key={item.id} item={item}/>)
                                    : (
                                        <div className={style.placeholder}>
                                            Сейчас ничего не выполняется. Парс, перепроверка и рассылка появятся здесь
                                            сразу после запуска.
                                        </div>
                                    )}
                            </div>
                        </section>

                        <section className={style.column}>
                            <header className={style.columnHead}>
                                <span className={style.columnTitle}>Итоги</span>
                                <Count value={noticeCount}/>
                            </header>

                            <div className={style.columnBody}>
                                {tasks.notices.length
                                    ? tasks.notices.map((item) => (
                                        <NoticeCard key={item.id} item={item} onOpen={setNoticeId}/>
                                    ))
                                    : (
                                        <div className={style.placeholder}>
                                            Итоги задач живут в памяти сервера: после его перезапуска лента пуста —
                                            это не ошибка.
                                        </div>
                                    )}
                            </div>
                        </section>
                    </div>
                ) : null}

                <button type="button" className={style.bar} onClick={() => setOpen((value) => !value)}>
                    <span className={style.barIcon}>
                        <Icon name={open ? 'down' : 'up'}/>
                    </span>

                    <span className={style.barText}>{headline}</span>

                    {leader && !open ? (
                        <span className={style.barProgress}>
                            <ProgressBar value={leader.progress} tone="accent"/>
                        </span>
                    ) : null}

                    {noticeCount ? (
                        <span className={style.barNotices}>
                            <Dot tone={alarming ? 'danger' : 'info'}/>
                            итогов {noticeCount}
                        </span>
                    ) : null}

                    {tasks.error ? <span className={style.barError}>связь с сервером потеряна</span> : null}
                </button>
            </div>

            {noticeId ? <NoticeDetails noticeId={noticeId} onClose={() => setNoticeId(null)}/> : null}
        </>
    );
}
