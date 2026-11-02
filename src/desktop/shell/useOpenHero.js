import {useCallback} from 'react';
import {useNavigate} from 'react-router-dom';
import {useSessionStore} from '../../store/useSessionStore';
import {useStructureStore} from '../../store/useStructureStore';
import {productRoute} from '../../shared/lib/pageRoutes';
import {useStorefrontScope} from './StorefrontScope';

export function useOpenHero() {
    const navigate = useNavigate();
    const catalogs = useStructureStore((store) => store.catalogs);
    const setPageId = useSessionStore((store) => store.setPageId);
    const {setScopeId} = useStorefrontScope();

    return useCallback((item) => {
        if (item.productId === null || item.productId === undefined || item.productId === '') {
            if (item.url.startsWith('/')) {
                if (item.pageId !== null && item.pageId !== undefined) setPageId(item.pageId);
                navigate(item.url);
            } else if (item.url) {
                window.open(item.url, '_blank', 'noopener');
            }
            return;
        }

        if (item.origin) {
            setPageId(item.origin.pageId);
            setScopeId(item.origin.pageId);
        }

        const route = item.product ? productRoute(item.product, catalogs) : null;
        navigate(route || `/card/${item.productId}`);
    }, [catalogs, navigate, setPageId, setScopeId]);
}
