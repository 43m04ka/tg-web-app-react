import React, {useEffect, useState} from 'react';
import {IS_TUNNEL_HOST} from '../../config/env';
import {
    getNetworkState,
    NET,
    subscribeNetwork,
    wasForeignSeen,
    watchPaymentNetwork
} from '../../lib/paymentNetwork';
import style from './VpnGate.module.scss';

export function usePaymentNetwork(isEnabled = true) {
    const isRequired = isEnabled && IS_TUNNEL_HOST;
    const [state, setState] = useState(getNetworkState);

    useEffect(() => {
        if (!isRequired) return undefined;

        const unsubscribe = subscribeNetwork(setState);
        const stopWatch = watchPaymentNetwork();
        setState(getNetworkState());

        return () => {
            unsubscribe();
            stopWatch();
        };
    }, [isRequired]);

    return {
        state,
        isReady: !isRequired || state === NET.RU,
        isVisible: isRequired && (state === NET.FOREIGN || (state === NET.RU && wasForeignSeen()))
    };
}

function ShieldIcon() {
    return (
        <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
            <path d="M12 3l7 3v5.5c0 4.3-2.9 8-7 9.5-4.1-1.5-7-5.2-7-9.5V6l7-3z" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round"/>
            <path d="M9.5 9.5l5 5M14.5 9.5l-5 5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/>
        </svg>
    );
}

function CheckIcon() {
    return (
        <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
            <path d="M6 12.5l4 4 8-9" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
    );
}

export default function VpnGate({network, className = ''}) {
    if (!network?.isVisible) return null;

    const isOk = network.state === NET.RU;

    return (
        <div className={`${style.gate} ${isOk ? style.gateOk : ''} ${className}`} role="status" aria-live="polite">
            <span key={isOk ? 'ok' : 'wait'} className={style.icon}>
                {isOk ? <CheckIcon/> : <ShieldIcon/>}
            </span>

            <span className={style.body}>
                <span className={style.title}>{isOk ? 'VPN отключён' : 'Отключите VPN для оплаты'}</span>
                <span className={style.text}>
                    {isOk
                        ? 'Можно оплачивать. Не включайте VPN до конца оплаты'
                        : 'Платёжные системы принимают оплату только из российской сети. Кнопка оплаты станет активной сама'}
                </span>
            </span>

            {isOk ? null : <span className={style.pulse} aria-hidden="true"/>}
        </div>
    );
}
