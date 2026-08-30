import React, {useCallback, useEffect, useMemo, useState} from 'react';
import {useNavigate} from 'react-router-dom';
import {useSessionStore, selectUserId} from '../../store/useSessionStore';
import {useAppInsets} from '../../shared/hooks/useAppInsets';
import {useBackButton} from '../../shared/hooks/useBackButton';
import {useScrollMemory} from '../../shared/hooks/useScrollMemory';
import {hapticImpact, hapticSelection} from '../../shared/lib/haptic';
import {recallView, rememberView} from '../../shared/lib/viewMemory';
import BackPill from '../../shared/ui/BackPill/BackPill';
import {isEmailValid, money} from '../Basket/cartModel';
import {SteamCrediting, SteamDone, SteamFail, SteamStalled, SteamWaiting} from './SteamScreens';
import {
    MIN_AMOUNT,
    PRESETS,
    STEAM_FAQ,
    amountError,
    cleanAmount,
    cleanLogin,
    feeOf,
    feePercent,
    isAmountValid,
    isLoginValid
} from './steamModel';
import {SCREEN, useSteamOrder} from './useSteamOrder';
import {useSteamQuote} from './useSteamQuote';
import style from './Steam.module.scss';

const FORM_KEY = 'steam:form';

const fullName = (user) => `${user?.first_name || ''} ${user?.last_name || ''}`.trim();

const nativeContact = (user) => {
    if (!user?.id || user.isGuest) return null;
    if (user.platform === 'vk') return `https://vk.com/im/convo/${user.id} \n${fullName(user)}`.trim();
    if (user.platform !== 'tg') return null;
    if (user.username) return `@${user.username}`;

    return `${fullName(user) || 'Пользователь Telegram'} \ntg://user?id=${user.id}`;
};

