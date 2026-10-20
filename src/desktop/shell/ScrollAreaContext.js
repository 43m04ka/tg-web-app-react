import {createContext, useContext, useEffect, useLayoutEffect, useRef} from 'react';
import {useLocation, useNavigationType} from 'react-router-dom';
import {recallView, rememberView} from '../../shared/lib/viewMemory';

export const ScrollAreaContext = createContext(null);

export function useScrollArea() {
    return useContext(ScrollAreaContext);
}

export function useScrollMemory(key, {ready = true} = {}) {
    const areaRef = useScrollArea();
    const restoredRef = useRef(null);
    const {pathname} = useLocation();
    const navigationType = useNavigationType();
    const isReturnRef = useRef(navigationType === 'POP');
    const aliveRef = useRef(true);

    useLayoutEffect(() => {
        aliveRef.current = true;

        return () => {
            aliveRef.current = false;
        };
    }, []);

    useLayoutEffect(() => {
        const node = areaRef?.current;
        if (!node || !key || !ready || restoredRef.current === key) return;

        const isFirst = restoredRef.current === null;
        restoredRef.current = key;

        if (isFirst && !isReturnRef.current) return;

        node.scrollTop = recallView(`shell:${key}`) || 0;
        node.dataset.restored = pathname;
    }, [areaRef, key, ready, pathname]);

    useEffect(() => {
        const node = areaRef?.current;
        if (!node || !key) return undefined;

        const onScroll = () => {
            if (aliveRef.current) rememberView(`shell:${key}`, node.scrollTop);
        };

        node.addEventListener('scroll', onScroll, {passive: true});

        return () => node.removeEventListener('scroll', onScroll);
    }, [areaRef, key]);
}
