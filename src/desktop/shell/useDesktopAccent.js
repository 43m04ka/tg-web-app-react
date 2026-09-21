import {useEffect} from 'react';
import {useLocation} from 'react-router-dom';
import {useSessionStore} from '../../store/useSessionStore';
import {useStructureStore} from '../../store/useStructureStore';
import {applyTheme} from '../../shared/lib/theme';

const HOME_ACCENT = '#17bfae';

export function useDesktopAccent(scopeId) {
    const {pathname} = useLocation();
    const pageId = useSessionStore((state) => state.pageId);
    const startPages = useStructureStore((state) => state.startPages);

    const pageColor = startPages?.find((item) => item.structurePageId === pageId)?.color;
    const isSection = pathname === '/steam' || pathname === '/services';
    const color = scopeId === null && !isSection ? HOME_ACCENT : pageColor;

    useEffect(() => {
        applyTheme(color);
    }, [color]);
}
