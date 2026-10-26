import React, {useCallback, useState} from 'react';
import {useSessionStore} from '../../../store/useSessionStore';
import {logout} from '../../api/auth';
import {setAuthToken} from '../../lib/authToken';
import {authenticate} from '../../lib/authenticate';
import {isTelegramWebApp} from '../../lib/loginContext';
import {isVk} from '../../lib/platform';
import style from './AccountCard.module.scss';

const methodsOf = (account) => [
    {key: 'tg', label: 'Telegram', value: account?.telegram ? 'привязан' : null},
    {key: 'email', label: 'Почта', value: account?.email || null},
    ...(account?.vk ? [{key: 'vk', label: 'ВКонтакте', value: 'привязан'}] : [])
];

export default function AccountCard({className = ''}) {
    const account = useSessionStore((state) => state.account);
    const openLogin = useSessionStore((state) => state.openLogin);
    const setAccount = useSessionStore((state) => state.setAccount);
    const [isBusy, setBusy] = useState(false);

    const canLogout = !isTelegramWebApp() && !isVk();

    const leave = useCallback(async () => {
        if (isBusy) return;
        setBusy(true);
        await logout().catch(() => null);
        setAuthToken(null);
        const next = await authenticate().catch(() => null);
        if (next) setAccount(next);
        setBusy(false);
    }, [isBusy, setAccount]);

    if (!account) return null;

    if (account.kind !== 'user') {
        return (
            <div className={`${style.card} ${className}`}>
                <div className={style.head}>
                    <span className={style.title}>Вы не вошли</span>
                    <span className={style.text}>Войдите через Telegram или почту, чтобы оформлять заказы и видеть их на любом устройстве</span>
                </div>
                <button type="button" className={style.primary} onClick={() => openLogin('account')}>Войти</button>
            </div>
        );
    }

    const methods = methodsOf(account);
    const missing = methods.some((method) => !method.value && method.key !== 'vk');

    return (
        <div className={`${style.card} ${className}`}>
            <span className={style.title}>Способы входа</span>
            <ul className={style.list}>
                {methods.map((method) => (
                    <li key={method.key} className={style.item}>
                        <span className={style.label}>{method.label}</span>
                        <span className={method.value ? style.value : style.empty}>{method.value || 'не привязан'}</span>
                    </li>
                ))}
            </ul>
            <div className={style.actions}>
                {missing ? (
                    <button type="button" className={style.secondary} onClick={() => openLogin('link')}>Привязать</button>
                ) : null}
                {canLogout ? (
                    <button type="button" className={style.ghost} onClick={leave} disabled={isBusy}>Выйти</button>
                ) : null}
            </div>
        </div>
    );
}
