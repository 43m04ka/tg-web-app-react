import {useCallback, useState} from 'react';
import {invalidate, keyOf, setData} from './cache';
import {toast, toastFail} from './notify';

export function useMutation(action, options = {}) {
    const {invalidates = [], optimistic = null, done = '', onDone, onFail} = options;

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const run = useCallback(async (input) => {
        setLoading(true);
        setError(null);

        const rollbacks = [];

        if (optimistic) {
            optimistic(input, (key, updater) => {
                const cacheKey = keyOf(key);
                let previous;
                setData(cacheKey, (current) => {
                    previous = current;
                    return typeof updater === 'function' ? updater(current) : updater;
                });
                rollbacks.push(() => setData(cacheKey, previous));
            });
        }

        try {
            const result = await action(input);

            invalidates.forEach(invalidate);
            if (done) toast({tone: 'positive', title: done});
            if (onDone) onDone(result, input);

            return {ok: true, result};
        } catch (failure) {
            rollbacks.forEach((rollback) => rollback());
            setError(failure);

            if (onFail) onFail(failure, input);
            else toastFail(failure.message || 'Не получилось', failure.hint || '');

            return {ok: false, error: failure};
        } finally {
            setLoading(false);
        }
    }, [action, optimistic, done, onDone, onFail, invalidates]);

    return {run, loading, error};
}
