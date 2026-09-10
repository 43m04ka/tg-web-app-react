import React, {useCallback, useMemo, useState} from 'react';
import {Button, ErrorState, Panel, SkeletonRows, Workspace} from '../../ui';
import {usePageHeader} from '../../shell/pageHeader';
import HeaderActions from '../../shell/HeaderActions';
import {askConfirm, toast, toastFail} from '../../platform/notify';
import {useResource} from '../../platform/useResource';
import {keys} from '../../platform/resources';
import {fetchBroadcastStats, sendBroadcast} from './api';
import {
    buildKeyboard,
    emptyDraft,
    limitFor,
    readyToSend,
    recipientsTitle
} from './broadcastModel';
import {serializeEditor} from './telegramHtml';
import KeyboardEditor from './KeyboardEditor';
import MessageEditor from './MessageEditor';
import MessagePreview from './MessagePreview';
import SendPanel from './SendPanel';
import style from './BroadcastScreen.module.scss';

const htmlToTelegram = (html) => {
    if (!html) return '';

    const holder = document.createElement('div');
    holder.innerHTML = html;

    return serializeEditor(holder);
};

const fingerprint = (draft, schedule, disablePreview) => JSON.stringify({
    html: draft.captionHtml,
    media: draft.media ? `${draft.media.name}:${draft.media.size}` : null,
    keyboard: buildKeyboard(draft.keyboardRows),
    schedule,
    disablePreview
});

export default function BroadcastScreen() {
    usePageHeader('Рассылка');

    const stats = useResource(keys.broadcast, fetchBroadcastStats, {refreshMs: 20000});

    const [draft, setDraft] = useState(emptyDraft);
    const [schedule, setSchedule] = useState('');
    const [disablePreview, setDisablePreview] = useState(false);
    const [testedAs, setTestedAs] = useState(null);
    const [sending, setSending] = useState(null);

    const limits = stats.data?.limits || null;
    const rawState = stats.data?.state;
    const state = (rawState && typeof rawState === 'object' ? rawState.status : rawState) || 'idle';
    const busy = state !== 'idle';

    const telegramHtml = useMemo(() => htmlToTelegram(draft.captionHtml), [draft.captionHtml]);
    const limit = limitFor(Boolean(draft.media), limits);

    const problem = useMemo(() => readyToSend({
        textLength: telegramHtml.length,
        limit,
        media: draft.media,
        keyboardRows: draft.keyboardRows,
        schedule,
        limits
    }), [telegramHtml, limit, draft.media, draft.keyboardRows, schedule, limits]);

    const stamp = fingerprint(draft, schedule, disablePreview);
    const testDone = testedAs === stamp;

    const setHtml = useCallback((html) => {
        setDraft((prev) => ({...prev, captionHtml: html}));
    }, []);

    const setKeyboard = useCallback((keyboardRows) => {
        setDraft((prev) => ({...prev, keyboardRows}));
    }, []);

    const pickMedia = useCallback((media) => {
        setDraft((prev) => ({...prev, media}));
    }, []);

    const dropMedia = useCallback(() => {
        setDraft((prev) => ({...prev, media: null}));
    }, []);

    const send = useCallback(async (mode) => {
        setSending(mode);

        try {
            const answer = await sendBroadcast({
                mode,
                text: telegramHtml,
                media: draft.media,
                keyboard: buildKeyboard(draft.keyboardRows),
                disablePreview,
                scheduledAt: schedule || null
            });

            if (mode === 'test') {
                setTestedAs(stamp);
                toast({
                    tone: 'positive',
                    title: 'Проба ушла админам',
                    text: 'Проверьте сообщение в Telegram, потом открывайте боевую отправку.'
                });
            } else {
                toast({
                    tone: 'positive',
                    title: answer?.scheduled ? 'Рассылка запланирована' : 'Рассылка запущена',
                    text: answer?.scheduled
                        ? 'До запуска её видно в полосе задач — там же можно отменить.'
                        : 'Ход отправки виден в полосе задач.'
                });
            }

            stats.refresh();
        } catch (error) {
            toastFail(error.message || 'Рассылка не ушла', error.hint || '');
        } finally {
            setSending(null);
        }
    }, [telegramHtml, draft, disablePreview, schedule, stamp, stats]);

    const sendProduction = useCallback(async () => {
        const count = stats.data?.productionUniqueRecipients ?? 0;

        const answer = await askConfirm({
            title: schedule ? 'Запланировать боевую рассылку?' : 'Отправить всем прямо сейчас?',
            text: `Сообщение получат ${recipientsTitle(count)}.`,
            consequence: 'Отменить отправленное невозможно — Telegram не удаляет доставленные сообщения.',
            confirmText: schedule ? 'Запланировать' : 'Отправить',
            tone: 'danger'
        });

        if (answer) send('production');
    }, [stats.data, schedule, send]);

    const reset = useCallback(async () => {
        const answer = await askConfirm({
            title: 'Очистить черновик?',
            text: 'Текст, медиа и кнопки будут сброшены.',
            confirmText: 'Очистить',
            tone: 'danger'
        });

        if (!answer) return;

        setDraft(emptyDraft());
        setSchedule('');
        setDisablePreview(false);
        setTestedAs(null);
    }, []);

    if (stats.error && !stats.data) {
        return (
            <Workspace>
                <ErrorState error={stats.error} onRetry={stats.refresh}/>
            </Workspace>
        );
    }

    if (stats.isLoading && !stats.data) {
        return (
            <Workspace>
                <SkeletonRows count={8}/>
            </Workspace>
        );
    }

    return (
        <Workspace>
            <HeaderActions>
                <Button size="s" variant="ghost" onClick={stats.refresh}>Обновить</Button>
                <Button size="s" variant="ghost" onClick={reset}>Очистить</Button>
            </HeaderActions>

            <Panel title="Сообщение" wide scroll>
                <MessageEditor
                    html={draft.captionHtml}
                    limit={limit}
                    disabled={busy}
                    onChange={setHtml}
                />

                <div className={style.keyboardBlock}>
                    <span className={style.blockTitle}>Кнопки под сообщением</span>

                    <KeyboardEditor
                        rows={draft.keyboardRows}
                        disabled={busy}
                        limits={limits}
                        onChange={setKeyboard}
                    />
                </div>
            </Panel>

            <Panel title="Как увидит покупатель" scroll>
                <MessagePreview
                    telegramHtml={telegramHtml}
                    media={draft.media}
                    keyboardRows={draft.keyboardRows}
                />
            </Panel>

            <Panel title="Отправка" scroll>
                <SendPanel
                    stats={stats.data}
                    state={state}
                    busy={busy}
                    media={draft.media}
                    schedule={schedule}
                    disablePreview={disablePreview}
                    problem={problem}
                    testDone={testDone}
                    sending={sending}
                    onPickMedia={pickMedia}
                    onDropMedia={dropMedia}
                    onSchedule={setSchedule}
                    onDisablePreview={setDisablePreview}
                    onSendTest={() => send('test')}
                    onSendProduction={sendProduction}
                />
            </Panel>
        </Workspace>
    );
}
