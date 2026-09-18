import React, {useCallback, useEffect, useMemo, useState} from 'react';
import {useNavigate} from 'react-router-dom';
import {useSessionStore, selectUserId} from '../../../store/useSessionStore';
import {recallView, rememberView} from '../../../shared/lib/viewMemory';
import {usePaymentMethods} from '../../../shared/hooks/usePaymentMethods';
import {isEmailValid, isMethodAvailable, methodUnavailableReason, money} from '../../../pages/Basket/cartModel';
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
} from '../../../pages/Steam/steamModel';
import {SCREEN, useSteamOrder} from '../../../pages/Steam/useSteamOrder';
import {useSteamQuote} from '../../../pages/Steam/useSteamQuote';
import {useScrollMemory} from '../../shell/ScrollAreaContext';
import Spinner from '../../ui/Spinner';
import {
    SteamCreditingDesktop,
    SteamDoneDesktop,
    SteamFailDesktop,
    SteamStalledDesktop,
    SteamWaitingDesktop
} from './SteamStates';
import style from './DesktopSteam.module.scss';

const FORM_KEY = 'steam:form';

const fullName = (user) => `${user?.first_name || ''} ${user?.last_name || ''}`.trim();

const nativeContact = (user) => {
    if (!user?.id || user.isGuest) return null;
    if (user.platform === 'vk') return `https://vk.com/im/convo/${user.id} \n${fullName(user)}`.trim();
    if (user.platform !== 'tg') return null;
    if (user.username) return `@${user.username}`;

    return `${fullName(user) || 'Пользователь Telegram'} \ntg://user?id=${user.id}`;
};

