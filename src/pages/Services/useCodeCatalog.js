import {useCallback, useEffect, useMemo, useState} from 'react';
import {fetchCodeCatalog} from '../../shared/api/codes';
import {useStructureStore} from '../../store/useStructureStore';
import {usePlatform} from '../../shared/hooks/usePlatform';
import {filterServiceCatalog} from '../../shared/lib/storefrontMaintenance';

let cached = null;

export function useCodeCatalog() {
    const catalogs = useStructureStore((s) => s.catalogs);
    const {botType} = usePlatform();
    const [brands, setBrands] = useState(cached);
    const [error, setError] = useState(false);
    const [token, setToken] = useState(0);

    useEffect(() => {
        let isAlive = true;
        const controller = new AbortController();

        fetchCodeCatalog(controller.signal, botType)
            .then((result) => {
                if (!isAlive) return;

                const list = Array.isArray(result) ? result : [];
                cached = list;
                setBrands(list);
                setError(false);
            })
            .catch(() => {
                if (isAlive) setError(true);
            });

        return () => {
            isAlive = false;
            controller.abort();
        };
    }, [token, botType]);

    const retry = useCallback(() => {
        setError(false);
        setToken((value) => value + 1);
    }, []);

    const visibleBrands = useMemo(() => filterServiceCatalog(brands, catalogs), [brands, catalogs]);
    return {brands: visibleBrands, error, retry};
}
