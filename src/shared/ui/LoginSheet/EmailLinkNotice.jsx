import React, {useEffect, useRef, useState} from 'react';
import {useSessionStore} from '../../../store/useSessionStore';
import {confirmEmailLink} from '../../api/auth';
import style from './LoginSheet.module.scss';

export const EMAIL_LOGIN_PARAM = 'email_login';

export const takeEmailLoginToken = () => {
    const url = new URL(window.location.href);
    const token = url.searchParams.get(EMAIL_LOGIN_PARAM);
    if (!token) return '';
    url.searchParams.delete(EMAIL_LOGIN_PARAM);
    window.history.replaceState(window.history.state, '', `${url.pathname}${url.search}${url.hash}`);
    return token;
};

const pendingToken = typeof window === 'undefined' ? '' : takeEmailLoginToken();

export default function EmailLinkNotice() {
    const account = useSessionStore((state) => state.account);
    const setAccount = useSessionStore((state) => state.setAccount);
    const openLogin = useSessionStore((state) => state.openLogin);
    const [result, setResult] = useState(null);
    const startedRef = useRef(false);

    const accountId = account?.id;

    useEffect(() => {
        if (!pendingToken || !accountId || startedRef.current) return;
        startedRef.current = true;
        setResult({status: 'pending'});

        confirmEmailLink(pendingToken)
            .catch(() => null)
            .then((response) => {
                if (response?.ok && response.user) {
                    setAccount(response.user);
                    setResult({status: 'ok', email: response.user.email});
                } else {
                    setResult({status: 'error', error: response?.error || 'Не удалось подтвердить вход, попробуйте ещё раз'});
                }
            });
    }, [accountId, setAccount]);

    if (!result) return null;

    const close = () => setResult(null);

    return (
        <div className={style.overlay} onClick={result.status === 'pending' ? undefined : close} role="presentation">
            <div className={style.sheet} role="dialog" aria-modal="true" onClick={(event) => event.stopPropagation()}>
                {result.status === 'pending' ? (
                    <>
                        <h2 className={style.title}>Подтверждаем вход</h2>
                        <p className={style.hint}><span className={style.spinner} aria-hidden="true"/>Подождите секунду…</p>
                    </>
                ) : null}

                {result.status === 'ok' ? (
                    <>
                        <h2 className={style.title}>Вход подтверждён</h2>
                        <p className={style.lead}>Вы вошли в аккаунт{result.email ? <> по почте <b>{result.email}</b></> : null}.</p>
                        <button type="button" className={style.primary} onClick={close}>Продолжить</button>
                    </>
                ) : null}

                {result.status === 'error' ? (
                    <>
                        <h2 className={style.title}>Не удалось войти</h2>
                        <p className={style.error}>{result.error}</p>
                        <button
                            type="button"
                            className={style.primary}
                            onClick={() => {
                                close();
                                openLogin('account');
                            }}
                        >
                            Войти заново
                        </button>
                    </>
                ) : null}
            </div>
        </div>
    );
}
