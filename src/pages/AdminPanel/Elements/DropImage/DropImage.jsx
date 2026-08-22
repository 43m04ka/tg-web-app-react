import React from 'react';
import style from './DropImage.module.scss';

const DropImage = ({ setValue, icon ,label}) => {

    const handleIconUpload = async (event) => {
        const file = event.target.files?.[0];
        if (!file) {
            return;
        }
        const dataUrl = await fileToDataUrl(file);
        setValue(dataUrl);
        event.target.value = '';
    };

    async function fileToDataUrl(file) {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = () => resolve(reader.result);
            reader.onerror = reject;
            reader.readAsDataURL(file);
        });
    }
    



    return (
        <div className={style.iconBlock}>
            <div className={style.iconLabel}>{label}</div>
            {icon ? (
                <div className={style.iconPreview} style={{ backgroundImage: `url(${icon})` }} />
            ) : (
                <div className={style.iconPlaceholder}>Отстутствует: {label}</div>
            )}
            <label className={style.uploadButton}>
                Загрузить: {label}
                <input
                    type="file"
                    accept="image/*"
                    hidden
                    onChange={handleIconUpload}
                />
            </label>
            {icon ? (
                <button type="button" className={style.clearIcon} onClick={() => setValue('')}>
                    Убрать: {label}
                </button>
            ) : null}
        </div>
    );
};

export default DropImage;
