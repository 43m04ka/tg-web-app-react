import React, {useEffect, useRef, useState} from 'react';
import s from './Hosting.module.scss';

const CopyButton = ({url, label = 'Ссылка'}) => {
    const [isCopied, setIsCopied] = useState(false);
    const timerRef = useRef(null);

    // Таймер снимаем при размонтировании: карточка исчезает вместе с файлом
    // после удаления, и setState на размонтированном компоненте предупреждал в консоли
    useEffect(() => () => clearTimeout(timerRef.current), []);

    const handleCopy = (event) => {
        event.stopPropagation();
        navigator.clipboard.writeText(url);
        setIsCopied(true);
        clearTimeout(timerRef.current);
        timerRef.current = setTimeout(() => setIsCopied(false), 2000);
    };

    return (
        <div className={s['copyWrap']}>
            {isCopied ? <div className={s['copyToast']}>Скопировано</div> : null}

            <button type="button" className={s['copyBtn']} onClick={handleCopy}>
                {label}
            </button>
        </div>
    );
};

export default CopyButton;
