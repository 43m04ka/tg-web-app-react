import {useCallback, useEffect, useRef, useState} from 'react';
import {cancelOrderPayment, createOrder, fetchOrderStatus} from '../../shared/api/order';
import {fetchOrderHistory} from '../../shared/api/account';
import {openPaymentLink, paysInVkChat} from '../../shared/lib/paymentLink';
import {vkCommunityChatUrl} from '../../shared/lib/vk';

const POLL_MS = 5000;

export const SCREEN = {
    NONE: null,
    WAITING: 'waiting',
    ACCEPTED: 'accepted',
    SUCCESS: 'success',
    FAIL: 'fail'
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
    const [isPaymentOpen, setPaymentOpen] = useState(false);
    const [linkSent, setLinkSent] = useState(null);

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
        setPaymentOpen(false);
        setLinkSent(null);
    }, [stopPolling]);

    const watch = useCallback((orderId, paymentUrl, sent) => {
        stopPolling();

        const inChat = paysInVkChat();
        setPaymentOpen(paymentUrl && !inChat ? openPaymentLink(paymentUrl) : false);
        setLinkSent(inChat ? sent !== false : null);

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

            if (result.paymentUrl) watch(result.orderId, result.paymentUrl, result.paymentLinkSent);
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
        if (paysInVkChat()) {
            window.open(vkCommunityChatUrl(), '_blank');
            return;
        }

        if (openPaymentLink(order?.paymentUrl)) setPaymentOpen(true);
    }, [order]);

    const reject = useCallback((message) => setError(message), []);

    const paymentChannel = paysInVkChat() ? (linkSent === false ? 'vk_failed' : 'vk') : 'browser';

    return {screen, order, snapshot, status, isSending, error, isPaymentOpen, paymentChannel, submit, cancel, close, openAgain, reject};
}
