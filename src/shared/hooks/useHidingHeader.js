import {useEffect, useState} from 'react';

const HIDE_AFTER = 120;
const STEP = 6;

export function useHidingHeader(scrollRef, {enabled = true} = {}) {
    const [isHidden, setHidden] = useState(false);

    useEffect(() => {
        const node = scrollRef.current;

        if (!enabled || !node) {
            setHidden(false);
            return undefined;
        }

        let last = node.scrollTop;

        const onScroll = () => {
            const current = node.scrollTop;
            const delta = current - last;

            if (Math.abs(delta) < STEP) return;

            last = current;
            setHidden(current > HIDE_AFTER && delta > 0);
        };

        node.addEventListener('scroll', onScroll, {passive: true});

        return () => node.removeEventListener('scroll', onScroll);
    }, [scrollRef, enabled]);

    return isHidden;
}
