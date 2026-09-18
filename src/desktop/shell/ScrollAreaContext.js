import {createContext, useContext, useEffect, useLayoutEffect, useRef} from 'react';
import {recallView, rememberView} from '../../shared/lib/viewMemory';

export const ScrollAreaContext = createContext(null);

export function useScrollArea() {
    return useContext(ScrollAreaContext);
}

export function useScrollMemory(key, {ready = true} = {}) {
    const areaRef = useScrollArea();
    const restoredRef = useRef(null);

    useLayoutEffect(() => {
        const node = areaRef?.current;
        if (!node || !key || !ready || restoredRef.current === key) return;

        restoredRef.current = key;
        node.scrollTop = recallView(`shell:${key}`) || 0;
    }, [areaRef, key, ready]);

    useEffect(() => {
        const node = areaRef?.current;
        if (!node || !key) return undefined;

        const onScroll = () => rememberView(`shell:${key}`, node.scrollTop);

        node.addEventListener('scroll', onScroll, {passive: true});

        return () => node.removeEventListener('scroll', onScroll);
    }, [areaRef, key]);
}
