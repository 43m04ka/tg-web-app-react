import {useEffect, useRef} from 'react';
import {useLocation, useNavigate} from 'react-router-dom';
import {getStartParam} from '../shared/lib/telegram';
import {useSessionStore} from '../store/useSessionStore';
import {useStructureStore} from '../store/useStructureStore';
import {standaloneRoute} from '../shared/lib/pageRoutes';

const CATALOG_PREFIX = 'catalog_';

export function useDeepLink(isReady) {
    const navigate = useNavigate();
    const {pathname} = useLocation();

    const pageId = useSessionStore((state) => state.pageId);
    const setPageId = useSessionStore((state) => state.setPageId);
    const pages = useStructureStore((state) => state.pages);
    const catalogs = useStructureStore((state) => state.catalogs);

    const isHandledRef = useRef(false);

    useEffect(() => {
        if (isHandledRef.current) return;
        if (!isReady || pathname !== '/') return;

        const param = getStartParam();
        if (param === null || param === '') return;

        if (param.startsWith(CATALOG_PREFIX)) {
            if (!Array.isArray(catalogs)) return;

            const path = param.slice(CATALOG_PREFIX.length);
            const catalog = catalogs.find((item) => item.path === path);
            if (!catalog) {
                isHandledRef.current = true;
                return;
            }

            isHandledRef.current = true;
            setPageId(catalog.structurePageId);
            navigate(`/catalog/${path}`, {replace: true, state: {skipLeave: true}});
            return;
        }

        if (!Array.isArray(pages) || pages.length === 0) return;

        const fallbackPage = pages.find((item) => !standaloneRoute(item.type));
        const targetPageId = pageId === null ? fallbackPage?.id : pageId;
        if (targetPageId === undefined || targetPageId === null) {
            isHandledRef.current = true;
            return;
        }

        isHandledRef.current = true;
        if (pageId === null) setPageId(targetPageId);
        navigate(`/card/${param}`, {replace: true, state: {skipLeave: true}});
    }, [isReady, pathname, pages, catalogs, pageId, setPageId, navigate]);
}
