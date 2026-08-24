import React, {useLayoutEffect, useRef, useState} from 'react';
import {hapticImpact} from '../../shared/lib/haptic';
import {descriptionLines} from './productView';
import style from './Product.module.scss';

const COLLAPSED_PX = 108;

export default function ProductDescription({description}) {
    const lines = descriptionLines(description);

    const textRef = useRef(null);
    const [fullHeight, setFullHeight] = useState(0);
    const [isOpen, setIsOpen] = useState(false);

    useLayoutEffect(() => {
        setIsOpen(false);
        setFullHeight(textRef.current?.scrollHeight || 0);
    }, [description]);

    if (lines.length === 0) return null;

    const isCollapsible = fullHeight > COLLAPSED_PX + 8;

    const toggle = () => {
        hapticImpact('light');
        setIsOpen((prev) => !prev);
    };

    return (
        <section className={style.section}>
            <h2 className={style.sectionTitle}>Описание</h2>

            <div
                className={`${style.description} ${isCollapsible && !isOpen ? style.descriptionFaded : ''}`}
                style={{maxHeight: !isCollapsible || isOpen ? `${fullHeight}px` : `${COLLAPSED_PX}px`}}
            >
                <div ref={textRef}>
                    {lines.map((line, index) => (
                        <p key={index} className={style.descriptionLine}>{line}</p>
                    ))}
                </div>
            </div>

            {isCollapsible ? (
                <button type="button" className={style.descriptionToggle} onClick={toggle}>
                    {isOpen ? 'свернуть' : 'читать полностью'}
                </button>
            ) : null}
        </section>
    );
}
