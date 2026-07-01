import React, {forwardRef, useCallback, useEffect, useState} from 'react';
import style from './Broadcast.module.scss';
import {CAPTION_LIMIT, TEXT_LIMIT} from './broadcastConstants';
import {serializeEditorElementToTelegramHtml} from './broadcastTelegramHtml';
import {useFormatBarState} from './useFormatBarState';
import BroadcastFormatToolbar from './BroadcastFormatToolbar';

const BroadcastRichEditor = forwardRef(function BroadcastRichEditor(
    {resetVersion, initialCaptionHtml, hasMedia, limits, onCaptionChange},
    ref,
) {
    const [telegramTextLen, setTelegramTextLen] = useState(0);
    const [emojiOpen, setEmojiOpen] = useState(false);
    const [fmt, refreshFormat] = useFormatBarState(ref);

    const msgMax = limits?.messageHtmlMaxChars ?? TEXT_LIMIT;
    const capMax = limits?.captionHtmlMaxChars ?? CAPTION_LIMIT;
    const limit = hasMedia ? capMax : msgMax;
    const usedPercent = limit > 0 ? Math.min(100, (telegramTextLen / limit) * 100) : 0;

    const syncEditorMetrics = useCallback(() => {
        const el = ref?.current;
        if (!el) return;
        const serialized = serializeEditorElementToTelegramHtml(el);
        setTelegramTextLen(serialized.length);
        onCaptionChange?.(el.innerHTML);
        refreshFormat();
    }, [onCaptionChange, refreshFormat, ref]);

    useEffect(() => {
        const el = ref?.current;
        if (!el) return;
        el.innerHTML = initialCaptionHtml ?? '';
        setTelegramTextLen(serializeEditorElementToTelegramHtml(el).length);
        refreshFormat();
    }, [resetVersion, initialCaptionHtml, refreshFormat, ref]);

    const runFormat = (command, value = null) => {
        const el = ref?.current;
        if (!el) return;
        el.focus();
        try {
            document.execCommand(command, false, value);
        } catch {
            /* ignore */
        }
        syncEditorMetrics();
    };

    const handleLink = () => {
        const url = window.prompt('URL ссылки', 'https://');
        if (!url) return;
        runFormat('createLink', url);
    };

    const insertEmoji = (ch) => {
        const el = ref?.current;
        if (!el) return;
        el.focus();
        document.execCommand('insertText', false, ch);
        setEmojiOpen(false);
        syncEditorMetrics();
    };

    return (
        <div className={style['editorOuter']}>
            <div className={style['editorInner']}>
                <p className={style['editorTitle']}>Сообщение рассылки (HTML для Telegram)</p>
                <div
                    ref={ref}
                    className={style['editorArea']}
                    contentEditable
                    suppressContentEditableWarning
                    data-placeholder="Текст сообщения…"
                    onInput={syncEditorMetrics}
                    onBlur={syncEditorMetrics}
                    onKeyUp={refreshFormat}
                    onMouseUp={refreshFormat}
                />
                <BroadcastFormatToolbar
                    fmt={fmt}
                    runFormat={runFormat}
                    handleLink={handleLink}
                    emojiOpen={emojiOpen}
                    setEmojiOpen={setEmojiOpen}
                    insertEmoji={insertEmoji}
                />
                <div className={style['counterRow']}>
                    <span className={style['counterHint']}>
                        {telegramTextLen} / {limit} в сериализованном HTML для поля text
                    </span>
                    <span
                        className={`${style['counter']} ${
                            usedPercent > 95 ? style['counterErr'] : usedPercent > 85 ? style['counterWarn'] : ''
                        }`}
                    >
                        {usedPercent.toFixed(2)}%
                    </span>
                </div>
            </div>
        </div>
    );
});

export default BroadcastRichEditor;
