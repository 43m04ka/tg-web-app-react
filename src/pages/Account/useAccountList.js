import {useCallback, useEffect, useRef, useState} from 'react';
import {useSessionStore, selectUserId} from '../../store/useSessionStore';

// Общая механика для истории заказов и избранного: оба экрана — это список,
// который ждёт userId, умеет перезагружаться и различает «пусто» и «не смогли».
export function useAccountList(load) {
    const userId = useSessionStore(selectUserId);

    const [items, setItems] = useState(null);
    const [error, setError] = useState(null);

    const loadRef = useRef(load);
    loadRef.current = load;

    const [reloadToken, setReloadToken] = useState(0);
    const reload = useCallback(() => setReloadToken((token) => token + 1), []);

    useEffect(() => {
        if (!userId) return undefined;

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
    }, [userId, reloadToken]);

    return {items, error, reload, userId, setItems};
}
