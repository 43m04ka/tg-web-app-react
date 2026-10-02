import React, {useEffect, useState} from 'react';
import {IS_TUNNEL_HOST} from '../../config/env';
import {getNetwork, isVpnSuspected, subscribeNetwork, watchPaymentNetwork} from '../../lib/paymentNetwork';
import style from './VpnGate.module.scss';

export function usePaymentNetwork(isEnabled = true) {
    const isRequired = isEnabled && IS_TUNNEL_HOST;
    const [network, setNetwork] = useState(getNetwork);

    useEffect(() => {
        if (!isRequired) return undefined;

        const unsubscribe = subscribeNetwork(setNetwork);
        const stopWatch = watchPaymentNetwork();
        setNetwork(getNetwork());

        return () => {
            unsubscribe();
            stopWatch();
        };
    }, [isRequired]);

    return {isVisible: isRequired && isVpnSuspected(network)};
}

function ShieldIcon() {
    return (
        <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
            <path d="M12 3l7 3v5.5c0 4.3-2.9 8-7 9.5-4.1-1.5-7-5.2-7-9.5V6l7-3z" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round"/>
            <path d="M12 8.5v4.5" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
            <circle cx="12" cy="16" r="1.2" fill="currentColor"/>
        </svg>
    );
}

export default function VpnGate({network, className = ''}) {
    if (!network?.isVisible) return null;

    return (
        <div className={`${style.gate} ${className}`} role="status" aria-live="polite">
            <span className={style.icon}>
                <ShieldIcon/>
            </span>

            <span className={style.body}>
                <span className={style.title}>Похоже, у вас включён VPN</span>
                <span className={style.text}>
                    С VPN оплата может не пройти. Советуем отключить его перед оплатой
                </span>
            </span>
        </div>
    );
}
