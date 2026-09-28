import React, {useCallback, useEffect, useState} from 'react';
import {subscribePaymentGate} from '../../lib/paymentNetwork';
import style from './VpnGate.module.scss';

const POLL_MS = 3000;

export default function VpnGate() {
    const [request, setRequest] = useState(null);
    const [checking, setChecking] = useState(false);

    useEffect(() => subscribePaymentGate(setRequest), []);

    const finish = useCallback((result) => {
        request?.resolve(result);
        setRequest(null);
        setChecking(false);
    }, [request]);

    const check = useCallback(async () => {
        if (!request) return;

        setChecking(true);
        const ok = await request.check();
        setChecking(false);

        if (ok) finish(true);
    }, [request, finish]);

    useEffect(() => {
        if (!request) return undefined;

        const timerId = setInterval(check, POLL_MS);
        return () => clearInterval(timerId);
    }, [request, check]);

    if (!request) return null;

    return (
        <div className={style.overlay} role="dialog" aria-modal="true">
            <div className={style.card}>
                <div className={style.badge}>🛡️</div>
                <h2 className={style.title}>Отключите VPN</h2>
                <p className={style.text}>
                    Платёжные системы принимают оплату только из российской сети.
                    Выключите VPN — оплата продолжится автоматически, приложение закрывать не нужно.
                </p>
                <span className={style.status}>{checking ? 'Проверяем подключение…' : 'Ждём отключения VPN'}</span>
                <button type="button" className={style.primary} onClick={check} disabled={checking}>
                    Я отключил VPN
                </button>
                <button type="button" className={style.secondary} onClick={() => finish(false)}>
                    Отмена
                </button>
            </div>
        </div>
    );
}
