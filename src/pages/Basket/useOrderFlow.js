import {useCallback, useEffect, useRef, useState} from 'react';
import {cancelOrderPayment, createOrder, fetchOrderStatus} from '../../shared/api/order';
import {fetchOrderHistory} from '../../shared/api/account';
import {getTelegramObject} from '../../shared/lib/telegram';

const POLL_MS = 5000;

export const SCREEN = {
    NONE: null,
    WAITING: 'waiting',
    ACCEPTED: 'accepted',
    SUCCESS: 'success',
    FAIL: 'fail'
};

const openPayment = (url) => {
    const tg = getTelegramObject();

    if (typeof tg.openLink === 'function') tg.openLink(url);
    else window.open(url, '_blank', 'noopener');
};

const isPendingToday = (order) => {
    if (order.type !== 'catalog' || order.status !== 'awaiting_payment') return false;
    if (!order.createdAt) return false;

    return new Date(order.createdAt).toDateString() === new Date().toDateString();
};

export function useOrderFlow(userId) {
    const [screen, setScreen] = useState(SCREEN.NONE);
    const [order, setOrder] = useState(null);
    const [snapshot, setSnapshot] = useState(null);
    const [status, setStatus] = useState(null);
    const [isSending, setSending] = useState(false);
    const [error, setError] = useState('');

    const timerRef = useRef(0);

    const stopPolling = useCallback(() => {
        if (!timerRef.current) return;
        clearInterval(timerRef.current);
        timerRef.current = 0;
    }, []);

    useEffect(() => stopPolling, [stopPolling]);

    const close = useCallback(() => {
        stopPolling();
        setScreen(SCREEN.NONE);
        setOrder(null);
        setSnapshot(null);
        setStatus(null);
        setError('');
    }, [stopPolling]);

    const watch = useCallback((orderId, paymentUrl) => {
        stopPolling();

        if (paymentUrl) openPayment(paymentUrl);

        setScreen(SCREEN.WAITING);

        timerRef.current = window.setInterval(async () => {
            const next = await fetchOrderStatus(orderId).catch(() => null);
            if (!next) return;

            setStatus(next);

            if (next.status === 'paid' || next.status === 'completed') {
                stopPolling();
                setScreen(SCREEN.SUCCESS);
            } else if (next.status === 'payment_failed') {
                stopPolling();
                setScreen(SCREEN.FAIL);
            } else if (next.status === 'canceled') {
                close();
            }
        }, POLL_MS);
    }, [close, stopPolling]);

    useEffect(() => {
        if (!userId) return undefined;

        let isAlive = true;

        fetchOrderHistory(userId)
            .then((orders) => {
                if (!isAlive || !Array.isArray(orders)) return;

                const pending = orders.find(isPendingToday);
                if (!pending) return;

                setOrder({
                    orderId: pending.id,
                    status: pending.status,
                    paymentMethod: pending.paymentMethod,
                    total: pending.total,
                    paymentUrl: pending.paymentUrl || null
                });

                watch(pending.id, null);
            })
            .catch(() => undefined);

        return () => {
            isAlive = false;
        };
    }, [userId, watch]);

    const submit = useCallback(async (payload, snapshotData) => {
        if (isSending) return null;

        setSending(true);
        setError('');

        try {
            const result = await createOrder({...payload, userId});

            if (!result.ok) {
                setError(result.error || 'Не удалось оформить заказ. Попробуйте ещё раз.');
                return null;
            }

            setOrder(result);
            setSnapshot({...snapshotData, orderId: result.orderId, total: result.total});

            if (result.paymentUrl) watch(result.orderId, result.paymentUrl);
            else setScreen(SCREEN.ACCEPTED);

            return result;
        } catch (requestError) {
            setError(requestError.message || 'Не удалось оформить заказ. Попробуйте ещё раз.');
            return null;
        } finally {
            setSending(false);
        }
    }, [isSending, userId, watch]);

    const cancel = useCallback(async () => {
        const orderId = order?.orderId;
        if (!orderId) return null;

        const result = await cancelOrderPayment(orderId, userId);

        if (result.ok) {
            close();
            return null;
        }

        if (result.httpStatus === 409 && (result.status === 'paid' || result.status === 'completed')) {
            stopPolling();
            setStatus({status: result.status});
            setScreen(SCREEN.SUCCESS);
            return null;
        }

        return result.error || 'Не удалось отменить оплату';
    }, [close, order, stopPolling, userId]);

    const openAgain = useCallback(() => {
        if (order?.paymentUrl) openPayment(order.paymentUrl);
    }, [order]);

    return {screen, order, snapshot, status, isSending, error, submit, cancel, close, openAgain};
}
