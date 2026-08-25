import {useEffect, useRef} from 'react';

export function useNearBottom({rootRef, enabled, onReach}) {
    const sentinelRef = useRef(null);
    const handlerRef = useRef(onReach);
    handlerRef.current = onReach;

    useEffect(() => {
        const sentinel = sentinelRef.current;
        if (!enabled || !sentinel) return undefined;

        const observer = new IntersectionObserver(
            (entries) => {
                if (entries.some((entry) => entry.isIntersecting)) handlerRef.current?.();
            },
            {root: rootRef?.current || null, rootMargin: '400px 0px'}
        );

        observer.observe(sentinel);
        return () => observer.disconnect();
    }, [enabled, rootRef]);

    return sentinelRef;
}
