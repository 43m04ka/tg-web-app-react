import React, {useCallback, useMemo, useState} from 'react';
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
import {
    downloadAgentToken,
    fetchAgentToken,
    fetchAllSettings,
    fetchCodeRecipients,
    fetchSessions,
    revokeAgentToken,
    revokeOtherSessions,
    revokeSession,
    saveCodeRecipients,
    updateSetting
} from './api';
import {adminTitle, agoTitle, leftTitle, otherCount, sortSessions, toggleChatId} from './accessModel';
import style from './AccessScreen.module.scss';

export default function AccessScreen() {
    usePageHeader('Доступ');

    const sessions = useResource(keys.sessions, fetchSessions, {refreshMs: 60000});
    const settings = useResource(keys.settings, fetchAllSettings);

    const recipients = useResource(keys.codeRecipients, fetchCodeRecipients);
    const agentToken = useResource(keys.agentToken, fetchAgentToken, {refreshMs: 60000});
    const [issuing, setIssuing] = useState(false);
    const [savingRecipients, setSavingRecipients] = useState(false);

    const secondStep = settings.data?.settings?.admin_login_code?.value === true;
    const admins = useMemo(() => recipients.data?.result || [], [recipients.data]);
    const chosen = useMemo(() => admins.filter((admin) => admin.selected).map((admin) => admin.chatId), [admins]);
    const agent = agentToken.data?.result || null;

    const toggleRecipient = useCallback(async (chatId) => {
        const next = toggleChatId(chosen, chatId);

        if (!next.length) {
            toastFail('Нужен хотя бы один получатель', 'Иначе код входа некому будет прислать');
            return;
        }

        setSavingRecipients(true);

        try {
            await saveCodeRecipients(next);
            invalidate(keys.codeRecipients);
            toast({tone: 'positive', title: 'Получатели кода сохранены'});
        } catch (error) {
            toastFail(error.message || 'Не получилось сохранить', error.hint || '');
        } finally {
            setSavingRecipients(false);
        }
    }, [chosen]);

    const issueAgentToken = useCallback(async () => {
        const answer = await askConfirm({
            title: agent ? 'Выпустить новый токен агента?' : 'Выпустить токен агента?',
            text: 'Сервер отдаст файл agent_token.txt. Подключите его в Claude+Agent через трей: «Токен агента…».',
            consequence: agent ? 'Прежний токен агента перестанет работать сразу.' : '',
            confirmText: 'Выпустить и скачать',
            tone: agent ? 'danger' : 'accent'
        });

        if (!answer) return;

        setIssuing(true);

        try {
            await downloadAgentToken();
            invalidate(keys.agentToken);
            invalidate(keys.sessions);
            toast({tone: 'positive', title: 'Токен агента скачан', text: 'Прежние токены агента отозваны'});
        } catch (error) {
            toastFail(error.message || 'Не получилось выпустить токен', error.hint || '');
        } finally {
            setIssuing(false);
        }
    }, [agent]);

    const dropAgentToken = useCallback(async () => {
        const answer = await askConfirm({
            title: 'Отозвать токен агента?',
            text: 'Агент на ПК перестанет видеть и запускать планы, пока вы не выпустите новый токен.',
            confirmText: 'Отозвать',
            tone: 'danger'
        });

        if (!answer) return;

        try {
            await revokeAgentToken();
            invalidate(keys.agentToken);
            invalidate(keys.sessions);
            toast({tone: 'positive', title: 'Токен агента отозван'});
        } catch (error) {
            toastFail(error.message || 'Не получилось отозвать', error.hint || '');
        }
    }, []);

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
                    Один вход — один выданный токен. Отзыв срабатывает сразу. Вход, которым
                    не пользовались неделю, просит код из Telegram, а через месяц простоя
                    закрывается и удаляется сам.
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
                                    {item.kind === 'agent' ? <Badge tone="warning">агент</Badge> : null}
                                </span>

                                <span className={style.meta}>
                                    {item.ip ? <Mono muted>{item.ip}</Mono> : null}
                                    <span>активность {agoTitle(item.lastSeenAt)}</span>
                                    {item.reconfirmAt ? <span>код через {leftTitle(item.reconfirmAt)}</span> : null}
                                    <span>закроется через {leftTitle(item.expiresAt)}</span>
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
                        ? 'После логина и пароля бот Геймворд шлёт шестизначный код выбранным админам. Код живёт пять минут и сгорает после пяти промахов.'
                        : 'Сейчас пароль — единственный барьер при новом входе. Код всё равно спросят у входа, которым не пользовались неделю.'}
                </Note>

                <span className={style.label}>Кому приходит код</span>

                {recipients.isLoading && !recipients.data ? <SkeletonRows count={1}/> : null}

                <div className={style.admins}>
                    {admins.map((admin) => (
                        <label key={admin.chatId} className={style.admin}>
                            <input
                                type="checkbox"
                                checked={admin.selected}
                                disabled={savingRecipients}
                                onChange={() => toggleRecipient(admin.chatId)}
                            />
                            <span>{adminTitle(admin)}</span>
                        </label>
                    ))}
                </div>

                {recipients.error ? <ErrorState error={recipients.error} onRetry={recipients.refresh}/> : null}

                <Note tone="neutral">
                    Старая панель умеет только одношаговый вход. Пока работаете в ней,
                    второй шаг держите выключенным — иначе она перестанет пускать.
                </Note>

                {settings.error ? <ErrorState error={settings.error} onRetry={settings.refresh}/> : null}
            </Panel>

            <Panel
                title="Токен агента"
                subtitle={agent ? 'выпущен' : 'не выпущен'}
                scroll
                actions={agent ? (
                    <Button size="s" variant="ghost" onClick={dropAgentToken}>Отозвать</Button>
                ) : null}
            >
                <Note tone="neutral">
                    Токен для Claude+Agent на ПК владельца. Он открывает только раздел планов
                    агента: предложить план, запустить его после подтверждения в Telegram и
                    вести по шагам. В остальную админку с ним не войти.
                </Note>

                {agent ? (
                    <div className={style.meta}>
                        <span>выпущен {agoTitle(agent.issuedAt)}</span>
                        <span>активность {agoTitle(agent.lastSeenAt)}</span>
                        <span>закроется через {leftTitle(agent.expiresAt)}</span>
                    </div>
                ) : null}

                <Button variant="primary" loading={issuing} onClick={issueAgentToken}>
                    {agent ? 'Выпустить новый и скачать' : 'Выпустить и скачать'}
                </Button>

                <Note tone="warning">
                    Действует только последний выпущенный токен: новый сразу гасит прежний.
                </Note>

                {agentToken.error ? <ErrorState error={agentToken.error} onRetry={agentToken.refresh}/> : null}
            </Panel>
        </Workspace>
    );
}
