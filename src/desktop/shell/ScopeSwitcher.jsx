import React, {useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState} from 'react';
import {GridIcon} from './DesktopIcons';
import style from './ScopeSwitcher.module.scss';

export default function ScopeSwitcher({
    items,
    scopeId,
    onSelect,
    variant = 'panel',
    allLabel = 'Все витрины',
    total = null
}) {
    const trackRef = useRef(null);
    const nodesRef = useRef(new Map());
    const [box, setBox] = useState(null);

    const options = useMemo(
        () => [{id: null, label: allLabel, icon: null}, ...items],
        [items, allLabel]
    );

    const measure = useCallback(() => {
        const node = nodesRef.current.get(scopeId);

        if (!trackRef.current || !node) {
            setBox(null);
            return;
        }

        const next = {x: node.offsetLeft, w: node.offsetWidth};

        setBox((current) => (current && current.x === next.x && current.w === next.w ? current : next));
    }, [scopeId]);

    useLayoutEffect(() => {
        measure();
    }, [measure, options.length, total]);

    useEffect(() => {
        if (typeof ResizeObserver === 'undefined') return undefined;

        const observer = new ResizeObserver(() => measure());

        if (trackRef.current) observer.observe(trackRef.current);
        nodesRef.current.forEach((node) => observer.observe(node));

        return () => observer.disconnect();
    }, [measure, options.length]);

    if (!items.length) return null;

    return (
        <div
            className={`${style.track} ${style[variant]}`}
            role="tablist"
            aria-label="Витрина"
            ref={trackRef}
        >
            <span
                className={style.indicator}
                style={box ? {transform: `translateX(${box.x}px)`, width: `${box.w}px`} : undefined}
                data-on={box ? '' : undefined}
                aria-hidden="true"
            />

            {options.map((item, index) => {
                const isOn = item.id === scopeId;

                return (
                    <button
                        key={item.id === null ? 'all' : item.id}
                        type="button"
                        role="tab"
                        aria-selected={isOn}
                        aria-label={variant === 'compact' ? item.label : undefined}
                        title={variant === 'compact' ? item.label : undefined}
                        className={isOn ? `${style.tab} ${style.tabOn}` : style.tab}
                        style={{'--i': index}}
                        ref={(node) => {
                            if (node) nodesRef.current.set(item.id, node);
                            else nodesRef.current.delete(item.id);
                        }}
                        onClick={() => onSelect(item)}
                    >
                        <span className={style.icon}>
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

                        <span className={style.label}>{item.label}</span>

                        {isOn && total ? (
                            <span key={total} className={style.count}>{total.toLocaleString('ru-RU')}</span>
                        ) : null}
                    </button>
                );
            })}
        </div>
    );
}
