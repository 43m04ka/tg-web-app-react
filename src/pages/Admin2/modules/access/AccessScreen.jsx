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
    Toggle,
    Workspace
} from '../../ui';
import {usePageHeader} from '../../shell/pageHeader';
import HeaderActions from '../../shell/HeaderActions';
import {askConfirm, toast, toastFail} from '../../platform/notify';
import {invalidate} from '../../platform/cache';
import {keys} from '../../platform/resources';
import {useResource} from '../../platform/useResource';
import {fetchAllSettings, fetchSessions, revokeOtherSessions, revokeSession, updateSetting} from './api';
import {agoTitle, leftTitle, otherCount, sortSessions} from './accessModel';
import style from './AccessScreen.module.scss';

export default function AccessScreen() {
    usePageHeader('Доступ');

    const sessions = useResource(keys.sessions, fetchSessions, {refreshMs: 60000});
    const settings = useResource(keys.settings, fetchAllSettings);

    const secondStep = settings.data?.settings?.admin_login_code?.value === true;

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

    const toggleSecondStep = useCallback(async (next) => {
        const answer = await askConfirm({
            title: next ? 'Включить второй шаг входа?' : 'Выключить второй шаг входа?',
            text: next
                ? 'После логина и пароля сервер будет присылать шестизначный код владельцу в Telegram.'
                : 'Вход снова будет требовать только логин и пароль.',
            consequence: next
                ? 'Старая панель второй шаг не умеет — она перестанет пускать. Включайте, когда перейдёте на эту.'
                : '',
            confirmText: next ? 'Включить' : 'Выключить',
            tone: next ? 'danger' : 'accent'
        });

        if (!answer) return;

        try {
            await updateSetting({key: 'admin_login_code', value: next, type: 'boolean'});
            invalidate(keys.settings);
            toast({tone: 'positive', title: next ? 'Второй шаг включён' : 'Второй шаг выключен'});
        } catch (error) {
            toastFail(error.message || 'Не получилось переключить', error.hint || '');
        }
    }, []);

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

            <Panel title="Вход" scroll>
                <Toggle
                    checked={secondStep}
                    label="Спрашивать код из Telegram"
                    disabled={settings.isLoading && !settings.data}
                    onChange={toggleSecondStep}
                />

                <Note tone={secondStep ? 'accent' : 'warning'}>
                    {secondStep
                        ? 'После логина и пароля сервер шлёт шестизначный код владельцу в Telegram. Код живёт пять минут и сгорает после пяти промахов.'
                        : 'Сейчас пароль — единственный барьер: кто его знает, тот получает токен на неделю.'}
                </Note>

                <Note tone="neutral">
                    Старая панель умеет только одношаговый вход. Пока работаете в ней,
                    второй шаг держите выключенным — иначе она перестанет пускать.
                </Note>

                {settings.error ? <ErrorState error={settings.error} onRetry={settings.refresh}/> : null}
            </Panel>
        </Workspace>
    );
}
