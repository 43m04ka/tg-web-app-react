import React, {useEffect, useRef, useState} from 'react';
import {Dot} from '../../ui';
import {STATUS_TITLES, TRANSITIONS, statusTone} from './model';
import style from './OrderInspector.module.scss';

function StatusOption({status, risky, onPick}) {
    return (
        <button
            type="button"
            role="menuitem"
            className={risky ? style.statusOptionRisky : style.statusOption}
            onClick={() => onPick(status)}
        >
            <Dot tone={statusTone(status)}/>
            <span className={style.statusOptionTitle}>{STATUS_TITLES[status] || status}</span>
            {risky ? <span className={style.statusOptionNote}>без уведомлений</span> : null}
        </button>
    );
}

export default function StatusMenu({current, disabled = false, onPick}) {
    const [open, setOpen] = useState(false);
    const root = useRef(null);

    useEffect(() => {
        if (!open) return undefined;

        const onPointer = (event) => {
            if (!root.current?.contains(event.target)) setOpen(false);
        };
        const onKey = (event) => {
            if (event.key === 'Escape') setOpen(false);
        };

        document.addEventListener('mousedown', onPointer);
        document.addEventListener('keydown', onKey);

        return () => {
            document.removeEventListener('mousedown', onPointer);
            document.removeEventListener('keydown', onKey);
        };
    }, [open]);

    const next = TRANSITIONS[current] || [];
    const rest = Object.keys(STATUS_TITLES).filter((status) => status !== current && !next.includes(status));

    const pick = (status) => {
        setOpen(false);
        onPick(status);
    };

    return (
        <div className={style.statusMenu} ref={root}>
            <button
                type="button"
                className={open ? style.statusTriggerOpen : style.statusTrigger}
                disabled={disabled}
                aria-haspopup="menu"
                aria-expanded={open}
                onClick={() => setOpen((value) => !value)}
            >
                <Dot tone={statusTone(current)}/>
                <span className={style.statusTriggerText}>{STATUS_TITLES[current] || current || 'Статус'}</span>
                <span className={style.statusTriggerHint}>сменить</span>
                <i className={style.statusCaret}/>
            </button>

            {open ? (
                <div className={style.statusPopover} role="menu">
                    {next.length ? (
                        <>
                            <span className={style.statusGroup}>Следующий шаг</span>
                            {next.map((status) => (
                                <StatusOption key={status} status={status} onPick={pick}/>
                            ))}
                        </>
                    ) : (
                        <span className={style.statusEmpty}>У этого статуса нет следующего шага</span>
                    )}

                    {rest.length ? (
                        <>
                            <span className={style.statusGroup}>Вне жизненного цикла</span>
                            {rest.map((status) => (
                                <StatusOption key={status} status={status} risky onPick={pick}/>
                            ))}
                        </>
                    ) : null}
                </div>
            ) : null}
        </div>
    );
}
