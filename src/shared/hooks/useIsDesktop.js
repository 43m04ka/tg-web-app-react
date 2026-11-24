import {useEffect} from 'react';
import {useIsDesktopMedia} from './useIsDesktopMedia';
import {usePlatform} from './usePlatform';
import {DESKTOP_MIN_WIDTH, forcedViewMode} from '../lib/viewMode';

const TG_DESKTOP_PLATFORMS = new Set(['tdesktop', 'macos', 'web', 'weba']);

const isTgDesktopClient = () => TG_DESKTOP_PLATFORMS.has(window.Telegram?.WebApp?.platform);

export function useIsDesktop() {
    const isWide = useIsDesktopMedia(DESKTOP_MIN_WIDTH);
    const {isTg, isVk} = usePlatform();

    const forced = forcedViewMode();
    const isDesktop = forced
        ? forced === 'desktop'
        : isWide && !isVk && (!isTg || isTgDesktopClient());

    useEffect(() => {
        document.documentElement.dataset.view = isDesktop ? 'desktop' : 'mobile';
    }, [isDesktop]);

    return isDesktop;
}
