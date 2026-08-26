import {useEffect, useState} from 'react';
import {fetchOrderHistory} from '../../shared/api/account';

const isPendingToday = (order) => {
    if (order.type !== 'catalog' || order.status !== 'awaiting_payment') return false;
    if (!order.createdAt) return false;

    return new Date(order.createdAt).toDateString() === new Date().toDateString();
};

export function usePendingOrder(userId) {
    const [pending, setPending] = useState(null);

    useEffect(() => {
        if (!userId) return undefined;

        let isAlive = true;

        fetchOrderHistory(userId)
            .then((orders) => {
                if (!isAlive || !Array.isArray(orders)) return;
                setPending(orders.find(isPendingToday) || null);
            })
            .catch(() => undefined);

        return () => {
            isAlive = false;
        };
    }, [userId]);

    return pending;
}
