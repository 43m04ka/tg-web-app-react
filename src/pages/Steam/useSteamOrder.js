import {useCallback, useEffect, useRef, useState} from 'react';
import {createSteamOrder} from '../../shared/api/steam';
import {cancelOrderPayment, fetchOrderStatus} from '../../shared/api/order';
import {fetchOrderHistory} from '../../shared/api/account';
import {getTelegramObject} from '../../shared/lib/telegram';
import {isLoginError, isUserFacingError} from './steamModel';

const POLL_MS = 5000;
const POLL_TIMEOUT_MS = 15 * 60 * 1000;

export const SCREEN = {
    NONE: null,
    WAITING: 'waiting',
    CREDITING: 'crediting',
    DONE: 'done',
    FAIL: 'fail',
    STALLED: 'stalled'
};

const openPayment = (url) => {
    if (!url) return;

    const tg = getTelegramObject();
    if (typeof tg.openLink === 'function') tg.openLink(url);
    else window.open(url, '_blank', 'noopener');
};

const isPendingToday = (order) => {
    if (order.type !== 'steam_topup') return false;
    if (order.status !== 'awaiting_payment' && order.status !== 'paid') return false;
    if (!order.createdAt) return false;

    return new Date(order.createdAt).toDateString() === new Date().toDateString();
};

export function useSteamOrder(userId) {
    const [screen, setScreen] = useState(SCREEN.NONE);
    const [order, setOrder] = useState(null);
    const [isSending, setSending] = useState(false);
    const [error, setError] = useState('');
    const [loginError, setLoginError] = useState('');

    const timerRef = useRef(0);
    const startedAtRef = useRef(0);

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
        setError('');
    }, [stopPolling]);

    const watch = useCallback((watched, {openLink = true} = {}) => {
        stopPolling();

        if (openLink) openPayment(watched.paymentUrl);

        setOrder(watched);
        setScreen(watched.status === 'paid' ? SCREEN.CREDITING : SCREEN.WAITING);
        startedAtRef.current = Date.now();

        timerRef.current = window.setInterval(async () => {
            const next = await fetchOrderStatus(watched.orderId).catch(() => null);

            if (next) {
                setOrder((current) => ({...current, ...next, orderId: watched.orderId}));

                if (next.status === 'completed' && next.payoutStatus === 'success') {
                    stopPolling();
                    setScreen(SCREEN.DONE);
                    return;
                }

                if (next.status === 'payment_failed') {
                    stopPolling();
                    setScreen(SCREEN.FAIL);
                    return;
                }

                if (next.status === 'canceled') {
                    close();
                    return;
                }

                if (next.payoutStatus === 'error') {
                    stopPolling();
                    setScreen(SCREEN.STALLED);
                    return;
                }

                if (next.status === 'paid' || next.status === 'completed') {
                    setScreen(SCREEN.CREDITING);
                }
            }

            if (Date.now() - startedAtRef.current > POLL_TIMEOUT_MS) {
                stopPolling();
                setScreen(SCREEN.STALLED);
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

                watch({
                    orderId: pending.id,
                    status: pending.status,
                    total: pending.total,
                    topupAmount: pending.topupAmount,
                    steamLogin: pending.steamLogin || '',
                    paymentUrl: pending.paymentUrl || null
                }, {openLink: false});
            })
            .catch(() => undefined);

        return () => {
            isAlive = false;
        };
    }, [userId, watch]);

    const submit = useCallback(async (payload) => {
        if (isSending) return null;

        setSending(true);
        setError('');
        setLoginError('');

        try {
            const result = await createSteamOrder({...payload, userId});

            if (!result.ok) {
                const message = typeof result.error === 'string' ? result.error : '';

                if (isLoginError(message)) setLoginError(message);
                else if (isUserFacingError(message)) setError(message);
                else setError('Не удалось создать заказ. Попробуйте ещё раз.');

                return null;
            }

            watch({
                orderId: result.orderId,
                status: result.status,
                total: result.total,
                topupAmount: result.topupAmount,
                steamLogin: payload.steamLogin,
                paymentUrl: result.paymentUrl || null
            });

            return result;
        } catch (requestError) {
            setError(requestError.message || 'Не удалось создать заказ. Попробуйте ещё раз.');
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
            setOrder((current) => ({...current, status: result.status}));
            setScreen(SCREEN.CREDITING);
            return null;
        }

        return result.error || 'Не удалось отменить оплату';
    }, [close, order, userId]);

    const openAgain = useCallback(() => openPayment(order?.paymentUrl), [order]);

    const clearLoginError = useCallback(() => setLoginError(''), []);

    return {
        screen, order, isSending, error, loginError,
        submit, cancel, close, openAgain, clearLoginError
    };
}
