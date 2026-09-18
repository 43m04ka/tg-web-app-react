import React, {useCallback, useEffect, useRef, useState} from 'react';
import {ChevronIcon} from './DesktopIcons';
import style from './RegionMenu.module.scss';

export default function RegionMenu({items, activeId, onSelect}) {
    const [isOpen, setOpen] = useState(false);
    const rootRef = useRef(null);

    useEffect(() => {
        if (!isOpen) return undefined;

        const onPointerDown = (event) => {
            if (!rootRef.current?.contains(event.target)) setOpen(false);
        };

        const onKeyDown = (event) => {
            if (event.key === 'Escape') setOpen(false);
        };

        document.addEventListener('pointerdown', onPointerDown);
        document.addEventListener('keydown', onKeyDown);

        return () => {
            document.removeEventListener('pointerdown', onPointerDown);
            document.removeEventListener('keydown', onKeyDown);
        };
    }, [isOpen]);

    const pick = useCallback((item) => {
        setOpen(false);
        onSelect(item);
    }, [onSelect]);

    if (!items.length) return null;

    const active = items.find((item) => item.id === activeId) || null;

    return (
        <div className={style.root} ref={rootRef}>
            <button
                type="button"
                className={`${style.trigger} ${isOpen ? style.triggerOpen : ''}`}
                onClick={() => setOpen((open) => !open)}
                aria-expanded={isOpen}
                aria-haspopup="listbox"
            >
                {active?.icon ? (
                    <span className={style.icon} style={{backgroundImage: `url(${active.icon})`}} aria-hidden="true"/>
                ) : null}
                <span className={style.title}>{active?.title || 'Витрина'}</span>
                <ChevronIcon className={style.chevron}/>
            </button>

            {isOpen ? (
                <div className={style.menu} role="listbox">
                    <span className={style.menuTitle}>Витрина</span>

                    {items.map((item, index) => (
                        <button
                            key={item.id}
                            type="button"
                            role="option"
                            aria-selected={item.id === activeId}
                            className={`${style.option} ${item.id === activeId ? style.optionActive : ''}`}
                            style={{'--i': index}}
                            onClick={() => pick(item)}
                        >
                            {item.icon ? (
                                <span
                                    className={style.optionIcon}
                                    style={{backgroundImage: `url(${item.icon})`}}
                                    aria-hidden="true"
                                />
                            ) : null}
                            <span className={style.optionLabel}>{item.label}</span>
                        </button>
                    ))}
                </div>
            ) : null}
        </div>
    );
}
