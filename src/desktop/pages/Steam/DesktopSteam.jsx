import React, {useCallback, useEffect, useMemo, useState} from 'react';
import {useNavigate} from 'react-router-dom';
import {useSessionStore, selectUserId} from '../../../store/useSessionStore';
import {recallView, rememberView} from '../../../shared/lib/viewMemory';
import {usePaymentMethods} from '../../../shared/hooks/usePaymentMethods';
import {isEmailValid, isMethodAvailable, methodUnavailableReason, money} from '../../../pages/Basket/cartModel';
import {
    MAX_AMOUNT,
    MIN_AMOUNT,
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
import {LOGIN_CHECK, useSteamLoginCheck} from '../../../pages/Steam/useSteamLoginCheck';
import {useScrollMemory} from '../../shell/ScrollAreaContext';
import Spinner from '../../ui/Spinner';
import LegalNote from '../../../shared/ui/LegalNote/LegalNote';
import VpnGate, {usePaymentNetwork} from '../../../shared/ui/VpnGate/VpnGate';
import {
    SteamCreditingDesktop,
    SteamDoneDesktop,
    SteamFailDesktop,
    SteamStalledDesktop,
    SteamWaitingDesktop
} from './SteamStates';
import style from './DesktopSteam.module.scss';

const FORM_KEY = 'steam:form';

const PRESETS = [100, 500, 1000, 3000];
const TOP_PRESET = 1000;

const LOGIN_NOTES = {
    [LOGIN_CHECK.CHECKING]: {tone: 'muted', text: 'Проверяем аккаунт…'},
    [LOGIN_CHECK.OK]: {tone: 'good', text: 'Аккаунт подтверждён'},
    [LOGIN_CHECK.NOT_FOUND]: {tone: 'bad', text: 'Аккаунт с таким логином не найден. Проверьте написание: нужен логин для входа, а не никнейм'},
    [LOGIN_CHECK.UNKNOWN]: {tone: 'muted', text: 'Не удалось проверить логин, проверьте его внимательно'}
};

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
    const [isConfirmed, setConfirmed] = useState(false);

    const flow = useSteamOrder(userId);

    const amount = Number(amountText);
    const {quote, isLoading, error: quoteError} = useSteamQuote(amount);

    const payment = usePaymentMethods({platform, scenario: 'steam', total: quote?.total ?? 0});

    useScrollMemory('steam', {ready: true});

    useEffect(() => {
        rememberView(FORM_KEY, {login, email, amountText});
    }, [login, email, amountText]);

    const loginCheck = useSteamLoginCheck(login, platform);

    const isLoginReady = isLoginValid(login);
    const isLoginChecked = loginCheck !== LOGIN_CHECK.CHECKING && loginCheck !== LOGIN_CHECK.NOT_FOUND;
    const isEmailReady = isEmailValid(email);
    const isAmountReady = isAmountValid(amount);
    const isReady = Boolean(userId) && isLoginReady && isLoginChecked && isEmailReady && isAmountReady
        && isConfirmed && Boolean(quote) && !isLoading && !quoteError;

    const blockReason = useMemo(() => {
        if (!isTouched || isReady) return null;
        if (!userId) return 'Не удалось определить ваш профиль — перезапустите приложение';
        if (!isLoginReady) return 'Укажите логин Steam';
        if (loginCheck === LOGIN_CHECK.NOT_FOUND) return 'Аккаунт Steam с таким логином не найден';
        if (loginCheck === LOGIN_CHECK.CHECKING) return 'Дождитесь проверки логина Steam';
        if (!isEmailReady) return 'Укажите почту для чека';
        if (!isAmountReady) return amountError(amountText);
        if (quoteError) return quoteError;
        if (!isConfirmed) return 'Подтвердите, что логин Steam указан верно';

        return null;
    }, [isTouched, isReady, userId, isLoginReady, loginCheck, isEmailReady, isAmountReady, quoteError, amountText, isConfirmed]);

    const network = usePaymentNetwork();

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
    const loginNote = flow.loginError
        ? {tone: 'bad', text: flow.loginError}
        : isTouched && !isLoginReady
            ? {tone: 'bad', text: 'Логин от 3 символов: латиница, цифры, дефис и подчёркивание'}
            : LOGIN_NOTES[loginCheck] || {tone: 'muted', text: 'Логин для входа в Steam, не никнейм в профиле и не почта'};
    const isLoginBad = (isTouched && !isLoginReady) || Boolean(flow.loginError) || loginCheck === LOGIN_CHECK.NOT_FOUND;
    const isLoginGood = !flow.loginError && loginCheck === LOGIN_CHECK.OK;

    return (
        <div className={style.screen}>
            <header className={style.hero}>
                <span
                    className={style.heroLogo}
                    style={{backgroundImage: `url(${process.env.PUBLIC_URL}/regions/steam.png)`}}
                    aria-hidden="true"
                />

                <div className={style.heroText}>
                    <h1 className={style.title}>Пополнение Steam</h1>
                    <p className={style.subtitle}>Россия · зачисление 1-2 минуты</p>
                </div>
            </header>

            <div className={style.body}>
                <div className={style.main}>
                    <div className={style.form}>
                        <section className={style.step}>
                            <div className={style.stepHead}>
                                <span className={style.stepNum}>1</span>
                                <h2 className={style.stepTitle}>Логин Steam</h2>
                                <span className={style.stepHint}>не никнейм, а логин для входа</span>
                            </div>

                            <div className={style.field}>
                                <input
                                    className={[
                                        style.input,
                                        isLoginBad ? style.inputBad : '',
                                        isLoginGood ? style.inputGood : ''
                                    ].filter(Boolean).join(' ')}
                                    value={login}
                                    placeholder="gameword_player"
                                    autoComplete="off"
                                    autoCapitalize="none"
                                    autoCorrect="off"
                                    spellCheck="false"
                                    onChange={(event) => {
                                        setLogin(cleanLogin(event.target.value));
                                        setConfirmed(false);
                                        flow.clearLoginError();
                                    }}
                                />

                                {loginCheck === LOGIN_CHECK.CHECKING ? (
                                    <span className={style.fieldMark}><Spinner/></span>
                                ) : isLoginGood ? (
                                    <span className={`${style.fieldMark} ${style.fieldMarkGood}`} aria-hidden="true">✓</span>
                                ) : isLoginBad && isLoginReady ? (
                                    <span className={`${style.fieldMark} ${style.fieldMarkBad}`} aria-hidden="true">!</span>
                                ) : null}
                            </div>

                            <span
                                className={[
                                    style.stepNote,
                                    loginNote.tone === 'good' ? style.stepNoteGood : '',
                                    loginNote.tone === 'bad' ? style.stepNoteBad : ''
                                ].filter(Boolean).join(' ')}
                            >
                                {loginNote.text}
                            </span>
                        </section>

                        <section className={style.step}>
                            <div className={style.stepHead}>
                                <span className={style.stepNum}>2</span>
                                <h2 className={style.stepTitle}>E-mail для чека</h2>
                                <span className={style.stepHint}>пришлём чек об оплате</span>
                            </div>

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
                                <span className={`${style.stepNote} ${style.stepNoteBad}`}>Проверьте адрес почты</span>
                            ) : null}
                        </section>

                        <section className={style.step}>
                            <div className={style.stepHead}>
                                <span className={style.stepNum}>3</span>
                                <h2 className={style.stepTitle}>Сумма пополнения</h2>
                                <span className={style.stepHint}>
                                    от {money(MIN_AMOUNT)} до {money(MAX_AMOUNT)}
                                </span>
                            </div>

                            <div className={style.amounts}>
                                {PRESETS.map((value, index) => (
                                    <button
                                        key={value}
                                        type="button"
                                        className={amount === value ? `${style.amountButton} ${style.amountButtonActive}` : style.amountButton}
                                        style={{'--i': index}}
                                        aria-pressed={amount === value}
                                        onClick={() => setAmountText(String(value))}
                                    >
                                        {value === TOP_PRESET ? <span className={style.amountTop}>ТОП</span> : null}
                                        {money(value)}
                                    </button>
                                ))}
                            </div>

                            <div className={isTouched && !isAmountReady
                                ? `${style.amountField} ${style.inputBad}`
                                : style.amountField}
                            >
                                <input
                                    className={style.amountInput}
                                    value={amountText}
                                    inputMode="numeric"
                                    placeholder="Своя сумма"
                                    onChange={(event) => setAmountText(cleanAmount(event.target.value))}
                                />
                                <span className={style.amountCurrency} aria-hidden="true">₽</span>
                            </div>
                        </section>

                        {payment.hasChoice ? (
                            <section className={style.step}>
                                <div className={style.stepHead}>
                                    <span className={style.stepNum}>4</span>
                                    <h2 className={style.stepTitle}>Способ оплаты</h2>
                                </div>

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
                    </div>

                    <section className={style.block}>
                        <h2 className={style.blockTitle}>Часто спрашивают</h2>
                        <Faq items={STEAM_FAQ}/>
                    </section>
                </div>

                <aside className={style.panel}>
                    <div className={style.flow}>
                        <div className={style.flowSide}>
                            <span className={style.flowLabel}>На баланс Steam</span>
                            <span key={`a${amount}`} className={style.flowValue}>{isAmountReady ? money(amount) : '—'}</span>
                        </div>

                        <span className={style.flowArrow} aria-hidden="true">→</span>

                        <div className={`${style.flowSide} ${style.flowSideEnd}`}>
                            <span className={style.flowLabel}>К оплате</span>
                            <span key={`t${quote?.total}`} className={`${style.flowValue} ${style.flowValuePay}`}>
                                {quote ? money(quote.total) : isLoading ? '…' : '—'}
                            </span>
                        </div>
                    </div>

                    <div className={style.summaryRow}>
                        <span className={style.summaryLabel}>
                            {percent > 0 ? `Комиссия сервиса ${percent}%` : 'Комиссия сервиса'}
                        </span>
                        <span className={style.summaryValue}>{quote ? money(fee) : '—'}</span>
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

                    <label className={isTouched && !isConfirmed ? `${style.confirm} ${style.confirmBad}` : style.confirm}>
                        <input
                            type="checkbox"
                            className={style.confirmInput}
                            checked={isConfirmed}
                            onChange={(event) => setConfirmed(event.target.checked)}
                        />
                        <span className={style.confirmBox} aria-hidden="true">✓</span>
                        <span className={style.confirmText}>
                            Подтверждаю, что логин Steam указан верно. При ошибке в логине средства не возвращаются
                        </span>
                    </label>

                    {quoteError ? <p className={style.error}>{quoteError}</p> : null}
                    {blockReason && blockReason !== quoteError ? <p className={style.error}>{blockReason}</p> : null}
                    {flow.error ? <p className={style.error}>{flow.error}</p> : null}

                    <VpnGate network={network}/>

                    <button
                        type="button"
                        className={style.primary}
                        disabled={flow.isSending || isLoading}
                        onClick={submit}
                    >
                        {flow.isSending ? <Spinner/> : null}
                        {flow.isSending
                            ? 'Создаём заказ…'
                            : quote ? `Оплатить ${money(quote.total)}` : 'Пополнить баланс'}
                    </button>

                    <LegalNote className={style.legal} action="Оплатить"/>

                    <span className={style.auto}>Пополнение происходит автоматически после оплаты</span>
                </aside>
            </div>
        </div>
    );
}
