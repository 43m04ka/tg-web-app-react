import {useCallback, useEffect, useRef, useState} from 'react';
import {useSessionStore, selectUserId} from '../../store/useSessionStore';

export function useAccountList(load) {
    const userId = useSessionStore(selectUserId);
    const syncFailed = useSessionStore((state) => state.syncFailed);

    const [items, setItems] = useState(null);
    const [error, setError] = useState(null);

    const loadRef = useRef(load);
    loadRef.current = load;

    const [reloadToken, setReloadToken] = useState(0);

    const reload = useCallback(() => {
        useSessionStore.getState().resync();
        setReloadToken((token) => token + 1);
    }, []);

    useEffect(() => {
        if (!userId) {
            if (!syncFailed) {
                setItems(null);
                setError(null);
                return undefined;
            }

            setError(new Error('Пользователь не определён'));
            setItems([]);
            return undefined;
        }

        const controller = new AbortController();
        setError(null);

        loadRef.current(userId, controller.signal)
            .then((result) => {
                if (controller.signal.aborted) return;
                setItems(Array.isArray(result) ? result : []);
            })
            .catch((loadError) => {
                if (controller.signal.aborted) return;
                console.error('[account]', loadError.message);
                setError(loadError);
                setItems([]);
            });

        return () => controller.abort();
    }, [userId, syncFailed, reloadToken]);

    return {items, error, reload, userId, setItems};
}
