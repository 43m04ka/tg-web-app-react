import {useEffect} from 'react';
import {useLocation} from 'react-router-dom';
import {useSessionStore} from '../../store/useSessionStore';
import {useStructureStore} from '../../store/useStructureStore';
import {applyNeutralTheme, applyTheme} from '../../shared/lib/theme';

export function useDesktopAccent(scopeId) {
    const {pathname} = useLocation();
    const pageId = useSessionStore((state) => state.pageId);
    const startPages = useStructureStore((state) => state.startPages);

    const pageColor = startPages?.find((item) => item.structurePageId === pageId)?.color;
    const isSection = pathname === '/steam' || pathname === '/services';
    const isHome = scopeId === null && !isSection;

    useEffect(() => {
        if (isHome) applyNeutralTheme();
        else applyTheme(pageColor);
    }, [isHome, pageColor]);
}
