import React, {useState} from 'react';
import style from './Broadcast.module.scss';
import {postBroadcastSend} from './useBroadcastServer';
import {serializeEditorElementToTelegramHtml} from './broadcastTelegramHtml';
import {validateKeyboardForSend} from './broadcastKeyboardPayload';
import {hasAdminBearer} from '../../adminAuth';

// Значение <input type="datetime-local"> — локальное время без зоны;
// шлём epoch ms, чтобы не гадать со смещением
const toEpochMs = (localValue) => {
    const ms = new Date(localValue).getTime();
    return Number.isNaN(ms) ? null : String(ms);
};

const BroadcastSendPanel = ({
    authenticationData,
    limits,
    richEditorRef,
    draft,
    broadcastState,
    onSendComplete,
}) => {
    const [mode, setMode] = useState('test');
    const [disableWebPagePreview, setDisableWebPagePreview] = useState(false);
    const [sending, setSending] = useState(false);
    const [status, setStatus] = useState(null);
    const [scheduledAtLocal, setScheduledAtLocal] = useState('');

    // Рассылка одна на всю систему: пока идёт или запланирована, новую создать нельзя
    const busyStatus = broadcastState?.status;
    const isBusy = busyStatus === 'running' || busyStatus === 'scheduled';

    const maxFileBytes = limits?.maxFileBytes ?? 50 * 1024 * 1024;

    const handleSend = async () => {
        if (!authenticationData && !hasAdminBearer()) {
            setStatus({type: 'err', text: 'Нет данных авторизации'});
            return;
        }
        const el = richEditorRef?.current;
        if (!el) return;

        const text = serializeEditorElementToTelegramHtml(el);
        if (!text.trim()) {
            setStatus({type: 'err', text: 'Введите текст сообщения'});
            return;
        }

        const cap = limits?.captionHtmlMaxChars ?? 1024;
        const full = limits?.messageHtmlMaxChars ?? 4096;
        const maxLen = draft.media ? cap : full;
        if (text.length > maxLen) {
            setStatus({
                type: 'err',
                text: `Текст длиннее лимита (${text.length} > ${maxLen})`,
            });
            return;
        }

        const file = draft.media?.file;
        if (file && file.size > maxFileBytes) {
            setStatus({type: 'err', text: 'Файл слишком большой для бэка (413)'});
            return;
        }

        const kbCheck = validateKeyboardForSend(draft.keyboardRows || [], limits?.inlineKeyboard);
        if (!kbCheck.ok) {
            setStatus({type: 'err', text: kbCheck.error});
            return;
        }
        const inlineKeyboardJson = kbCheck.rows ? JSON.stringify(kbCheck.rows) : '';

        let scheduledAt = null;
        if (scheduledAtLocal) {
            scheduledAt = toEpochMs(scheduledAtLocal);
            if (!scheduledAt) {
                setStatus({type: 'err', text: 'Некорректные дата и время запуска'});
                return;
            }
        }

        setSending(true);
        setStatus(null);
        try {
            const {status: httpStatus, data} = await postBroadcastSend(authenticationData || null, {
                mode,
                text,
                mediaFile: file || null,
                disableWebPagePreview,
                inlineKeyboardJson,
                scheduledAt,
            });

            if (httpStatus === 202 && (data?.accepted === true || data?.accepted === undefined)) {
                setStatus({
                    type: 'ok',
                    text:
                        data.message ||
                        (data.scheduled
                            ? 'Рассылка запланирована.'
                            : 'Запрос принят (202), рассылка в фоне.'),
                });
                onSendComplete?.(data);
                return;
            }
            if (httpStatus === 401) {
                setStatus({type: 'err', text: '401: неверная авторизация'});
                return;
            }
            if (httpStatus === 409) {
                // Текст сервера объясняет, что именно мешает — показываем как есть
                setStatus({
                    type: 'err',
                    text: data?.error || 'Уже выполняется или запланирована другая рассылка (409)',
                });
                onSendComplete?.(data);
                return;
            }
            if (httpStatus === 413) {
                setStatus({type: 'err', text: 'Файл слишком большой (413)'});
                return;
            }
            setStatus({
                type: 'err',
                text: data?.message || data?.error || `Ошибка ${httpStatus}`,
            });
        } catch (e) {
            setStatus({type: 'err', text: e.message || 'Сеть'});
        } finally {
            setSending(false);
        }
    };

    if (!authenticationData && !hasAdminBearer()) return null;

    return (
        <div className={style['sendPanel']}>
            <div className={style['sendRow']}>
                <span className={style['sendLabel']}>Режим</span>
                <label className={style['radioLabel']}>
                    <input
                        type="radio"
                        name="broadcast-mode"
                        checked={mode === 'test'}
                        onChange={() => setMode('test')}
                    />
                    Тест (только админы)
                </label>
                <label className={style['radioLabel']}>
                    <input
                        type="radio"
                        name="broadcast-mode"
                        checked={mode === 'production'}
                        onChange={() => setMode('production')}
                    />
                    Production (все TG из БД)
                </label>
            </div>
            <label className={style['checkLabel']}>
                <input
                    type="checkbox"
                    checked={disableWebPagePreview}
                    onChange={(e) => setDisableWebPagePreview(e.target.checked)}
                />
                Без превью ссылок (disableWebPagePreview)
            </label>
            <div className={style['sendRow']}>
                <span className={style['sendLabel']}>Запуск</span>
                <input
                    type="datetime-local"
                    className={style['scheduleInput']}
                    value={scheduledAtLocal}
                    onChange={(e) => setScheduledAtLocal(e.target.value)}
                    disabled={isBusy}
                />
                {scheduledAtLocal ? (
                    <button
                        type="button"
                        className={style['scheduleClear']}
                        onClick={() => setScheduledAtLocal('')}
                    >
                        Сбросить
                    </button>
                ) : null}
            </div>
            <p className={style['scheduleHint']}>
                Пусто — рассылка стартует сразу. Отложить можно максимум на 30 дней; при перезапуске
                сервера расписание сбрасывается, поэтому не планируйте далеко вперёд.
            </p>
            {isBusy ? (
                <p className={style['sendStatusErr']}>
                    {busyStatus === 'running'
                        ? 'Рассылка уже идёт. Отменить её можно в списке задач.'
                        : `Рассылка запланирована${
                              broadcastState?.runAt
                                  ? ` на ${new Date(broadcastState.runAt).toLocaleString('ru-RU')}`
                                  : ''
                          }. Отмените её в списке задач, чтобы создать новую.`}
                </p>
            ) : null}
            <div className={style['sendActions']}>
                <button
                    type="button"
                    className={style['sendButton']}
                    onClick={handleSend}
                    disabled={sending || isBusy}
                >
                    {sending
                        ? 'Отправка…'
                        : scheduledAtLocal
                          ? 'Запланировать рассылку'
                          : 'Запустить рассылку'}
                </button>
            </div>
            {status ? (
                <p className={status.type === 'ok' ? style['sendStatusOk'] : style['sendStatusErr']}>
                    {status.text}
                </p>
            ) : null}
        </div>
    );
};

export default BroadcastSendPanel;
