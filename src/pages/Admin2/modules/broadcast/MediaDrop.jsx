import React, {useEffect, useRef, useState} from 'react';
import {Button} from '../../ui';
import {MEDIA_ACCEPT, isVideo} from './broadcastModel';
import style from './BroadcastScreen.module.scss';

const sizeTitle = (bytes) => {
    const mb = bytes / (1024 * 1024);
    return mb >= 1 ? `${mb.toFixed(1)} МБ` : `${Math.round(bytes / 1024)} КБ`;
};

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

export default function MediaDrop({media, disabled, onPick, onDrop}) {
    const inputRef = useRef(null);
    const [dragOver, setDragOver] = useState(false);
    const url = useObjectUrl(media);

    const choose = () => inputRef.current?.click();

    const input = (
        <input
            ref={inputRef}
            type="file"
            accept={MEDIA_ACCEPT}
            className={style.hiddenInput}
            onChange={(event) => {
                const file = event.target.files?.[0] || null;
                event.target.value = '';
                if (file) onPick(file);
            }}
        />
    );

    if (media) {
        return (
            <div className={style.mediaCard}>
                {input}
                <div className={style.mediaThumb}>
                    {url ? (isVideo(media)
                        ? <video className={style.mediaFrame} src={url} muted/>
                        : <img className={style.mediaFrame} src={url} alt=""/>) : null}
                </div>

                <div className={style.mediaBody}>
                    <span className={style.mediaName}>{media.name}</span>
                    <span className={style.mediaMeta}>
                        {isVideo(media) ? 'Видео' : 'Изображение'} · {sizeTitle(media.size)} · текст станет подписью
                    </span>
                </div>

                <div className={style.mediaActions}>
                    <Button size="s" variant="secondary" disabled={disabled} onClick={choose}>Заменить</Button>
                    <Button size="s" variant="ghost" disabled={disabled} onClick={onDrop}>Убрать</Button>
                </div>
            </div>
        );
    }

    return (
        <div
            className={`${style.drop} ${dragOver ? style.dropActive : ''}`}
            onDragOver={(event) => {
                event.preventDefault();
                if (!disabled) setDragOver(true);
            }}
            onDragLeave={() => setDragOver(false)}
            onDrop={(event) => {
                event.preventDefault();
                setDragOver(false);
                const file = event.dataTransfer.files?.[0] || null;
                if (file && !disabled) onPick(file);
            }}
        >
            {input}
            <span className={style.dropIcon}>＋</span>
            <span className={style.dropText}>
                <span className={style.dropTitle}>Перетащите изображение или видео сюда</span>
                <span className={style.dropHint}>JPG, PNG, GIF, WEBP, MP4, MOV — до 50 МБ. С медиа текст станет подписью до 1024 знаков.</span>
            </span>
            <Button variant="primary" disabled={disabled} onClick={choose}>Выбрать с компьютера</Button>
        </div>
    );
}