export default function Steam() {
    const navigate = useNavigate();
    const {contentSafeAreaInset, safeAreaInset} = useAppInsets();

    const userId = useSessionStore(selectUserId);
    const user = useSessionStore((state) => state.user);
    const platform = useSessionStore((state) => state.platform);
    const botType = useSessionStore((state) => state.botType);

    const saved = useMemo(() => recallView(FORM_KEY) || {}, []);

    const [login, setLogin] = useState(saved.login || '');
    const [email, setEmail] = useState(saved.email || '');
    const [amountText, setAmountText] = useState(saved.amountText || '');
    const [isTouched, setTouched] = useState(false);

    const flow = useSteamOrder(userId);

    const scrollRef = useScrollMemory('steam');

    const amount = Number(amountText);

    const {quote, isLoading, error: quoteError} = useSteamQuote(amount);

    useEffect(() => {
        rememberView(FORM_KEY, {login, email, amountText});
    }, [login, email, amountText]);

    const back = useCallback(() => {
        hapticImpact('light');
        navigate('/');
    }, [navigate]);

    const hasNativeBack = useBackButton(back, {enabled: flow.screen === SCREEN.NONE});

    const isLoginReady = isLoginValid(login);
    const isEmailReady = isEmailValid(email);
    const isAmountReady = isAmountValid(amount);
    const isReady = Boolean(userId) && isLoginReady && isEmailReady && isAmountReady
        && Boolean(quote) && !isLoading && !quoteError;

    const blockReason = useMemo(() => {
        if (!isTouched || isReady) return null;
        if (!userId) return 'Не удалось определить ваш профиль — перезапустите приложение';
        if (!isLoginReady) return 'Укажите логин Steam';
        if (!isEmailReady) return 'Укажите почту для чека';
        if (!isAmountReady) return amountError(amountText);
        if (quoteError) return quoteError;

        return null;
    }, [isTouched, isReady, userId, isLoginReady, isEmailReady, isAmountReady, quoteError, amountText]);

    const pickPreset = useCallback((value) => {
        hapticSelection();
        setAmountText(String(value));
    }, []);

    const submit = useCallback(() => {
        setTouched(true);

        if (!isReady || flow.isSending) return;

        hapticImpact('medium');

        flow.submit({
            platform,
            contact: nativeContact(user) || `Почта: ${email.trim()}`,
            username: user?.username || undefined,
            steamLogin: login.trim(),
            email: email.trim(),
            amount
        });
    }, [isReady, flow, platform, user, email, login, amount]);

    if (flow.screen === SCREEN.WAITING) {
        return <SteamWaiting order={flow.order} onOpenAgain={flow.openAgain} onCancel={flow.cancel}/>;
    }

    if (flow.screen === SCREEN.CREDITING) {
        return <SteamCrediting order={flow.order} botType={botType}/>;
    }

    if (flow.screen === SCREEN.DONE) {
        return <SteamDone order={flow.order} botType={botType} onClose={flow.close}/>;
    }

    if (flow.screen === SCREEN.FAIL) {
        return <SteamFail order={flow.order} onRetry={flow.close} onClose={back}/>;
    }

    if (flow.screen === SCREEN.STALLED) {
        return <SteamStalled order={flow.order} botType={botType} onClose={flow.close}/>;
    }

    const fee = feeOf(quote);
    const percent = feePercent(quote);

    return (
        <div ref={scrollRef} className={style.screen}>
            <div
                className={style.header}
                style={{paddingTop: `calc(${contentSafeAreaInset.top}px + 14 * var(--u))`}}
            >
                {hasNativeBack ? null : <BackPill className={style.back} onClick={back}/>}
                <h1 className={style.title}>Пополнение <span className={style.brand}>Steam</span></h1>
            </div>

            <div
                className={style.content}
                style={{paddingBottom: `calc(${safeAreaInset.bottom}px + 20 * var(--u))`}}
            >
                <section className={style.block}>
                    <h2 className={style.blockTitle}>Логин Steam</h2>

                    <input
                        className={`${style.input} ${(isTouched && !isLoginReady) || flow.loginError ? style.inputBad : ''}`}
                        value={login}
                        placeholder="gameword_player"
                        autoComplete="off"
                        autoCapitalize="none"
                        autoCorrect="off"
                        spellCheck="false"
                        onChange={(event) => {
                            setLogin(cleanLogin(event.target.value));
                            flow.clearLoginError();
                        }}
                    />

                    <span className={style.blockNote}>
                        {flow.loginError
                            ? flow.loginError
                            : isTouched && !isLoginReady
                                ? 'Логин от 3 символов: латиница, цифры, дефис и подчёркивание'
                                : 'Именно логин для входа — не ник в профиле и не почта'}
                    </span>
                </section>

                <section className={style.block}>
                    <h2 className={style.blockTitle}>E-mail для чека</h2>

                    <input
                        className={`${style.input} ${isTouched && !isEmailReady ? style.inputBad : ''}`}
                        type="email"
                        value={email}
                        placeholder="player@mail.ru"
                        autoComplete="email"
                        autoCapitalize="none"
                        onChange={(event) => setEmail(event.target.value)}
                    />

                    {isTouched && !isEmailReady ? (
                        <span className={`${style.blockNote} ${style.blockNoteBad}`}>Проверьте адрес почты</span>
                    ) : null}
                </section>

                <section className={`${style.block} ${style.amountBlock}`}>
                    <h2 className={style.blockTitle}>Сумма пополнения</h2>

                    <div className={`${style.amountField} ${isTouched && !isAmountReady ? style.amountFieldBad : ''}`}>
                        <input
                            className={style.amountInput}
                            value={amountText}
                            inputMode="numeric"
                            placeholder={`от ${MIN_AMOUNT} ₽`}
                            onChange={(event) => setAmountText(cleanAmount(event.target.value))}
                        />
                        <span className={style.amountCurrency} aria-hidden="true">₽</span>
                    </div>

                    <div className={style.presets}>
                        {PRESETS.map((value) => (
                            <button
                                key={value}
                                type="button"
                                className={`${style.preset} ${amount === value ? style.presetActive : ''}`}
                                aria-pressed={amount === value}
                                onClick={() => pickPreset(value)}
                            >
                                {money(value)}
                            </button>
                        ))}
                    </div>

                    <span className={style.blockNote}>Введите свою сумму или выберите быстрый вариант</span>
                </section>

                <div className={style.summary}>
                    <div className={style.summaryRow}>
                        <span>Зачислим на баланс</span>
                        <span className={style.summaryValue}>
                            {isAmountReady ? money(amount) : '—'}
                        </span>
                    </div>

                    <div className={style.summaryRow}>
                        <span>{percent > 0 ? `Комиссия сервиса ${percent}%` : 'Комиссия сервиса'}</span>
                        <span className={style.summaryValue}>{quote ? money(fee) : '—'}</span>
                    </div>

                    <div className={style.summaryLine} aria-hidden="true"/>

                    <div className={style.summaryRow}>
                        <span className={style.summaryTotalLabel}>К оплате</span>
                        <span key={quote?.total} className={style.summaryTotal}>
                            {quote ? money(quote.total) : isLoading ? '…' : '—'}
                        </span>
                    </div>

                    {quoteError ? <span className={style.summaryError}>{quoteError}</span> : null}
                </div>

                {isEmailReady ? (
                    <div className={style.receipt}>
                        <span className={style.receiptIcon} aria-hidden="true">✉</span>

                        <span className={style.receiptBody}>
                            <span className={style.receiptTitle}>Чек придёт на почту</span>
                            <span className={style.receiptValue}>{email.trim()}</span>
                        </span>
                    </div>
                ) : null}

                <section className={style.block}>
                    <h2 className={style.blockTitle}>Часто спрашивают</h2>
                    <Faq items={STEAM_FAQ}/>
                </section>

                <p className={style.legal}>
                    Нажимая кнопку, вы соглашаетесь с{' '}
                    <a href="https://gwstore.su/pk" target="_blank" rel="noreferrer">
                        условиями обработки персональных данных
                    </a>{' '}
                    и{' '}
                    <a href="https://gwstore.su/privacy" target="_blank" rel="noreferrer">
                        пользовательским соглашением
                    </a>.
                </p>
            </div>

            <div className={style.actionBar}>
                {blockReason ? <p className={style.actionError}>{blockReason}</p> : null}
                {flow.error ? <p className={style.actionError}>{flow.error}</p> : null}

                <button
                    type="button"
                    className={style.primary}
                    disabled={flow.isSending || isLoading}
                    onClick={submit}
                >
                    {flow.isSending
                        ? 'Создаём заказ…'
                        : quote ? `Пополнить на ${money(quote.topupAmount)}` : 'Пополнить баланс'}
                </button>
            </div>
        </div>
    );
}

function Faq({items}) {
    const [openIndex, setOpenIndex] = useState(null);

    return (
        <div className={style.faq}>
            {items.map((item, index) => {
                const isOpen = openIndex === index;

                return (
                    <div key={item.question} className={style.faqItem}>
                        <button
                            type="button"
                            className={style.faqHead}
                            aria-expanded={isOpen}
                            onClick={() => {
                                hapticImpact('light');
                                setOpenIndex(isOpen ? null : index);
                            }}
                        >
                            <span className={style.faqQuestion}>{item.question}</span>
                            <span className={`${style.faqSign} ${isOpen ? style.faqSignOpen : ''}`} aria-hidden="true">+</span>
                        </button>

                        <div className={`${style.reveal} ${isOpen ? style.revealOpen : ''}`}>
                            <div className={style.revealInner}>
                                <p className={style.faqAnswer}>{item.answer}</p>
                            </div>
                        </div>
                    </div>
                );
            })}
        </div>
    );
}
