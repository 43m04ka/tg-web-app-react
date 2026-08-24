import {useEffect, useState} from 'react';
import {selectUserId, useSessionStore} from '../../store/useSessionStore';
import {fetchFavorites, fetchOrderHistory} from '../../shared/api/account';

const EMPTY = {orders: null, favorites: null, isLoading: true};
const FAILED = {orders: null, favorites: null, isLoading: false};

const cache = new Map();

const listOrNull = (value) => (Array.isArray(value) ? value : null);

export function useProfileSummary() {
    const userId = useSessionStore(selectUserId);
    const syncFailed = useSessionStore((state) => state.syncFailed);

    const [summary, setSummary] = useState(() => cache.get(userId) || EMPTY);

    useEffect(() => {
        if (!userId) {
            setSummary(syncFailed ? FAILED : EMPTY);
            return undefined;
        }

        setSummary(cache.get(userId) || EMPTY);

        const controller = new AbortController();

        Promise.all([
            fetchOrderHistory(userId, controller.signal).catch(() => null),
            fetchFavorites(userId, controller.signal).catch(() => null)
        ]).then(([orders, favorites]) => {
            if (controller.signal.aborted) return;

            const next = {
                orders: listOrNull(orders),
                favorites: listOrNull(favorites),
                isLoading: false
            };

            cache.set(userId, next);
            setSummary(next);
        });

        return () => controller.abort();
    }, [userId, syncFailed]);

    return summary;
}
