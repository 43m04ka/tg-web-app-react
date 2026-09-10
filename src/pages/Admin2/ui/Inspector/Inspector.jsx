import React, {useCallback, useEffect} from 'react';
import {IconButton} from '../primitives/Button';
import {Tabs} from '../primitives/Tabs';
import {ErrorState, SkeletonRows} from '../primitives/Feedback';
import {askConfirm} from '../../platform/notify';
import style from './Inspector.module.scss';

const classes = (...list) => list.filter(Boolean).join(' ');

export function Inspector({
    open = true,
    title,
    subtitle = '',
    badge = null,
    tabs = null,
    tab = '',
    onTab = null,
    onClose,
    dirty = false,
    loading = false,
    error = null,
    onRetry = null,
    footer = null,
    width = 'm',
    children,
}) {
    const close = useCallback(async () => {
        if (dirty) {
            const answer = await askConfirm({
                title: 'Закрыть без сохранения?',
                text: 'В форме есть несохранённые изменения.',
                consequence: 'Правки будут потеряны.',
                confirmText: 'Закрыть',
                tone: 'danger',
            });

            if (!answer) return;
        }

        onClose();
    }, [dirty, onClose]);

    useEffect(() => {
        if (!open) return undefined;

        const onKey = (event) => {
            if (event.key !== 'Escape') return;
            if (document.querySelector('[data-a2-modal]')) return;
            close();
        };

        document.addEventListener('keydown', onKey);
        return () => document.removeEventListener('keydown', onKey);
    }, [open, close]);

    if (!open) return null;

    return (
        <aside className={classes(style.inspector, style[width])}>
            <header className={style.head}>
                <div className={style.heading}>
                    <div className={style.titleRow}>
                        <h2 className={style.title}>{title}</h2>
                        {badge}
                    </div>
                    {subtitle ? <span className={style.subtitle}>{subtitle}</span> : null}
                </div>

                <IconButton label="Закрыть" onClick={close}>×</IconButton>
            </header>

            {tabs ? (
                <div className={style.tabs}>
                    <Tabs items={tabs} value={tab} onChange={onTab}/>
                </div>
            ) : null}

            <div className={style.body}>
                {error ? <ErrorState error={error} onRetry={onRetry}/>
                    : loading ? <SkeletonRows count={7}/>
                        : children}
            </div>

            {footer ? <footer className={style.footer}>{footer}</footer> : null}
        </aside>
    );
}

export function InspectorSection({title, note = '', actions = null, children}) {
    return (
        <section className={style.section}>
            {(title || actions) ? (
                <div className={style.sectionHead}>
                    <span className={style.sectionTitle}>{title}</span>
                    {actions}
                </div>
            ) : null}
            {note ? <span className={style.sectionNote}>{note}</span> : null}
            <div className={style.sectionBody}>{children}</div>
        </section>
    );
}

export function InspectorRows({items}) {
    return (
        <dl className={style.rows}>
            {items.filter(Boolean).map((item) => (
                <div key={item.label} className={style.rowItem}>
                    <dt className={style.rowLabel}>{item.label}</dt>
                    <dd className={style.rowValue}>{item.value}</dd>
                </div>
            ))}
        </dl>
    );
}
