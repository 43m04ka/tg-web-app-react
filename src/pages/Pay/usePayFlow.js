import {useCallback, useEffect, useRef, useState} from 'react';
import {createFreePayment, fetchFreePaymentStatus} from '../../shared/api/freePayment';
import {getWebApp} from '../../shared/lib/telegram';
import {readPending, writePending} from './payModel';

const POLL_MS = 4000;

export const SCREEN = {
    NONE: null,
    WAITING: 'waiting',
    DONE: 'done',
    FAIL: 'fail'
};

const screenOf = (status) => {
    if (status === 'paid') return SCREEN.DONE;
    if (status === 'payment_failed') return SCREEN.FAIL;

    return SCREEN.WAITING;
};

const openPayment = (url) => {
    if (!url) return;

    const tg = getWebApp();
    if (tg && typeof tg.openLink === 'function') tg.openLink(url);
    else window.location.assign(url);
};

export function usePayFlow() {
    const [screen, setScreen] = useState(SCREEN.NONE);
    const [payment, setPayment] = useState(null);
    const [isSending, setSending] = useState(false);
    const [error, setError] = useState('');

    const timerRef = useRef(0);

    const stopPolling = useCallback(() => {
        if (!timerRef.current) return;
        clearInterval(timerRef.current);
        timerRef.current = 0;
    }, []);

    useEffect(() => stopPolling, [stopPolling]);

    const apply = useCallback((next) => {
        setPayment((current) => ({...current, ...next}));

        const nextScreen = screenOf(next.status);
        setScreen(nextScreen);

        if (nextScreen !== SCREEN.WAITING) {
            stopPolling();
            writePending(null);
        }
    }, [stopPolling]);

    const watch = useCallback((watched) => {
        stopPolling();
        setPayment(watched);
        setScreen(screenOf(watched.status));

        if (screenOf(watched.status) !== SCREEN.WAITING) return;

        const check = async () => {
            const next = await fetchFreePaymentStatus(watched.id).catch(() => null);
            if (next) apply(next);
        };

        check();
        timerRef.current = window.setInterval(check, POLL_MS);
    }, [apply, stopPolling]);

    useEffect(() => {
        const pending = readPending();
        if (pending?.id) watch({...pending, status: 'awaiting_payment'});
    }, [watch]);

    const submit = useCallback(async ({email, amount}) => {
        if (isSending) return;

        setSending(true);
        setError('');

        try {
            const result = await createFreePayment({email, amount});

            if (!result.ok || !result.paymentUrl) {
                setError(typeof result.error === 'string' && result.httpStatus < 500
                    ? result.error
                    : 'Не удалось перейти к оплате. Попробуйте ещё раз.');
                return;
            }

            const created = {id: result.id, amount: result.amount, email, paymentUrl: result.paymentUrl, status: result.status};

            writePending(created);
            watch(created);
            openPayment(created.paymentUrl);
        } catch (requestError) {
            setError('Нет связи с сервером. Попробуйте ещё раз.');
        } finally {
            setSending(false);
        }
    }, [isSending, watch]);

    const close = useCallback(() => {
        stopPolling();
        writePending(null);
        setScreen(SCREEN.NONE);
        setPayment(null);
        setError('');
    }, [stopPolling]);

    const openAgain = useCallback(() => openPayment(payment?.paymentUrl), [payment]);

    return {screen, payment, isSending, error, submit, close, openAgain};
}
