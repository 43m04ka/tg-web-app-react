import React, {useState} from 'react';
import style from './Broadcast.module.scss';
import {postBroadcastSend} from './useBroadcastServer';
import {serializeEditorElementToTelegramHtml} from './broadcastTelegramHtml';
import {validateKeyboardForSend} from './broadcastKeyboardPayload';
import {hasAdminBearer} from '../../adminAuth';

const BroadcastSendPanel = ({
    authenticationData,
    limits,
    richEditorRef,
    draft,
    onSendComplete,
}) => {
    const [mode, setMode] = useState('test');
    const [disableWebPagePreview, setDisableWebPagePreview] = useState(false);
    const [sending, setSending] = useState(false);
    const [status, setStatus] = useState(null);

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

        setSending(true);
        setStatus(null);
        try {
            const {status: httpStatus, data} = await postBroadcastSend(authenticationData || null, {
                mode,
                text,
                mediaFile: file || null,
                disableWebPagePreview,
                inlineKeyboardJson,
            });

            if (httpStatus === 202 && (data?.accepted === true || data?.accepted === undefined)) {
                setStatus({
                    type: 'ok',
                    text: data.message || 'Запрос принят (202), рассылка в фоне.',
                });
                onSendComplete?.(data);
                return;
            }
            if (httpStatus === 401) {
                setStatus({type: 'err', text: '401: неверная авторизация'});
                return;
            }
            if (httpStatus === 409) {
                setStatus({type: 'err', text: 'Уже выполняется другая рассылка (409)'});
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
            <div className={style['sendActions']}>
                <button type="button" className={style['sendButton']} onClick={handleSend} disabled={sending}>
                    {sending ? 'Отправка…' : 'Запустить рассылку'}
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
