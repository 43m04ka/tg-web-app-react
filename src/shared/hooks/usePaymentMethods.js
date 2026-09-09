import {useEffect, useState} from 'react';
import {fetchPaymentMethods} from '../api/payments';
import {findMethod, isMethodAvailable, normalizeMethods} from '../../pages/Basket/cartModel';

export function usePaymentMethods({platform, scenario, pageId, pageType, total = 0}) {
    const [methods, setMethods] = useState(() => normalizeMethods(null));
    const [method, setMethod] = useState('sbp');

    useEffect(() => {
        const controller = new AbortController();

        fetchPaymentMethods({platform, scenario, pageId, pageType}, controller.signal)
            .then((list) => {
                if (!controller.signal.aborted) setMethods(normalizeMethods(list));
            })
            .catch(() => undefined);

        return () => controller.abort();
    }, [platform, scenario, pageId, pageType]);

    useEffect(() => {
        const current = findMethod(methods, method);
        const usable = total <= 0 || isMethodAvailable(current, total);

        if (current.key !== method || !usable) {
            const next = methods.find((option) => isMethodAvailable(option, total)) || methods[0];
            if (next && next.key !== method) setMethod(next.key);
        }
    }, [method, methods, total]);

    const selected = findMethod(methods, method);

    return {
        methods,
        method,
        setMethod,
        selected,
        needsEmail: selected.requiresEmail,
        isOnline: selected.flow === 'auto',
        hasChoice: methods.length > 1
    };
}
