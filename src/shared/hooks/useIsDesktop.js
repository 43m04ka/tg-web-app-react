import {useEffect} from 'react';
import {useIsDesktopMedia} from './useIsDesktopMedia';
import {usePlatform} from './usePlatform';
import {DESKTOP_MIN_WIDTH, forcedViewMode} from '../lib/viewMode';

export function useIsDesktop() {
    const isWide = useIsDesktopMedia(DESKTOP_MIN_WIDTH);
    const {isTg, isVk} = usePlatform();

    const forced = forcedViewMode();
    const isDesktop = forced ? forced === 'desktop' : isWide && !isTg && !isVk;

    useEffect(() => {
        document.documentElement.dataset.view = isDesktop ? 'desktop' : 'mobile';
    }, [isDesktop]);

    return isDesktop;
}
