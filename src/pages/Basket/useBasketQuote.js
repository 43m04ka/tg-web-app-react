import {useCallback, useEffect, useState} from 'react';
import {fetchBasketQuote} from '../../shared/api/basket';

const EMPTY = {
    quote: null,
    isLoading: false,
    error: false
};

export function useBasketQuote({userId, pageId, promoCode, revision}) {
    const [state, setState] = useState(EMPTY);
    const [attempt, setAttempt] = useState(0);

    useEffect(() => {
        if (!userId || !pageId) {
            setState(EMPTY);
            return undefined;
        }

        const controller = new AbortController();

        setState((prev) => ({...prev, isLoading: true, error: false}));

        fetchBasketQuote({userId, pageId, promoCode}, controller.signal)
            .then((quote) => setState({quote, isLoading: false, error: false}))
            .catch(() => {
                if (controller.signal.aborted) return;
                setState((prev) => ({...prev, isLoading: false, error: true}));
            });

        return () => controller.abort();
    }, [userId, pageId, promoCode, revision, attempt]);

    const retry = useCallback(() => setAttempt((value) => value + 1), []);

    return {...state, retry};
}
