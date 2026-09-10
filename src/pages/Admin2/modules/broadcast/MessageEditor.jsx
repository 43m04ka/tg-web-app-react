import React, {useCallback, useEffect, useRef, useState} from 'react';
import {Button, Note} from '../../ui';
import {serializeEditor} from './telegramHtml';
import style from './BroadcastScreen.module.scss';

const COMMANDS = [
    {id: 'bold', command: 'bold', label: 'Ж', title: 'Жирный', className: 'toolBold'},
    {id: 'italic', command: 'italic', label: 'К', title: 'Курсив', className: 'toolItalic'},
    {id: 'underline', command: 'underline', label: 'Ч', title: 'Подчёркнутый', className: 'toolUnderline'},
    {id: 'strikeThrough', command: 'strikeThrough', label: 'З', title: 'Зачёркнутый', className: 'toolStrike'}
];

const EMOJI = ['👍', '🔥', '❤️', '🎉', '✅', '⚠️', '📌', '🛒', '💳', '📦', '🎮', '⚡'];

const readFormatState = () => {
    try {
        return {
            bold: document.queryCommandState('bold'),
            italic: document.queryCommandState('italic'),
            underline: document.queryCommandState('underline'),
            strikeThrough: document.queryCommandState('strikeThrough')
        };
    } catch {
        return {bold: false, italic: false, underline: false, strikeThrough: false};
    }
};

const selectionInside = (element) => {
    if (!element) return false;

    const selection = window.getSelection();
    if (!selection || selection.rangeCount === 0) return false;

    const anchor = selection.anchorNode;
    if (anchor === element) return true;

    const node = anchor?.nodeType === Node.TEXT_NODE ? anchor.parentElement : anchor;
    return node ? element.contains(node) : false;
};

export default function MessageEditor({html, limit, disabled, onChange}) {
    const editorRef = useRef(null);
    const [format, setFormat] = useState(readFormatState);
    const [length, setLength] = useState(0);
    const [emojiOpen, setEmojiOpen] = useState(false);

    const refreshFormat = useCallback(() => {
        if (!selectionInside(editorRef.current)) return;
        setFormat(readFormatState());
    }, []);

    useEffect(() => {
        const onSelection = () => refreshFormat();
        document.addEventListener('selectionchange', onSelection);
        return () => document.removeEventListener('selectionchange', onSelection);
    }, [refreshFormat]);

    const sync = useCallback(() => {
        const element = editorRef.current;
        if (!element) return;

        setLength(serializeEditor(element).length);
        onChange(element.innerHTML);
        refreshFormat();
    }, [onChange, refreshFormat]);

    useEffect(() => {
        const element = editorRef.current;
        if (!element || element.innerHTML === html) return;

        element.innerHTML = html || '';
        setLength(serializeEditor(element).length);
    }, [html]);

    const runCommand = useCallback((command, value = null) => {
        const element = editorRef.current;
        if (!element) return;

        element.focus();

        try {
            document.execCommand(command, false, value);
        } catch {
            return;
        }

        sync();
    }, [sync]);

    const addLink = useCallback(() => {
        const url = window.prompt('Адрес ссылки', 'https://');
        if (!url) return;
        if (!/^https?:\/\//i.test(url.trim())) return;

        runCommand('createLink', url.trim());
    }, [runCommand]);

    const addEmoji = useCallback((emoji) => {
        setEmojiOpen(false);
        runCommand('insertText', emoji);
    }, [runCommand]);

    const handlePaste = useCallback((event) => {
        event.preventDefault();

        const text = event.clipboardData.getData('text/plain');
        if (text) runCommand('insertText', text);
    }, [runCommand]);

    const used = limit > 0 ? length / limit : 0;
    const tone = used > 1 ? 'counterOver' : used > 0.9 ? 'counterNear' : '';

    return (
        <div className={style.editor}>
            <div className={style.toolbar}>
                {COMMANDS.map((item) => (
                    <button
                        key={item.id}
                        type="button"
                        title={item.title}
                        disabled={disabled}
                        aria-pressed={format[item.id]}
                        className={`${style.tool} ${style[item.className]} ${format[item.id] ? style.toolOn : ''}`}
                        onMouseDown={(event) => event.preventDefault()}
                        onClick={() => runCommand(item.command)}
                    >
                        {item.label}
                    </button>
                ))}

                <span className={style.toolSplit}/>

                <button
                    type="button"
                    title="Ссылка"
                    disabled={disabled}
                    className={style.tool}
                    onMouseDown={(event) => event.preventDefault()}
                    onClick={addLink}
                >
                    🔗
                </button>

                <button
                    type="button"
                    title="Убрать форматирование"
                    disabled={disabled}
                    className={style.tool}
                    onMouseDown={(event) => event.preventDefault()}
                    onClick={() => runCommand('removeFormat')}
                >
                    ✕
                </button>

                <span className={style.toolSplit}/>

                <div className={style.emojiWrap}>
                    <button
                        type="button"
                        title="Эмодзи"
                        disabled={disabled}
                        className={style.tool}
                        onMouseDown={(event) => event.preventDefault()}
                        onClick={() => setEmojiOpen((open) => !open)}
                    >
                        🙂
                    </button>

                    {emojiOpen ? (
                        <div className={style.emojiPop}>
                            {EMOJI.map((emoji) => (
                                <button
                                    key={emoji}
                                    type="button"
                                    className={style.emoji}
                                    onMouseDown={(event) => event.preventDefault()}
                                    onClick={() => addEmoji(emoji)}
                                >
                                    {emoji}
                                </button>
                            ))}
                        </div>
                    ) : null}
                </div>
            </div>

            <div
                ref={editorRef}
                className={style.area}
                contentEditable={!disabled}
                suppressContentEditableWarning
                data-placeholder="Текст сообщения…"
                onInput={sync}
                onBlur={sync}
                onKeyUp={refreshFormat}
                onMouseUp={refreshFormat}
                onPaste={handlePaste}
            />

            <div className={style.counterRow}>
                <span className={style.counterHint}>
                    Считается длина готового HTML, а не то, что видно в поле
                </span>
                <span className={`${style.counter} ${style[tone] || ''}`}>
                    {length} / {limit}
                </span>
            </div>

            {length > limit ? (
                <Note tone="danger">
                    Telegram отклонит сообщение целиком. Сократите текст или уберите форматирование —
                    каждый тег тоже занимает знаки.
                </Note>
            ) : null}

            {html ? (
                <div className={style.editorFoot}>
                    <Button size="s" variant="ghost" disabled={disabled} onClick={() => onChange('')}>
                        Очистить
                    </Button>
                </div>
            ) : null}
        </div>
    );
}
