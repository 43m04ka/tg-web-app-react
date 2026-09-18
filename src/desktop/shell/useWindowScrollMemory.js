import {useEffect, useLayoutEffect, useRef} from 'react';
import {recallView, rememberView} from '../../shared/lib/viewMemory';

export function useWindowScrollMemory(key, {ready = true} = {}) {
    const restoredRef = useRef(null);

    useLayoutEffect(() => {
        if (!key || !ready || restoredRef.current === key) return;

        restoredRef.current = key;
        window.scrollTo(0, recallView(`window:${key}`) || 0);
    }, [key, ready]);

    useEffect(() => {
        if (!key) return undefined;

        const onScroll = () => rememberView(`window:${key}`, window.scrollY);

        window.addEventListener('scroll', onScroll, {passive: true});

        return () => window.removeEventListener('scroll', onScroll);
    }, [key]);
}
