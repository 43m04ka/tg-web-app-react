import {useLayoutEffect, useEffect, useRef} from 'react';
import {recallView, rememberView} from '../lib/viewMemory';

export function useScrollMemory(key, {ready = true} = {}) {
    const ref = useRef(null);
    const restoredRef = useRef(null);

    useLayoutEffect(() => {
        const node = ref.current;
        if (!node || !ready || !key || restoredRef.current === key) return;

        restoredRef.current = key;
        node.scrollTop = recallView(`scroll:${key}`) || 0;
    }, [key, ready]);

    useEffect(() => {
        const node = ref.current;
        if (!node || !key) return undefined;

        const onScroll = () => rememberView(`scroll:${key}`, node.scrollTop);

        node.addEventListener('scroll', onScroll, {passive: true});

        return () => node.removeEventListener('scroll', onScroll);
    }, [key]);

    return ref;
}
