import React, {useCallback, useEffect, useMemo, useRef, useState} from 'react';
import {positionsLabel} from '../model/storefrontTotals';
import {ChevronIcon, GridIcon} from './DesktopIcons';
import style from './RegionMenu.module.scss';

const ALL = {id: null, label: 'Все витрины', title: 'Все витрины', icon: null};

export default function RegionMenu({items, scopeId, onSelect, totals}) {
    const [isOpen, setOpen] = useState(false);
    const [cursor, setCursor] = useState(0);
    const rootRef = useRef(null);

    const options = useMemo(() => [ALL, ...items], [items]);
    const activeIndex = Math.max(0, options.findIndex((item) => item.id === scopeId));
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
        onSelect(item);
    }, [onSelect]);

    const onKeyDown = useCallback((event) => {
        if (event.key === 'Escape') {
            setOpen(false);
            return;
        }

        if (!isOpen && (event.key === 'ArrowDown' || event.key === 'Enter' || event.key === ' ')) {
            if (event.key !== 'Enter' && event.key !== ' ') event.preventDefault();
            setOpen(true);
            return;
        }

        if (!isOpen) return;

        if (event.key === 'ArrowDown' || event.key === 'ArrowUp') {
            event.preventDefault();
            const step = event.key === 'ArrowDown' ? 1 : -1;
            setCursor((value) => (value + step + options.length) % options.length);
            return;
        }

        if (event.key === 'Enter') {
            event.preventDefault();
            pick(options[cursor]);
        }
    }, [isOpen, options, cursor, pick]);

    if (!items.length) return null;

    return (
        <div className={style.root} ref={rootRef} onKeyDown={onKeyDown}>
            <button
                type="button"
                className={isOpen ? `${style.trigger} ${style.triggerOpen}` : style.trigger}
                onClick={() => setOpen((open) => !open)}
                aria-expanded={isOpen}
                aria-haspopup="listbox"
            >
                <span className={style.icon}>
                    {active.icon ? (
                        <span
                            className={style.iconImage}
                            style={{backgroundImage: `url(${active.icon})`}}
                            aria-hidden="true"
                        />
                    ) : (
                        <GridIcon className={style.iconGlyph}/>
                    )}
                </span>

                <span className={style.title}>{active.label}</span>
                <ChevronIcon className={style.chevron}/>
            </button>

            {isOpen ? (
                <div className={style.menu} role="listbox">
                    <span className={style.menuTitle}>Витрина</span>

                    {options.map((item, index) => (
                        <button
                            key={item.id === null ? 'all' : item.id}
                            type="button"
                            role="option"
                            aria-selected={item.id === scopeId}
                            className={[
                                style.option,
                                item.id === scopeId ? style.optionActive : '',
                                index === cursor ? style.optionCursor : ''
                            ].filter(Boolean).join(' ')}
                            style={{'--i': index}}
                            onMouseEnter={() => setCursor(index)}
                            onClick={() => pick(item)}
                        >
                            <span className={style.optionIcon}>
                                {item.icon ? (
                                    <span
                                        className={style.iconImage}
                                        style={{backgroundImage: `url(${item.icon})`}}
                                        aria-hidden="true"
                                    />
                                ) : (
                                    <GridIcon className={style.iconGlyph}/>
                                )}
                            </span>

                            <span className={style.optionBody}>
                                <span className={style.optionLabel}>{item.label}</span>
                                <span className={style.optionNote}>{positionsLabel(totals?.get(item.id) ?? null)}</span>
                            </span>
                        </button>
                    ))}
                </div>
            ) : null}
        </div>
    );
}
