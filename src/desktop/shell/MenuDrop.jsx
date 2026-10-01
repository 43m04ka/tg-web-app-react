import React, {useCallback, useEffect, useMemo, useRef, useState} from 'react';
import {BurgerIcon, ChevronIcon, MenuIcon} from './DesktopIcons';
import style from './MenuDrop.module.scss';

export default function MenuDrop({groups = [], onSelect}) {
    const [isOpen, setOpen] = useState(false);
    const [activeKey, setActiveKey] = useState(null);
    const rootRef = useRef(null);

    const items = useMemo(() => groups.flatMap((group) => group.items), [groups]);
    const active = items.find((item) => item.key === activeKey) || items[0] || null;

    useEffect(() => {
        if (!isOpen) return undefined;

        const onPointerDown = (event) => {
            if (!rootRef.current?.contains(event.target)) setOpen(false);
        };

        document.addEventListener('pointerdown', onPointerDown);

        return () => document.removeEventListener('pointerdown', onPointerDown);
    }, [isOpen]);

    useEffect(() => {
        if (!isOpen) setActiveKey(null);
    }, [isOpen]);

    const onKeyDown = useCallback((event) => {
        if (event.key === 'Escape') setOpen(false);
    }, []);

    const pick = useCallback((item) => {
        setOpen(false);
        onSelect?.(item);
    }, [onSelect]);

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
                    {items.length ? (
                        <>
                            <div className={style.rail}>
                                {groups.map((group) => (
                                    <div key={group.key} className={style.group} role="group" aria-label={group.title}>
                                        <span className={style.heading}>{group.title}</span>

                                        {group.items.map((item) => (
                                            <button
                                                key={item.key}
                                                type="button"
                                                role="menuitem"
                                                className={item.key === active?.key ? `${style.option} ${style.optionOn}` : style.option}
                                                onMouseEnter={() => setActiveKey(item.key)}
                                                onFocus={() => setActiveKey(item.key)}
                                                onClick={() => pick(item)}
                                            >
                                                <span className={style.optionIcon}>
                                                    <MenuIcon name={item.icon}/>
                                                </span>
                                                <span className={style.optionLabel}>{item.label}</span>
                                                {item.columns ? <ChevronIcon className={style.optionArrow}/> : null}
                                            </button>
                                        ))}
                                    </div>
                                ))}
                            </div>

                            <div className={style.panel}>
                                {active?.columns ? (
                                    <>
                                        <div className={style.columns}>
                                            {active.columns.map((column) => (
                                                <div key={column.key} className={style.column}>
                                                    <span className={style.columnTitle}>{column.title}</span>

                                                    {column.links.map((link) => (
                                                        <button
                                                            key={link.key}
                                                            type="button"
                                                            role="menuitem"
                                                            className={style.link}
                                                            onClick={() => pick(link)}
                                                        >
                                                            {link.label}
                                                        </button>
                                                    ))}
                                                </div>
                                            ))}
                                        </div>

                                        <button type="button" className={style.more} onClick={() => pick(active)}>
                                            Смотреть все
                                            <ChevronIcon className={style.moreArrow}/>
                                        </button>
                                    </>
                                ) : active ? (
                                    <div className={style.lone}>
                                        <span className={style.loneIcon}><MenuIcon name={active.icon}/></span>
                                        <span className={style.loneTitle}>{active.label}</span>
                                        {active.note ? <span className={style.loneNote}>{active.note}</span> : null}
                                        <button type="button" className={style.more} onClick={() => pick(active)}>
                                            Перейти
                                            <ChevronIcon className={style.moreArrow}/>
                                        </button>
                                    </div>
                                ) : null}
                            </div>
                        </>
                    ) : (
                        <span className={style.empty}>Раздел наполняется</span>
                    )}
                </div>
            ) : null}
        </div>
    );
}
