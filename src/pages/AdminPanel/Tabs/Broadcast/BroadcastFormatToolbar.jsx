import React, {useEffect, useRef} from 'react';
import style from './Broadcast.module.scss';
import {COMMON_EMOJI} from './broadcastConstants';

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
                    title="Эмодзи"
                >
                    🙂
                </button>
                {emojiOpen ? (
                    <div className={style['emojiPanel']}>
                        {COMMON_EMOJI.map((em) => (
                            <button
                                key={em}
                                type="button"
                                className={style['emojiCell']}
                                onMouseDown={preventBlur}
                                onClick={() => insertEmoji(em)}
                            >
                                {em}
                            </button>
                        ))}
                    </div>
                ) : null}
            </div>
        </div>
    );
};

export default BroadcastFormatToolbar;
