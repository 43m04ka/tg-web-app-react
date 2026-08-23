import React from 'react';
import {useNavigate} from 'react-router-dom';
import {useAppInsets} from '../../shared/hooks/useAppInsets';
import EmptyState from '../../shared/ui/EmptyState/EmptyState';
import style from './Stub.module.scss';

export default function Stub({title, text, icon = '🛠'}) {
    const navigate = useNavigate();
    const {contentSafeAreaInset} = useAppInsets();

    return (
        <div
            className={style.screen}
            style={{paddingTop: `calc(${contentSafeAreaInset.top}px + 14 * var(--u))`}}
        >
            <EmptyState
                icon={icon}
                title={title}
                text={text}
                actionLabel="На главную"
                onAction={() => navigate('/main')}
            />
        </div>
    );
}
