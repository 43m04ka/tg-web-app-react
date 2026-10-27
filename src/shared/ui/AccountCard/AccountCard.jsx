import React, {useCallback, useEffect, useState} from 'react';
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
    const [confirmAll, setConfirmAll] = useState(false);
    const [notice, setNotice] = useState('');

    const canLogout = !isTelegramWebApp() && !isVk();

    useEffect(() => {
        if (!confirmAll) return undefined;
        const timer = window.setTimeout(() => setConfirmAll(false), 5000);
        return () => window.clearTimeout(timer);
    }, [confirmAll]);

    const leave = useCallback(async (everywhere = false) => {
        if (isBusy) return;
        setBusy(true);
        setNotice('');
        const result = await logout(everywhere).catch(() => null);
        if (everywhere && !result?.ok) {
            setNotice('Не удалось выйти на всех устройствах. Попробуйте ещё раз.');
            setBusy(false);
            return;
        }
        setAuthToken(null);
        const next = await authenticate().catch(() => null);
        if (next) setAccount(next);
        if (everywhere) setNotice(next?.kind === 'user' ? 'Вы вышли на всех других устройствах' : 'Вы вышли на всех устройствах');
        setConfirmAll(false);
        setBusy(false);
    }, [isBusy, setAccount]);

    const leaveEverywhere = useCallback(() => {
        if (!confirmAll) {
            setConfirmAll(true);
            return;
        }
        leave(true);
    }, [confirmAll, leave]);

    const noticeLine = notice ? <span className={style.notice} role="status">{notice}</span> : null;

    if (!account) return null;

    if (account.kind !== 'user') {
        return (
            <div className={`${style.card} ${className}`}>
                <div className={style.head}>
                    <span className={style.title}>Вы не вошли</span>
                    <span className={style.text}>Войдите через Telegram или почту, чтобы оформлять заказы и видеть их на любом устройстве</span>
                </div>
                <button type="button" className={style.primary} onClick={() => openLogin('account')}>Войти</button>
                {noticeLine}
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
                    <button type="button" className={style.ghost} onClick={() => leave(false)} disabled={isBusy}>Выйти</button>
                ) : null}
            </div>
            <button type="button" className={`${style.everywhere} ${confirmAll ? style.everywhereConfirm : ''}`}
                    onClick={leaveEverywhere} disabled={isBusy}>
                {confirmAll ? 'Нажмите ещё раз, чтобы выйти везде' : 'Выйти на всех устройствах'}
            </button>
            {noticeLine}
        </div>
    );
}
