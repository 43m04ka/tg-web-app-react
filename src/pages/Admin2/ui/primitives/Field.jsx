import React from 'react';
import style from './Field.module.scss';

const classes = (...list) => list.filter(Boolean).join(' ');

export function Field({label, hint = '', error = '', required = false, children}) {
    return (
        <label className={style.field}>
            {label ? (
                <span className={style.label}>
                    {label}
                    {required ? <i className={style.required}>*</i> : null}
                </span>
            ) : null}
            {children}
            {error ? <span className={style.error}>{error}</span> : null}
            {!error && hint ? <span className={style.hint}>{hint}</span> : null}
        </label>
    );
}

export function Input({invalid = false, mono = false, className = '', ...rest}) {
    return (
        <input
            className={classes(style.control, mono && style.mono, invalid && style.invalid, className)}
            {...rest}
        />
    );
}

export function Textarea({invalid = false, rows = 4, className = '', ...rest}) {
    return (
        <textarea
            rows={rows}
            className={classes(style.control, style.textarea, invalid && style.invalid, className)}
            {...rest}
        />
    );
}

export function Select({options = [], invalid = false, className = '', ...rest}) {
    return (
        <span className={style.selectWrap}>
            <select className={classes(style.control, style.select, invalid && style.invalid, className)} {...rest}>
                {options.map((option) => (
                    <option key={option.value} value={option.value}>{option.title}</option>
                ))}
            </select>
            <i className={style.caret}/>
        </span>
    );
}

export function Toggle({checked = false, onChange, label = '', disabled = false}) {
    return (
        <button
            type="button"
            role="switch"
            aria-checked={checked}
            disabled={disabled}
            onClick={() => onChange && onChange(!checked)}
            className={classes(style.toggle, checked && style.toggleOn)}
        >
            <span className={style.knob}/>
            {label ? <span className={style.toggleLabel}>{label}</span> : null}
        </button>
    );
}

export function SearchInput({value, onChange, placeholder = 'Поиск', onEnter}) {
    return (
        <span className={style.searchWrap}>
            <svg className={style.searchIcon} viewBox="0 0 16 16" aria-hidden="true">
                <circle cx="7" cy="7" r="5" fill="none" stroke="currentColor" strokeWidth="1.6"/>
                <path d="M11 11l3.5 3.5" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round"/>
            </svg>
            <input
                className={classes(style.control, style.search)}
                value={value}
                placeholder={placeholder}
                onChange={(event) => onChange(event.target.value)}
                onKeyDown={(event) => {
                    if (event.key === 'Enter' && onEnter) onEnter(value);
                }}
            />
        </span>
    );
}
