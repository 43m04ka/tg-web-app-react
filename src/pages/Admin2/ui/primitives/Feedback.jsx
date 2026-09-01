import React from 'react';
import {Button} from './Button';
import style from './Feedback.module.scss';

const classes = (...list) => list.filter(Boolean).join(' ');

export function Skeleton({width = '100%', height = 12, radius = 4}) {
    return <span className={style.skeleton} style={{width, height, borderRadius: radius}}/>;
}

export function SkeletonRows({count = 5}) {
    return (
        <div className={style.skeletonRows}>
            {Array.from({length: count}).map((item, index) => (
                <Skeleton key={index} height={20}/>
            ))}
        </div>
    );
}

export function Spinner({size = 16}) {
    return <span className={style.spinner} style={{width: size, height: size}}/>;
}

export function ProgressBar({value = 0, tone = 'accent', muted = false}) {
    const width = Math.max(0, Math.min(100, Number(value) || 0));

    return (
        <span className={classes(style.progress, muted && style.progressMuted)}>
            <span className={classes(style.progressFill, style[tone])} style={{width: `${width}%`}}/>
        </span>
    );
}

export function EmptyState({title, text = '', action = null, tone = 'neutral'}) {
    return (
        <div className={classes(style.empty, style[tone])}>
            <span className={style.emptyTitle}>{title}</span>
            {text ? <span className={style.emptyText}>{text}</span> : null}
            {action ? (
                <Button variant="secondary" size="s" onClick={action.run}>{action.title}</Button>
            ) : null}
        </div>
    );
}

export function ErrorState({error, onRetry}) {
    return (
        <EmptyState
            tone="danger"
            title={error?.message || 'Запрос не прошёл'}
            text={error?.hint || ''}
            action={onRetry ? {title: 'Повторить', run: onRetry} : null}
        />
    );
}

export function Note({tone = 'neutral', children}) {
    return <div className={classes(style.note, style[tone])}>{children}</div>;
}
