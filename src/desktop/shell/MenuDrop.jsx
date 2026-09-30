import React, {useCallback, useEffect, useRef, useState} from 'react';
import {BurgerIcon, ChevronIcon} from './DesktopIcons';
import style from './MenuDrop.module.scss';

export default function MenuDrop({groups = [], onSelect}) {
    const [isOpen, setOpen] = useState(false);
    const rootRef = useRef(null);

    useEffect(() => {
        if (!isOpen) return undefined;

        const onPointerDown = (event) => {
            if (!rootRef.current?.contains(event.target)) setOpen(false);
        };

        document.addEventListener('pointerdown', onPointerDown);

        return () => document.removeEventListener('pointerdown', onPointerDown);
    }, [isOpen]);

    const onKeyDown = useCallback((event) => {
        if (event.key === 'Escape') setOpen(false);
    }, []);

    return (
        <div className={style.root} ref={rootRef} onKeyDown={onKeyDown}>
            <button
                type="button"
                className={isOpen ? `${style.trigger} ${style.triggerOpen}` : style.trigger}
                onClick={() => setOpen((open) => !open)}
                aria-expanded={isOpen}
                aria-haspopup="menu"
            >
                <BurgerIcon className={style.burger}/>
                <span className={style.title}>Меню</span>
                <ChevronIcon className={style.chevron}/>
            </button>

            {isOpen ? (
                <div className={style.menu} role="menu">
                    {groups.length ? groups.map((group) => (
                        <div key={group.key} className={style.group} role="group" aria-label={group.title}>
                            <span className={style.heading}>{group.title}</span>

                            {group.items.map((item) => (
                                <button
                                    key={item.key}
                                    type="button"
                                    role="menuitem"
                                    className={style.option}
                                    onClick={() => {
                                        setOpen(false);
                                        onSelect?.(item);
                                    }}
                                >
                                    {item.label}
                                </button>
                            ))}
                        </div>
                    )) : (
                        <span className={style.empty}>Раздел наполняется</span>
                    )}
                </div>
            ) : null}
        </div>
    );
}
