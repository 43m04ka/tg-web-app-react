import React from 'react';
import {useNavigate} from 'react-router-dom';
import {hapticImpact} from '../../shared/lib/haptic';
import style from './Account.module.scss';

// Шапка внутренних экранов из рендеров: пилюля «Назад», заголовок, справа счётчик.
export default function PageHeader({title, note, fallback = '/more'}) {
    const navigate = useNavigate();

    const back = () => {
        hapticImpact('light');
        if (window.history.length > 1) navigate(-1);
        else navigate(fallback);
    };

    return (
        <div className={style.header}>
            <button type="button" className={style.back} onClick={back}>
                <span className={style.backChevron} aria-hidden="true">‹</span>
                <span>Назад</span>
            </button>

            <h1 className={style.title}>{title}</h1>

            {note ? <span className={style.note}>{note}</span> : null}
        </div>
    );
}
