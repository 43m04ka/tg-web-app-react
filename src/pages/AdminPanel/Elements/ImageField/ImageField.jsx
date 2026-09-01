import React, {useState} from 'react';
import style from './ImageField.module.scss';

const MAX_SIDE = 192;

const readFile = (file) => new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = reject;
    reader.readAsDataURL(file);
});

const loadImage = (src) => new Promise((resolve, reject) => {
    const image = new Image();
    image.onload = () => resolve(image);
    image.onerror = reject;
    image.src = src;
});

const shrink = async (dataUrl) => {
    const image = await loadImage(dataUrl);
    const side = Math.max(image.width, image.height);

    if (!side) return dataUrl;
    if (side <= MAX_SIDE && dataUrl.length < 60000) return dataUrl;

    const scale = Math.min(1, MAX_SIDE / side);
    const canvas = document.createElement('canvas');
    canvas.width = Math.max(1, Math.round(image.width * scale));
    canvas.height = Math.max(1, Math.round(image.height * scale));

    const context = canvas.getContext('2d');
    context.imageSmoothingQuality = 'high';
    context.drawImage(image, 0, 0, canvas.width, canvas.height);

    return canvas.toDataURL('image/png');
};

const ImageField = ({value, onChange, emptyText = 'Нет', hint}) => {
    const [busy, setBusy] = useState(false);

    const handleFile = async (event) => {
        const file = event.target.files?.[0];
        event.target.value = '';
        if (!file) return;

        setBusy(true);
        try {
            const raw = await readFile(file);
            onChange(await shrink(raw));
        } catch (error) {
            onChange('');
        } finally {
            setBusy(false);
        }
    };

    return (
        <div className={style['field']}>
            {value
                ? <img className={style['preview']} src={value} alt=""/>
                : <span className={style['empty']}>{emptyText}</span>}

            <label className={style['upload']}>
                {busy ? 'Готовим…' : 'Загрузить'}
                <input type="file" accept="image/*" hidden disabled={busy} onChange={handleFile}/>
            </label>

            {value ? (
                <button type="button" className={style['clear']} onClick={() => onChange('')}>
                    Убрать
                </button>
            ) : null}

            {hint ? <span className={style['hint']}>{hint}</span> : null}
        </div>
    );
};

export default ImageField;
