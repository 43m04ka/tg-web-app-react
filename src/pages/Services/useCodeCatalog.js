import {useCallback, useEffect, useState} from 'react';
import {fetchCodeCatalog} from '../../shared/api/codes';

let cached = null;

export function useCodeCatalog() {
    const [brands, setBrands] = useState(cached);
    const [error, setError] = useState(false);
    const [token, setToken] = useState(0);

    useEffect(() => {
        let isAlive = true;
        const controller = new AbortController();

        fetchCodeCatalog(controller.signal)
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
    }, [token]);

    const retry = useCallback(() => {
        setError(false);
        setToken((value) => value + 1);
    }, []);

    return {brands, error, retry};
}
