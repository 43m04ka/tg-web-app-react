import React, {useEffect, useRef} from 'react';
import {useScrollArea} from './ScrollAreaContext';

const isSupported = () => typeof window !== 'undefined' && typeof window.IntersectionObserver === 'function';

export function useReveal({once = true, margin = '0px 0px -8% 0px', threshold = 0.05} = {}) {
    const areaRef = useScrollArea();
    const nodeRef = useRef(null);

    useEffect(() => {
        const node = nodeRef.current;
        if (!node) return undefined;

        if (!isSupported()) {
            node.dataset.reveal = 'in';
            return undefined;
        }

        const observer = new IntersectionObserver((entries) => {
            entries.forEach((entry) => {
                if (entry.isIntersecting) {
                    entry.target.dataset.reveal = 'in';
                    if (once) observer.unobserve(entry.target);
                } else if (!once) {
                    entry.target.dataset.reveal = 'out';
                }
            });
        }, {root: areaRef?.current || null, rootMargin: margin, threshold});

        observer.observe(node);

        return () => observer.disconnect();
    }, [areaRef, once, margin, threshold]);

    return nodeRef;
}

export function Reveal({as: Tag = 'div', delay = 0, className, children, ...rest}) {
    const ref = useReveal();

    return (
        <Tag
            ref={ref}
            className={className}
            data-reveal="out"
            style={delay ? {'--reveal-delay': `${delay}ms`} : undefined}
            {...rest}
        >
            {children}
        </Tag>
    );
}
