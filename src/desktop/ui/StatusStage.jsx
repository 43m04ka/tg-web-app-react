import React from 'react';
import style from './StatusStage.module.scss';

export function StatusRows({rows}) {
    const visible = rows.filter(Boolean);
    if (!visible.length) return null;

    return (
        <div className={style.rows}>
            {visible.map((row, index) => (
                <div key={row.label} className={style.row} style={{'--i': index}}>
                    <span className={style.rowLabel}>{row.label}</span>
                    <span className={row.tone ? `${style.rowValue} ${style[row.tone]}` : style.rowValue}>
                        {row.value}
                    </span>
                </div>
            ))}
        </div>
    );
}

export default function StatusStage({tone = 'waiting', icon, title, lead, note, children}) {
    return (
        <div className={style.stage}>
            <div className={`${style.icon} ${style[tone]}`} aria-hidden="true">{icon}</div>

            <h1 className={style.title}>{title}</h1>

            {lead ? <p className={style.lead}>{lead}</p> : null}
            {note ? <p className={style.note}>{note}</p> : null}

            {children}
        </div>
    );
}

export function StatusActions({children}) {
    return <div className={style.actions}>{children}</div>;
}

export function StatusError({children}) {
    return <p className={style.error}>{children}</p>;
}

export const statusStyle = style;
