import React, {useCallback} from 'react';
import {useNavigate} from 'react-router-dom';
import {useBackButton} from '../../shared/hooks/useBackButton';
import {hapticImpact} from '../../shared/lib/haptic';
import BackPill from '../../shared/ui/BackPill/BackPill';
import style from './Account.module.scss';

export default function PageHeader({title, note, fallback = '/more'}) {
    const navigate = useNavigate();

    const back = useCallback(() => {
        hapticImpact('light');
        if (window.history.length > 1) navigate(-1);
        else navigate(fallback);
    }, [navigate, fallback]);

    const hasNativeBack = useBackButton(back);

    return (
        <div className={style.header}>
            {hasNativeBack ? null : <BackPill className={style.back} onClick={back}/>}

            <h1 className={style.title}>{title}</h1>

            {note ? <span className={style.note}>{note}</span> : null}
        </div>
    );
}
