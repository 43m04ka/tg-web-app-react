import React, { useEffect, useRef } from 'react';
import style from './Broadcast.module.scss';
import { CUSTOM_EMOJI_LIST } from './broadcastConstants';

const preventBlur = (e) => {
    e.preventDefault();
};

const BroadcastFormatToolbar = ({
    fmt,
    runFormat,
    handleLink,
    emojiOpen,
    setEmojiOpen,
    insertEmoji,
}) => {
    const emojiWrapRef = useRef(null);

    useEffect(() => {
        if (!emojiOpen) return;
        const onDoc = (e) => {
            if (emojiWrapRef.current && !emojiWrapRef.current.contains(e.target)) {
                setEmojiOpen(false);
            }
        };
        document.addEventListener('mousedown', onDoc);
        return () => document.removeEventListener('mousedown', onDoc);
    }, [emojiOpen, setEmojiOpen]);

    const toolClass = (active) =>
        `${style['toolBtn']} ${active ? style['toolBtnActive'] : ''}`;

    return (
        <div className={style['toolbar']}>
            <button
                type="button"
                className={toolClass(fmt.bold)}
                onMouseDown={preventBlur}
                onClick={() => runFormat('bold')}
            >
                B
            </button>
            <button
                type="button"
                className={toolClass(fmt.italic)}
                onMouseDown={preventBlur}
                onClick={() => runFormat('italic')}
            >
                I
            </button>
            <button
                type="button"
                className={`${toolClass(fmt.underline)} ${style['toolBtnUnderline']}`}
                onMouseDown={preventBlur}
                onClick={() => runFormat('underline')}
            >
                U
            </button>
            <button
                type="button"
                className={`${toolClass(fmt.strikeThrough)} ${style['toolBtnStrike']}`}
                onMouseDown={preventBlur}
                onClick={() => runFormat('strikeThrough')}
            >
                S
            </button>
            <button
                type="button"
                className={style['toolBtn']}
                onMouseDown={preventBlur}
                onClick={handleLink}
                title="Ссылка"
            >
                🔗
            </button>
            <div className={style['emojiPopover']} ref={emojiWrapRef}>
                <button
                    type="button"
                    className={`${style['toolBtn']} ${emojiOpen ? style['toolBtnActive'] : ''}`}
                    onMouseDown={preventBlur}
                    onClick={() => setEmojiOpen((v) => !v)}
                    title="Кастомные Эмодзи"
                >
                    🙂
                </button>
                {emojiOpen ? (
                    <div className={style['emojiPanel']}>
                        {CUSTOM_EMOJI_LIST.map((em) => {
                            const emojiStaticUrl = `/static/emojis/${em.id}.webp`;

                            return (
                                <button
                                    key={em.id}
                                    type="button"
                                    className={style['emojiCell']}
                                    onMouseDown={preventBlur}
                                    onClick={() => insertEmoji(em)}
                                    title={`ID: ${em.id}`}
                                >
                                    <img
                                        src={emojiStaticUrl}
                                        alt={em.fallback}
                                        className={style['emojiImg']}
                                        onError={(e) => {
                                            e.target.style.display = 'none';
                                            e.target.nextSibling.style.display = 'inline';
                                        }}
                                    />
                                    <span style={{ display: 'none' }}>{em.fallback}</span>
                                </button>
                            );
                        })}
                    </div>
                ) : null}
            </div>
        </div>
    );
};

export default BroadcastFormatToolbar;