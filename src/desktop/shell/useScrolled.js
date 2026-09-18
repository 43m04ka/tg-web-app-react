import {useEffect, useState} from 'react';
import {useScrollArea} from './ScrollAreaContext';

export function useScrolled(offset = 12) {
    const areaRef = useScrollArea();
    const [isScrolled, setScrolled] = useState(false);

    useEffect(() => {
        const node = areaRef?.current;
        if (!node) return undefined;

        const sync = () => setScrolled(node.scrollTop > offset);

        sync();
        node.addEventListener('scroll', sync, {passive: true});

        return () => node.removeEventListener('scroll', sync);
    }, [areaRef, offset]);

    return isScrolled;
}
