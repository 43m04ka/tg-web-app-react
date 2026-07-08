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

    const transformTelegramHtmlOnPaste = (htmlString) => {
        const parser = new DOMParser();
        const doc = parser.parseFromString(htmlString, 'text/html');
        
        const links = doc.querySelectorAll('a[href^="tg://emoji"]');
        
        links.forEach(link => {
            try {
                const url = new URL(link.getAttribute('href'));
                const emojiId = url.searchParams.get('id');
                
                if (emojiId) {
                    const emojiStaticUrl = `/static/emojis/${emojiId}.webp`;
                    const tgEmoji = doc.createElement('img');
                    tgEmoji.setAttribute('src', emojiStaticUrl);
                    tgEmoji.setAttribute('data-tg-emoji-id', emojiId);
                    tgEmoji.setAttribute('alt', link.textContent || '💙');
                    tgEmoji.style.width = '20px';
                    tgEmoji.style.height = '20px';
                    tgEmoji.style.verticalAlign = 'middle';
                    
                    link.parentNode.replaceChild(tgEmoji, link);
                    return;
                }
            } catch (e) {
            }
        });
        
        return doc.body.innerHTML;
    };

    const handlePaste = (e) => {
        const htmlData = e.clipboardData.getData('text/html');
        const textData = e.clipboardData.getData('text/plain');
        
        console.log('[RAW PASTE HTML]:', htmlData);
        console.log('[RAW PASTE TEXT]:', textData);
    
        if (htmlData) {
            if (htmlData.includes('emoji') || htmlData.includes('data-emoji') || htmlData.includes('id=')) {
                e.preventDefault(); 
                const transformedHtml = transformTelegramHtmlOnPaste(htmlData);
                document.execCommand('insertHTML', false, transformedHtml);
                syncEditorMetrics();
            }
        }
    };

    const syncEditorMetrics = useCallback(() => {
        const el = ref?.current;
        if (!el) return;
        
   
        const serialized = serializeEditorElementToTelegramHtml(el);
        
     
        console.log('[FRONTEND BROADCAST HTML]:', serialized);
        
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

    const insertEmoji = (emojiObj) => {
        const el = ref?.current;
        if (!el) return;
        el.focus();
    
        if (emojiObj && emojiObj.id) {
            const emojiStaticUrl = `/static/emojis/${emojiObj.id}.webp`;
            const htmlNode = `<img src="${emojiStaticUrl}" data-tg-emoji-id="${emojiObj.id}" alt="${emojiObj.fallback}" class="${style['editorEmojiImg']}" style="width: 20px; height: 20px; vertical-align: middle;" />`;
            
            document.execCommand('insertHTML', false, htmlNode);
        } else {
            document.execCommand('insertText', false, emojiObj);
        }
    
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
                    onPaste={handlePaste} 
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