function Faq({items}) {
    const [openIndex, setOpenIndex] = useState(null);

    return (
        <div className={style.faq}>
            {items.map((item, index) => {
                const isOpen = openIndex === index;

                return (
                    <div key={item.question} className={style.faqItem} style={{'--i': index}}>
                        <button
                            type="button"
                            className={style.faqHead}
                            aria-expanded={isOpen}
                            onClick={() => setOpenIndex(isOpen ? null : index)}
                        >
                            <span className={style.faqQuestion}>{item.question}</span>
                            <span
                                className={isOpen ? `${style.faqSign} ${style.faqSignOpen}` : style.faqSign}
                                aria-hidden="true"
                            >
                                +
                            </span>
                        </button>

                        <div className={isOpen ? `${style.reveal} ${style.revealOpen}` : style.reveal}>
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

export default function DesktopSteam() {
    const navigate = useNavigate();

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

    const amount = Number(amountText);
    const {quote, isLoading, error: quoteError} = useSteamQuote(amount);

    const payment = usePaymentMethods({platform, scenario: 'steam', total: quote?.total ?? 0});

    useScrollMemory('steam', {ready: true});

    useEffect(() => {
        rememberView(FORM_KEY, {login, email, amountText});
    }, [login, email, amountText]);

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

    const submit = useCallback(() => {
        setTouched(true);

        if (!isReady || flow.isSending) return;

        flow.submit({
            platform,
            contact: nativeContact(user) || `Почта: ${email.trim()}`,
            username: user?.username || undefined,
            steamLogin: login.trim(),
            email: email.trim(),
            paymentMethod: payment.method,
            amount
        });
    }, [isReady, flow, platform, user, email, login, amount, payment.method]);

    if (flow.screen === SCREEN.WAITING) {
        return <SteamWaitingDesktop order={flow.order} onOpenAgain={flow.openAgain} onCancel={flow.cancel}/>;
    }

    if (flow.screen === SCREEN.CREDITING) {
        return <SteamCreditingDesktop order={flow.order} botType={botType}/>;
    }

    if (flow.screen === SCREEN.DONE) {
        return <SteamDoneDesktop order={flow.order} botType={botType} onClose={flow.close}/>;
    }

    if (flow.screen === SCREEN.FAIL) {
        return <SteamFailDesktop order={flow.order} onRetry={flow.close} onClose={() => navigate('/')}/>;
    }

    if (flow.screen === SCREEN.STALLED) {
        return <SteamStalledDesktop order={flow.order} botType={botType} onClose={flow.close}/>;
    }

    const fee = feeOf(quote);
    const percent = feePercent(quote);

    return (
        <div className={style.screen}>
            <header className={style.head}>
                <h1 className={style.title}>
                    Пополнение <span className={style.brand}>Steam</span>
                </h1>
                <p className={style.subtitle}>Зачислим на баланс аккаунта — обычно за 5–15 минут</p>
            </header>

            <div className={style.body}>
                <div className={style.main}>
                    <section className={style.block}>
                        <h2 className={style.blockTitle}>Логин Steam</h2>

                        <input
                            className={(isTouched && !isLoginReady) || flow.loginError
                                ? `${style.input} ${style.inputBad}`
                                : style.input}
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
                            className={isTouched && !isEmailReady ? `${style.input} ${style.inputBad}` : style.input}
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

                    <section className={style.block}>
                        <h2 className={style.blockTitle}>Сумма пополнения</h2>

                        <div className={isTouched && !isAmountReady
                            ? `${style.amountField} ${style.inputBad}`
                            : style.amountField}
                        >
                            <input
                                className={style.amountInput}
                                value={amountText}
                                inputMode="numeric"
                                placeholder={`от ${MIN_AMOUNT}`}
                                onChange={(event) => setAmountText(cleanAmount(event.target.value))}
                            />
                            <span className={style.amountCurrency} aria-hidden="true">₽</span>
                        </div>

                        <div className={style.presets}>
                            {PRESETS.map((value, index) => (
                                <button
                                    key={value}
                                    type="button"
                                    className={amount === value ? `${style.preset} ${style.presetActive}` : style.preset}
                                    style={{'--i': index}}
                                    aria-pressed={amount === value}
                                    onClick={() => setAmountText(String(value))}
                                >
                                    {money(value)}
                                </button>
                            ))}
                        </div>

                        <span className={style.blockNote}>Введите свою сумму или выберите быстрый вариант</span>
                    </section>

                    {payment.hasChoice ? (
                        <section className={style.block}>
                            <h2 className={style.blockTitle}>Способ оплаты</h2>

                            <div className={style.payments}>
                                {payment.methods.map((option, index) => {
                                    const isAvailable = isMethodAvailable(option, quote?.total ?? 0);
                                    const isActive = option.key === payment.method;

                                    return (
                                        <button
                                            key={option.key}
                                            type="button"
                                            className={[
                                                style.payment,
                                                isActive ? style.paymentActive : '',
                                                isAvailable ? '' : style.paymentLocked
                                            ].filter(Boolean).join(' ')}
                                            style={{'--i': index}}
                                            disabled={!isAvailable}
                                            aria-pressed={isActive}
                                            onClick={() => payment.setMethod(option.key)}
                                        >
                                            <span
                                                className={style.paymentMark}
                                                style={option.icon
                                                    ? {backgroundImage: `url(${process.env.PUBLIC_URL}/payments/${option.icon}.png)`}
                                                    : undefined}
                                                aria-hidden="true"
                                            />

                                            <span className={style.paymentBody}>
                                                <span className={style.paymentTitle}>{option.title}</span>
                                                <span className={style.paymentNote}>
                                                    {isAvailable ? option.note : methodUnavailableReason(option, money)}
                                                </span>
                                            </span>

                                            <span
                                                className={isActive ? `${style.radio} ${style.radioOn}` : style.radio}
                                                aria-hidden="true"
                                            >
                                                ✓
                                            </span>
                                        </button>
                                    );
                                })}
                            </div>
                        </section>
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

                <aside className={style.panel}>
                    <span className={style.panelTitle}>Расчёт</span>

                    <div className={style.summaryRow}>
                        <span className={style.summaryLabel}>Зачислим на баланс</span>
                        <span className={style.summaryValue}>{isAmountReady ? money(amount) : '—'}</span>
                    </div>

                    <div className={style.summaryRow}>
                        <span className={style.summaryLabel}>
                            {percent > 0 ? `Комиссия сервиса ${percent}%` : 'Комиссия сервиса'}
                        </span>
                        <span className={style.summaryValue}>{quote ? money(fee) : '—'}</span>
                    </div>

                    <span className={style.divider} aria-hidden="true"/>

                    <div className={style.summaryRow}>
                        <span className={style.finalLabel}>К оплате</span>
                        <span key={quote?.total} className={style.finalValue}>
                            {quote ? money(quote.total) : isLoading ? '…' : '—'}
                        </span>
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

                    {quoteError ? <p className={style.error}>{quoteError}</p> : null}
                    {blockReason ? <p className={style.error}>{blockReason}</p> : null}
                    {flow.error ? <p className={style.error}>{flow.error}</p> : null}

                    <button
                        type="button"
                        className={style.primary}
                        disabled={flow.isSending || isLoading}
                        onClick={submit}
                    >
                        {flow.isSending ? <Spinner/> : null}
                        {flow.isSending
                            ? 'Создаём заказ…'
                            : quote ? `Пополнить на ${money(quote.topupAmount)}` : 'Пополнить баланс'}
                    </button>
                </aside>
            </div>
        </div>
    );
}
