import React from 'react';
import style from './Broadcast.module.scss';
import BroadcastPaperclipIcon from './BroadcastPaperclipIcon';

const BroadcastMediaDropzone = ({
    inputId,
    dragActive,
    setDragActive,
    onPickFiles,
    onDropZoneClick,
    media,
    onRemoveMedia,
}) => (
    <div>
        <p className={style['sectionLabel']}>Одно изображение или одно видео (опционально)</p>
        <input
            id={inputId}
            className={style['hiddenInput']}
            type="file"
            accept="image/jpeg,image/png,image/gif,image/webp,video/*"
            onChange={(e) => {
                onPickFiles(e.target.files);
                e.target.value = '';
            }}
        />
        <div
            role="button"
            tabIndex={0}
            className={`${style['dropZone']} ${dragActive ? style['dragActive'] : ''}`}
            onClick={onDropZoneClick}
            onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    onDropZoneClick();
                }
            }}
            onDragEnter={(e) => {
                e.preventDefault();
                setDragActive(true);
            }}
            onDragOver={(e) => {
                e.preventDefault();
                setDragActive(true);
            }}
            onDragLeave={() => setDragActive(false)}
            onDrop={(e) => {
                e.preventDefault();
                setDragActive(false);
                onPickFiles(e.dataTransfer.files);
            }}
        >
            <div className={style['dropZoneHint']}>
                <BroadcastPaperclipIcon />
                <span>Добавьте или перетащите один файл (новый заменит текущий)</span>
            </div>
        </div>
        {media ? (
            <div className={style['mediaList']}>
                <div className={style['mediaChip']}>
                    {media.previewUrl ? (
                        <img className={style['mediaThumb']} src={media.previewUrl} alt="" />
                    ) : (
                        <div className={style['mediaFileFallback']} title={media.name}>
                            {media.name}
                        </div>
                    )}
                    {media.isVideo ? <span className={style['mediaVideoBadge']}>VIDEO</span> : null}
                    <button
                        type="button"
                        className={style['removeMedia']}
                        onClick={(e) => {
                            e.stopPropagation();
                            onRemoveMedia();
                        }}
                        aria-label="Удалить файл"
                    >
                        ×
                    </button>
                </div>
            </div>
        ) : null}
    </div>
);

export default BroadcastMediaDropzone;
