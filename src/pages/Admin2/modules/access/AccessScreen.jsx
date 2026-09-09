import React, {useCallback, useMemo} from 'react';
import {
    Badge,
    Button,
    EmptyState,
    ErrorState,
    Mono,
    Note,
    Panel,
    SkeletonRows,
    Workspace
} from '../../ui';
import {usePageHeader} from '../../shell/pageHeader';
import HeaderActions from '../../shell/HeaderActions';
import {askConfirm, toast, toastFail} from '../../platform/notify';
import {invalidate} from '../../platform/cache';
import {keys} from '../../platform/resources';
import {useResource} from '../../platform/useResource';
import {fetchSessions, revokeOtherSessions, revokeSession} from './api';
import {agoTitle, leftTitle, otherCount, sortSessions} from './accessModel';
import style from './AccessScreen.module.scss';

export default function AccessScreen() {
    usePageHeader('Доступ');

    const sessions = useResource(keys.sessions, fetchSessions, {refreshMs: 60000});

    const rows = useMemo(() => sortSessions(sessions.data?.result), [sessions.data]);
    const others = otherCount(rows);

    const dropOne = useCallback(async (item) => {
        const answer = await askConfirm({
            title: item.current ? 'Отозвать этот вход?' : `Отозвать вход с «${item.device}»?`,
            text: item.current
                ? 'Это ваша текущая сессия — панель сразу попросит войти заново.'
                : 'Устройство перестанет открывать админку немедленно, не дожидаясь конца срока.',
            confirmText: 'Отозвать',
            tone: 'danger'
        });

        if (!answer) return;

        try {
            await revokeSession(item.id);
            invalidate(keys.sessions);
            toast({tone: 'positive', title: 'Вход отозван'});
        } catch (error) {
            toastFail(error.message || 'Не получилось отозвать', error.hint || '');
        }
    }, []);

    const dropOthers = useCallback(async () => {
        const answer = await askConfirm({
            title: 'Отозвать все остальные входы?',
            text: `Сейчас активно ещё ${others}. Все они перестанут открывать админку.`,
            consequence: 'Ваш текущий вход останется.',
            confirmText: 'Отозвать остальные',
            tone: 'danger'
        });

        if (!answer) return;

        try {
            const payload = await revokeOtherSessions();
            invalidate(keys.sessions);
            toast({tone: 'positive', title: `Отозвано входов: ${payload?.revoked ?? others}`});
        } catch (error) {
            toastFail(error.message || 'Не получилось отозвать', error.hint || '');
        }
    }, [others]);

    if (sessions.error && !sessions.data) {
        return (
            <Workspace>
                <ErrorState error={sessions.error} onRetry={sessions.refresh}/>
            </Workspace>
        );
    }

    return (
        <Workspace>
            <HeaderActions>
                <Button size="s" variant="ghost" onClick={sessions.refresh}>Обновить</Button>
            </HeaderActions>

            <Panel
                title="Входы в админку"
                subtitle={rows.length ? `${rows.length} активных` : ''}
                wide
                scroll
                actions={others > 0 ? (
                    <Button size="s" variant="danger" onClick={dropOthers}>
                        Отозвать остальные ({others})
                    </Button>
                ) : null}
            >
                <Note tone="neutral">
                    Один вход — один выданный токен. Отзыв срабатывает сразу: устройство
                    перестаёт открывать панель, не дожидаясь конца недельного срока.
                </Note>

                {sessions.isLoading && !sessions.data ? <SkeletonRows count={3}/> : null}

                {sessions.data && rows.length === 0 ? (
                    <EmptyState
                        title="Активных входов нет"
                        text="Список наполняется, когда кто-то входит в панель."
                    />
                ) : null}

                <div className={style.list}>
                    {rows.map((item) => (
                        <div key={item.id} className={`${style.item} ${item.current ? style.itemCurrent : ''}`}>
                            <span className={style.body}>
                                <span className={style.device}>
                                    {item.device}
                                    {item.current ? <Badge tone="accent">этот вход</Badge> : null}
                                </span>

                                <span className={style.meta}>
                                    {item.ip ? <Mono muted>{item.ip}</Mono> : null}
                                    <span>активность {agoTitle(item.lastSeenAt)}</span>
                                    <span>осталось {leftTitle(item.expiresAt)}</span>
                                </span>
                            </span>

                            <Button size="s" variant="ghost" onClick={() => dropOne(item)}>
                                Отозвать
                            </Button>
                        </div>
                    ))}
                </div>

                <Note tone="warning">
                    Отзыв гасит токен, но не пароль: со знанием логина и пароля можно войти
                    заново и получить новый. Пароль остаётся корневым доступом.
                </Note>
            </Panel>
        </Workspace>
    );
}
