import {useCallback, useMemo} from 'react';
import {useSearchParams} from 'react-router-dom';

const isEmpty = (value) => value === undefined || value === null || value === '';

export function useCollectionState(defaults = {}) {
    const [params, setParams] = useSearchParams();

    const value = useMemo(() => {
        const result = {...defaults};

        Object.keys(defaults).forEach((key) => {
            const raw = params.get(key);
            if (raw === null) return;

            const fallback = defaults[key];
            if (typeof fallback === 'number') {
                const parsed = Number(raw);
                result[key] = Number.isFinite(parsed) ? parsed : fallback;
                return;
            }

            result[key] = raw;
        });

        return result;
    }, [params]);

    const patch = useCallback((next, {keepPage = false} = {}) => {
        setParams((current) => {
            const draft = new URLSearchParams(current);

            Object.entries(next).forEach(([key, item]) => {
                if (isEmpty(item) || item === defaults[key]) draft.delete(key);
                else draft.set(key, String(item));
            });

            if (!keepPage && !('page' in next) && 'page' in defaults) draft.delete('page');

            return draft;
        }, {replace: true});
    }, [setParams]);

    const reset = useCallback(() => {
        setParams(new URLSearchParams(), {replace: true});
    }, [setParams]);

    const dirty = useMemo(
        () => Object.keys(defaults).some((key) => key !== 'page' && value[key] !== defaults[key]),
        [value],
    );

    return {value, patch, reset, dirty};
}
