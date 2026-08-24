import React, {useLayoutEffect, useRef, useState} from 'react';
import {hapticImpact} from '../../shared/lib/haptic';
import style from './Product.module.scss';

const VISIBLE_LIMIT = 3;

export default function ProductChips({chips}) {
    const [isOpen, setIsOpen] = useState(false);
    const [height, setHeight] = useState(null);

    const innerRef = useRef(null);

    useLayoutEffect(() => {
        setIsOpen(false);
    }, [chips.length]);

    useLayoutEffect(() => {
        setHeight(innerRef.current?.scrollHeight || 0);
    }, [isOpen, chips]);

    if (chips.length === 0) return null;

    const isCollapsible = chips.length > VISIBLE_LIMIT + 1;
    const visible = isCollapsible && !isOpen ? chips.slice(0, VISIBLE_LIMIT) : chips;

    const toggle = () => {
        hapticImpact('light');
        setIsOpen((prev) => !prev);
    };

    return (
        <div className={style.chipsBox} style={height === null ? undefined : {height: `${height}px`}}>
            <div className={style.chips} ref={innerRef}>
                {visible.map((chip, index) => (
                    <span key={`${chip}-${index}`} className={style.chip}>{chip}</span>
                ))}

                {isCollapsible ? (
                    <button type="button" className={`${style.chip} ${style.chipToggle}`} onClick={toggle}>
                        {isOpen ? 'Свернуть' : `Ещё ${chips.length - VISIBLE_LIMIT}`}
                        <span className={`${style.chipChevron} ${isOpen ? style.chipChevronUp : ''}`}
                              aria-hidden="true">
                            ⌄
                        </span>
                    </button>
                ) : null}
            </div>
        </div>
    );
}
