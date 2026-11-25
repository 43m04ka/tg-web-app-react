import {useCallback, useState} from 'react';
import {useNavigate} from 'react-router-dom';
import {useSessionStore} from '../../store/useSessionStore';
import {useStructureStore} from '../../store/useStructureStore';
import {productRoute} from '../../shared/lib/pageRoutes';
import {useStorefrontScope} from './StorefrontScope';

export function useOfferPicker({originOf} = {}) {
    const navigate = useNavigate();
    const catalogs = useStructureStore((store) => store.catalogs);
    const setPageId = useSessionStore((store) => store.setPageId);
    const {setScopeId} = useStorefrontScope();

    const [picked, setPicked] = useState(null);

    const goToProduct = useCallback((product, origin) => {
        if (origin) {
            setPageId(origin.pageId);
            setScopeId(origin.pageId);
        }
        navigate(productRoute(product, catalogs) || `/card/${product.id}`);
    }, [catalogs, navigate, setPageId, setScopeId]);

    const open = useCallback((offer) => {
        if (offer.origins.length > 1) {
            setPicked(offer);
            return;
        }

        goToProduct(offer.product, offer.origins[0] || originOf?.(offer.product) || null);
    }, [goToProduct, originOf]);

    const pick = useCallback((origin) => {
        setPicked(null);
        goToProduct(origin.product || picked?.product, origin);
    }, [goToProduct, picked]);

    const close = useCallback(() => setPicked(null), []);

    return {picked, open, pick, close};
}
