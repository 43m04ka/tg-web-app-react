import {useEffect, useState} from 'react';

export function useIsDesktopMedia(breakpointPx = 768) {
    const [isDesktop, setIsDesktop] = useState(
        () => typeof window !== 'undefined' && window.matchMedia(`(min-width: ${breakpointPx}px)`).matches,
    );

    useEffect(() => {
        const mq = window.matchMedia(`(min-width: ${breakpointPx}px)`);
        const onChange = () => setIsDesktop(mq.matches);
        mq.addEventListener('change', onChange);
        return () => mq.removeEventListener('change', onChange);
    }, [breakpointPx]);

    return isDesktop;
}
