import React, {useEffect, useRef, useState} from 'react';
import {addReviewPhotos} from './reviewFormModel';
import style from './Reviews.module.scss';

export default function ReviewPhotoUpload({files, disabled, onChange, onError}) {
    const input = useRef(null);
    const depth = useRef(0);
    const [dragging, setDragging] = useState(false);
    const [previews, setPreviews] = useState([]);

    useEffect(() => {
        const next = files.map((file) => ({file, url: URL.createObjectURL(file)}));
        setPreviews(next);
        return () => next.forEach(({url}) => URL.revokeObjectURL(url));
    }, [files]);

    const add = (incoming) => {
        if (disabled) return;
        const result = addReviewPhotos(files, incoming);
        onError(result.error);
        if (!result.error) onChange(result.files);
    };

    return <div className={`${style.upload} ${dragging ? style.uploadDragging : ''} ${disabled ? style.uploadDisabled : ''}`}
        onDragEnter={(event) => {
            event.preventDefault();
            if (disabled) return;
            depth.current += 1;
            setDragging(true);
        }}
        onDragOver={(event) => {
            event.preventDefault();
            event.dataTransfer.dropEffect = disabled ? 'none' : 'copy';
        }}
        onDragLeave={(event) => {
            event.preventDefault();
            depth.current = Math.max(0, depth.current - 1);
            if (!depth.current) setDragging(false);
        }}
        onDrop={(event) => {
            event.preventDefault();
            event.stopPropagation();
            depth.current = 0;
            setDragging(false);
            add(event.dataTransfer.files);
        }}>
        <input ref={input} className={style.uploadInput} type="file" multiple accept="image/jpeg,image/png,image/webp" disabled={disabled}
            aria-label="Фотографии к отзыву" onChange={(event) => {add(event.target.files); event.target.value = '';}}/>
        <button type="button" className={style.uploadChoose} onClick={() => input.current?.click()} disabled={disabled}>
            <span className={style.uploadIcon} aria-hidden="true"><svg viewBox="0 0 24 24" fill="none"><rect x="3" y="3" width="18" height="18" rx="4" stroke="currentColor" strokeWidth="1.6"/><circle cx="8.2" cy="8.2" r="1.7" fill="currentColor"/><path d="m4 17 5-5 4 4 3-3 4 4" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/></svg></span>
            <strong>{files.length ? 'Добавить ещё фотографии' : 'Добавить фотографии'}</strong>
            <span>До 4 фото · JPG, PNG, WebP · до 5 МБ каждое</span>
            <span className={style.uploadDragHint}>Выберите файлы или перетащите их сюда</span>
        </button>
        {previews.length ? <ul className={style.uploadPreviews} aria-label="Выбранные фотографии">{previews.map(({file, url}, index) => <li key={`${file.name}-${file.size}-${file.lastModified}`}>
            <img src={url} alt={`Фотография ${index + 1} к отзыву`}/>
            <span className={style.uploadFileInfo}><strong title={file.name}>{file.name}</strong><small>{file.size < 1024 * 1024 ? `${Math.max(1, Math.round(file.size / 1024))} КБ` : `${(file.size / 1024 / 1024).toFixed(1)} МБ`}</small></span>
            <button type="button" className={style.uploadRemove} aria-label={`Убрать фотографию ${file.name}`} disabled={disabled}
                onClick={() => {onChange(files.filter((_, item) => item !== index)); onError('');}}><svg viewBox="0 0 20 20" fill="none" aria-hidden="true"><path d="m6 6 8 8M14 6l-8 8" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round"/></svg></button>
        </li>)}</ul> : null}
    </div>;
}
