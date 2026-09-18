import {useCallback} from 'react';
import {useNavigate} from 'react-router-dom';
import {useSessionStore} from '../../store/useSessionStore';
import {useStructureStore} from '../../store/useStructureStore';
import {productRoute} from '../../shared/lib/pageRoutes';

export function useOpenHero() {
    const navigate = useNavigate();
    const catalogs = useStructureStore((store) => store.catalogs);
    const setPageId = useSessionStore((store) => store.setPageId);

    return useCallback((item) => {
        if (item.productId === null || item.productId === undefined || item.productId === '') {
            if (item.url) window.open(item.url, '_blank', 'noopener');
            return;
        }

        if (item.origin) setPageId(item.origin.pageId);

        const route = item.product ? productRoute(item.product, catalogs) : null;
        navigate(route || `/card/${item.productId}`);
    }, [catalogs, navigate, setPageId]);
}
