import {useCallback, useEffect, useRef, useState} from 'react';
import {checkPromo} from '../../shared/api/basket';
import {recallView, rememberView} from '../../shared/lib/viewMemory';

const PROMO_KEY = 'cart:promo';

const normalize = (value) =>
    value && typeof value === 'object' && value.name && Number(value.percent) > 0
        ? {name: value.name, percent: Number(value.percent)}
        : null;

export function usePromoMemory() {
    const [promo, setPromo] = useState(() => normalize(recallView(PROMO_KEY)));

    const checkedRef = useRef(new Set());

    useEffect(() => {
        rememberView(PROMO_KEY, promo);
    }, [promo]);

    useEffect(() => {
        if (!promo || checkedRef.current.has(promo.name)) return undefined;

        checkedRef.current.add(promo.name);

        let isAlive = true;

        checkPromo(promo.name)
            .then((result) => {
                if (!isAlive) return;

                const percent = Number(result?.percent);

                if (!result || Number(result.totalNumberUses) <= 0 || !(percent > 0)) setPromo(null);
                else if (percent !== promo.percent) setPromo({name: promo.name, percent});
            })
            .catch(() => undefined);

        return () => {
            isAlive = false;
        };
    }, [promo]);

    const apply = useCallback((next) => {
        const value = normalize(next);
        if (value) checkedRef.current.add(value.name);
        setPromo(value);
    }, []);

    const clear = useCallback(() => setPromo(null), []);

    return {promo, apply, clear};
}
