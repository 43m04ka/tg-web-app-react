import React, {useCallback, useEffect, useRef, useState} from 'react';
import {useSessionStore} from '../../../store/useSessionStore';
import {fetchTelegramLinkStatus, startEmailLogin, startTelegramLink, verifyEmailLogin} from '../../api/auth';
import {isTelegramWebApp} from '../../lib/loginContext';
import style from './LoginSheet.module.scss';

const POLL_MS = 2000;
const RESEND_SEC = 60;

const TITLES = {
    order: 'Войдите, чтобы оформить заказ',
    account: 'Вход в аккаунт',
    link: 'Привязать способ входа'
};

function TelegramIcon() {
    return (
        <svg viewBox="0 0 24 24" aria-hidden="true">
            <path fill="currentColor" d="M21.4 4.3 18.3 19c-.2 1-.8 1.3-1.7.8l-4.6-3.4-2.2 2.1c-.3.3-.5.5-1 .5l.3-4.8 8.7-7.9c.4-.3-.1-.5-.6-.2L6.4 12.9l-4.6-1.4c-1-.3-1-1 .2-1.5L20 3.1c.8-.3 1.6.2 1.4 1.2z"/>
        </svg>
    );
}

function MailIcon() {
    return (
        <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
            <rect x="3" y="5" width="18" height="14" rx="3" stroke="currentColor" strokeWidth="1.8"/>
            <path d="m4 7 8 6 8-6" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
    );
}

function TelegramBlock({onDone}) {
    const [link, setLink] = useState(null);
    const [phase, setPhase] = useState('idle');
    const [error, setError] = useState('');
    const aliveRef = useRef(true);

    const loadLink = useCallback(async (keepError = false) => {
        if (!keepError) setError('');
        const result = await startTelegramLink().catch(() => null);
        if (!aliveRef.current) return;
        if (result?.ok) setLink(result);
        else setError(result?.error || 'Не удалось подготовить вход через Telegram');
    }, []);

    useEffect(() => {
        aliveRef.current = true;
        loadLink();
        return () => {
            aliveRef.current = false;
        };
    }, [loadLink]);

    useEffect(() => {
        if (phase !== 'waiting' || !link) return undefined;

        const controller = new AbortController();
        const timerId = setInterval(async () => {
            if (document.visibilityState === 'hidden') return;
            const result = await fetchTelegramLinkStatus(link.nonce, controller.signal).catch(() => null);
            if (!result || controller.signal.aborted) return;

            if (result.status === 'confirmed' && result.user) {
                clearInterval(timerId);
                onDone(result.user);
            } else if (result.status === 'expired' || result.httpStatus >= 400) {
                clearInterval(timerId);
                setPhase('idle');
                setError(result.error || 'Ссылка устарела, нажмите кнопку ещё раз');
                loadLink(true);
            }
        }, POLL_MS);

        return () => {
            controller.abort();
            clearInterval(timerId);
        };
    }, [phase, link, onDone, loadLink]);

    return (
        <div className={style.block}>
            <a
                className={`${style.method} ${style.telegram} ${link ? '' : style.methodDisabled}`}
                href={link?.url || undefined}
                target="_blank"
                rel="noopener noreferrer"
                onClick={(event) => {
                    if (!link) {
                        event.preventDefault();
                        return;
                    }
                    setPhase('waiting');
                }}
            >
                <span className={style.methodIcon}><TelegramIcon/></span>
                <span className={style.methodLabel}>Войти через Telegram</span>
            </a>

            {phase === 'waiting' ? (
                <p className={style.hint}>
                    <span className={style.spinner} aria-hidden="true"/>
                    Откройте бота Геймворд и нажмите «Подтвердить вход». Эта страница обновится сама.
                </p>
            ) : null}

            {error ? <p className={style.error}>{error}</p> : null}
        </div>
    );
}

