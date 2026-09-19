import React, {useCallback} from 'react';
import {useLocation, useNavigate} from 'react-router-dom';
import style from './BackLink.module.scss';

export default function BackLink({to = '/', label = 'Назад', className}) {
    const navigate = useNavigate();
    const location = useLocation();

    const goBack = useCallback(() => {
        if (location.key && location.key !== 'default') {
            navigate(-1);
            return;
        }

        navigate(to);
    }, [location.key, navigate, to]);

    return (
        <button
            type="button"
            className={className ? `${style.back} ${className}` : style.back}
            onClick={goBack}
        >
            <span className={style.arrow} aria-hidden="true">←</span>
            {label}
        </button>
    );
}
