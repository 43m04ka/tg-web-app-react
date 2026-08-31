import {useEffect, useRef, useState} from 'react';

const STEP = 12;

export function useInfiniteList(items, step = STEP) {
    const [limit, setLimit] = useState(step);

    const rootRef = useRef(null);
    const sentinelRef = useRef(null);

    const total = items?.length ?? 0;

    useEffect(() => {
        const sentinel = sentinelRef.current;
        if (!sentinel || limit >= total) return undefined;

        const observer = new IntersectionObserver(
            (entries) => {
                if (!entries.some((entry) => entry.isIntersecting)) return;
                setLimit((prev) => (prev >= total ? prev : Math.min(prev + step, total)));
            },
            {root: rootRef.current, rootMargin: '320px 0px'}
        );

        observer.observe(sentinel);
        return () => observer.disconnect();
    }, [limit, total, step]);

    return {
        visible: items ? items.slice(0, limit) : items,
        hasMore: limit < total,
        rootRef,
        sentinelRef
    };
}
