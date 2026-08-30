import {useEffect, useState} from 'react';
import {fetchSteamQuote} from '../../shared/api/steam';
import {isAmountValid} from './steamModel';

const DEBOUNCE_MS = 350;

const cache = new Map();

export function useSteamQuote(amount) {
    const value = Number(amount);
    const cached = isAmountValid(value) ? cache.get(value) || null : null;

    const [quote, setQuote] = useState(cached);
    const [isLoading, setLoading] = useState(false);
    const [error, setError] = useState('');

    useEffect(() => {
        if (!isAmountValid(value)) {
            setQuote(null);
            setError('');
            setLoading(false);
            return undefined;
        }

        const known = cache.get(value);
        if (known) {
            setQuote(known);
            setError('');
            setLoading(false);
            return undefined;
        }

        setQuote(null);
        setError('');
        setLoading(true);

        const controller = new AbortController();

        const timerId = setTimeout(() => {
            fetchSteamQuote(value, controller.signal)
                .then((result) => {
                    if (controller.signal.aborted) return;

                    if (!result.ok) {
                        setError(result.error || 'Не удалось рассчитать сумму');
                        return;
                    }

                    cache.set(value, result);
                    setQuote(result);
                })
                .catch(() => {
                    if (!controller.signal.aborted) setError('Не удалось рассчитать сумму');
                })
                .finally(() => {
                    if (!controller.signal.aborted) setLoading(false);
                });
        }, DEBOUNCE_MS);

        return () => {
            controller.abort();
            clearTimeout(timerId);
        };
    }, [value]);

    return {quote, isLoading, error};
}