function EmailBlock({onDone, initialEmail}) {
    const [email, setEmail] = useState(initialEmail || '');
    const [code, setCode] = useState('');
    const [phase, setPhase] = useState('email');
    const [isBusy, setBusy] = useState(false);
    const [error, setError] = useState('');
    const [resendIn, setResendIn] = useState(0);

    useEffect(() => {
        if (resendIn <= 0) return undefined;
        const timerId = setTimeout(() => setResendIn((value) => value - 1), 1000);
        return () => clearTimeout(timerId);
    }, [resendIn]);

    const send = useCallback(async (event) => {
        event?.preventDefault();
        if (isBusy) return;
        setBusy(true);
        setError('');
        const result = await startEmailLogin(email.trim()).catch(() => null);
        setBusy(false);

        if (result?.ok) {
            setPhase('code');
            setCode('');
            setResendIn(RESEND_SEC);
            return;
        }

        if (result?.retryInSec) {
            setPhase('code');
            setResendIn(result.retryInSec);
        }
        setError(result?.error || 'Не удалось отправить код, попробуйте позже');
    }, [email, isBusy]);

    const verify = useCallback(async (event) => {
        event?.preventDefault();
        if (isBusy) return;
        setBusy(true);
        setError('');
        const result = await verifyEmailLogin(email.trim(), code.trim()).catch(() => null);
        setBusy(false);

        if (result?.ok && result.user) {
            onDone(result.user);
            return;
        }

        if (result?.code === 'expired' || result?.code === 'attempts') setCode('');
        setError(result?.error || 'Не удалось войти, попробуйте ещё раз');
    }, [email, code, isBusy, onDone]);

    if (phase === 'code') {
        return (
            <form className={style.block} onSubmit={verify}>
                <p className={style.note}>Мы отправили код на <b>{email.trim()}</b>. Если письма нет, проверьте папку «Спам».</p>
                <input
                    className={`${style.input} ${style.codeInput}`}
                    inputMode="numeric"
                    autoComplete="one-time-code"
                    maxLength={6}
                    placeholder="Код из письма"
                    value={code}
                    onChange={(event) => setCode(event.target.value.replace(/\D/g, '').slice(0, 6))}
                    autoFocus
                />
                {error ? <p className={style.error}>{error}</p> : null}
                <button type="submit" className={style.primary} disabled={code.length !== 6 || isBusy}>
                    {isBusy ? 'Проверяем…' : 'Войти'}
                </button>
                <div className={style.row}>
                    <button type="button" className={style.textButton} onClick={() => setPhase('email')}>
                        Изменить почту
                    </button>
                    <button type="button" className={style.textButton} disabled={resendIn > 0 || isBusy} onClick={send}>
                        {resendIn > 0 ? `Отправить снова через ${resendIn} с` : 'Отправить код снова'}
                    </button>
                </div>
            </form>
        );
    }

    return (
        <form className={style.block} onSubmit={send}>
            <label className={style.field}>
                <span className={style.fieldIcon}><MailIcon/></span>
                <input
                    className={style.input}
                    type="email"
                    inputMode="email"
                    autoComplete="email"
                    placeholder="Электронная почта"
                    value={email}
                    onChange={(event) => setEmail(event.target.value)}
                />
            </label>
            {error ? <p className={style.error}>{error}</p> : null}
            <button type="submit" className={style.secondary} disabled={!email.trim() || isBusy}>
                {isBusy ? 'Отправляем…' : 'Получить код на почту'}
            </button>
        </form>
    );
}

export default function LoginSheet() {
    const login = useSessionStore((state) => state.login);
    const account = useSessionStore((state) => state.account);
    const closeLogin = useSessionStore((state) => state.closeLogin);
    const setAccount = useSessionStore((state) => state.setAccount);

    const isOpen = Boolean(login);

    useEffect(() => {
        if (!isOpen) return undefined;
        const onKey = (event) => {
            if (event.key === 'Escape') closeLogin();
        };
        window.addEventListener('keydown', onKey);
        return () => window.removeEventListener('keydown', onKey);
    }, [isOpen, closeLogin]);

    const done = useCallback((user) => {
        setAccount(user);
        closeLogin();
    }, [setAccount, closeLogin]);

    if (!isOpen) return null;

    const hasTelegram = Boolean(account?.telegram) || isTelegramWebApp();
    const hasEmail = Boolean(account?.email);
    const reason = account?.kind === 'user' && login.reason !== 'order' ? 'link' : login.reason;

    return (
        <div className={style.overlay} onClick={closeLogin} role="presentation">
            <div className={style.sheet} role="dialog" aria-modal="true" onClick={(event) => event.stopPropagation()}>
                <button type="button" className={style.close} onClick={closeLogin} aria-label="Закрыть">×</button>

                <h2 className={style.title}>{TITLES[reason] || TITLES.account}</h2>
                <p className={style.lead}>
                    Так ваши заказы сохранятся в одном аккаунте на любом устройстве, а мы сможем связаться с вами по заказу.
                </p>

                {!hasTelegram ? <TelegramBlock onDone={done}/> : null}
                {!hasTelegram && !hasEmail ? <div className={style.divider}><span>или</span></div> : null}
                {!hasEmail ? <EmailBlock onDone={done}/> : null}
                {hasTelegram && hasEmail ? <p className={style.note}>Все способы входа уже привязаны.</p> : null}
            </div>
        </div>
    );
}
