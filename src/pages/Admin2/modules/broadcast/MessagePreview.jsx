import React, {useEffect, useState} from 'react';
import {buildKeyboard, isVideo} from './broadcastModel';
import {toPreviewHtml} from './telegramHtml';
import style from './BroadcastScreen.module.scss';

const useObjectUrl = (file) => {
    const [url, setUrl] = useState(null);

    useEffect(() => {
        if (!file) {
            setUrl(null);
            return undefined;
        }

        const next = URL.createObjectURL(file);
        setUrl(next);

        return () => URL.revokeObjectURL(next);
    }, [file]);

    return url;
};

const buttonHint = (button) => {
    if (button.url) return button.url;
    if (button.web_app) return button.web_app.url;
    if (button.callback_data) return `ответ боту: ${button.callback_data}`;

    return 'поделиться';
};

export default function MessagePreview({telegramHtml, media, keyboardRows}) {
    const mediaUrl = useObjectUrl(media);
    const keyboard = buildKeyboard(keyboardRows);
    const isEmpty = !telegramHtml && !media;

    return (
        <div className={style.preview}>
            <div className={style.phone}>
                <div className={style.bubble}>
                    {media ? (
                        <div className={style.bubbleMedia}>
                            {isVideo(media)
                                ? <video className={style.mediaFrame} src={mediaUrl} muted controls/>
                                : <img className={style.mediaFrame} src={mediaUrl} alt=""/>}
                        </div>
                    ) : null}

                    {isEmpty ? (
                        <p className={style.bubbleEmpty}>Здесь появится то, что увидит покупатель</p>
                    ) : (
                        <div
                            className={style.bubbleText}
                            dangerouslySetInnerHTML={{__html: toPreviewHtml(telegramHtml)}}
                        />
                    )}

                    {keyboard ? (
                        <div className={style.bubbleKeyboard}>
                            {keyboard.map((row, rowIndex) => (
                                <div key={rowIndex} className={style.bubbleRow}>
                                    {row.map((button, index) => (
                                        <span key={index} className={style.bubbleButton} title={buttonHint(button)}>
                                            {button.text}
                                        </span>
                                    ))}
                                </div>
                            ))}
                        </div>
                    ) : null}
                </div>
            </div>

            <p className={style.previewNote}>
                Ссылки и эмодзи Telegram здесь показаны текстом: в мессенджере они будут кликабельны.
            </p>
        </div>
    );
}
