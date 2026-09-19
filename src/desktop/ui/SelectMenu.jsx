import React, {useCallback, useEffect, useRef, useState} from 'react';
import {ChevronIcon} from '../shell/DesktopIcons';
import style from './SelectMenu.module.scss';

export default function SelectMenu({options, value, onChange, label}) {
    const [isOpen, setOpen] = useState(false);
    const [cursor, setCursor] = useState(0);
    const rootRef = useRef(null);

    const activeIndex = Math.max(0, options.findIndex((item) => item.key === value));
    const active = options[activeIndex];

    useEffect(() => {
        if (!isOpen) return undefined;

        setCursor(activeIndex);

        const onPointerDown = (event) => {
            if (!rootRef.current?.contains(event.target)) setOpen(false);
        };

        document.addEventListener('pointerdown', onPointerDown);

        return () => document.removeEventListener('pointerdown', onPointerDown);
    }, [isOpen, activeIndex]);

    const pick = useCallback((item) => {
        setOpen(false);
        onChange(item.key);
    }, [onChange]);

    const onKeyDown = useCallback((event) => {
        if (event.key === 'Escape') {
            setOpen(false);
            return;
        }

        if (!isOpen) {
            if (event.key === 'ArrowDown') {
                event.preventDefault();
                setOpen(true);
            }

            return;
        }

        if (event.key === 'ArrowDown' || event.key === 'ArrowUp') {
            event.preventDefault();
            const step = event.key === 'ArrowDown' ? 1 : -1;
            setCursor((current) => (current + step + options.length) % options.length);
            return;
        }

        if (event.key === 'Enter') {
            event.preventDefault();
            pick(options[cursor]);
        }
    }, [isOpen, options, cursor, pick]);

    return (
        <div className={style.root} ref={rootRef} onKeyDown={onKeyDown}>
            <button
                type="button"
                className={isOpen ? `${style.trigger} ${style.triggerOpen}` : style.trigger}
                onClick={() => setOpen((open) => !open)}
                aria-expanded={isOpen}
                aria-haspopup="listbox"
                aria-label={label ? `${label}: ${active.label}` : active.label}
            >
                <span className={style.value}>{active.label}</span>
                <ChevronIcon className={style.chevron}/>
            </button>

            {isOpen ? (
                <div className={style.menu} role="listbox">
                    {options.map((item, index) => (
                        <button
                            key={item.key}
                            type="button"
                            role="option"
                            aria-selected={item.key === value}
                            className={[
                                style.option,
                                item.key === value ? style.optionActive : '',
                                index === cursor ? style.optionCursor : ''
                            ].filter(Boolean).join(' ')}
                            style={{'--i': index}}
                            onMouseEnter={() => setCursor(index)}
                            onClick={() => pick(item)}
                        >
                            {item.label}
                        </button>
                    ))}
                </div>
            ) : null}
        </div>
    );
}
