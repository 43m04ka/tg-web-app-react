import React, {useCallback, useEffect, useMemo, useState} from 'react';
import {useNavigate} from 'react-router-dom';
import {useSessionStore, selectUserId} from '../../store/useSessionStore';
import {useStructureStore} from '../../store/useStructureStore';
import {useCartStore} from '../../store/useCartStore';
import {useAppInsets} from '../../shared/hooks/useAppInsets';
import {useBackButton} from '../../shared/hooks/useBackButton';
import {useTelegram} from '../../shared/hooks/useTelegram';
import {useScrollMemory} from '../../shared/hooks/useScrollMemory';
import {hapticImpact} from '../../shared/lib/haptic';
import {recallView, rememberView} from '../../shared/lib/viewMemory';
import BackPill from '../../shared/ui/BackPill/BackPill';
import EmptyState from '../../shared/ui/EmptyState/EmptyState';
import {
    ACCOUNT_KINDS,
    PAYMENT_METHODS,
    accountForm,
    buildAccountData,
    faqFor,
    findMethod,
    isAccountFilled,
    isEmailValid,
    isMethodAvailable,
    money,
    pageCartItems,
    splitSchedule
} from './cartModel';
import {useBasketQuote} from './useBasketQuote';
import {useOrderFlow, SCREEN} from './useOrderFlow';
import AccountFields from './AccountFields';
import PromoField from './PromoField';
import {OrderAccepted, PaymentFail, PaymentSuccess, PaymentWaiting} from './PaymentScreens';
import style from './Basket.module.scss';

const PROMO_KEY = 'cart:promo';
const FORM_KEY = 'checkout:form';

const contactFor = ({isVk, isTg, user, username}) => {
    if (isVk) return `https://vk.com/im/convo/${user?.id} \n${user?.first_name || ''} ${user?.last_name || ''}`.trim();
    if (isTg) return `@${user?.username || username}`;

    return username;
};

function PaymentOption({method, total, isActive, onSelect}) {
    const isAvailable = isMethodAvailable(method, total);
    const schedule = method.schedule && isActive ? splitSchedule(total) : null;

    return (
        <div className={`${style.payment} ${isActive ? style.paymentActive : ''} ${isAvailable ? '' : style.paymentLocked}`}>
            <button
                type="button"
                className={style.paymentHead}
                disabled={!isAvailable}
                aria-pressed={isActive}
                onClick={() => onSelect(method.key)}
            >
                <span className={`${style.paymentMark} ${style[method.tone]}`} aria-hidden="true"/>

                <span className={style.paymentBody}>
                    <span className={style.paymentTitle}>{method.title}</span>
                    <span className={style.paymentNote}>
                        {isAvailable ? method.note : `Доступно от ${money(method.minTotal)}`}
                    </span>
                </span>

                <span className={`${style.radio} ${isActive ? style.radioOn : ''}`} aria-hidden="true">✓</span>
            </button>

            {schedule ? (
                <div className={style.schedule}>
                    {schedule.map((part, index) => (
                        <div key={part.label} className={style.schedulePart}>
                            <span className={`${style.scheduleBar} ${index === 0 ? style.scheduleBarPaid : ''}`}/>
                            <span className={`${style.scheduleSum} ${index === 0 ? style.scheduleSumFirst : ''}`}>
                                {money(part.amount)}
                            </span>
                            <span className={style.scheduleDate}>{part.label}</span>
                        </div>
                    ))}
                </div>
            ) : null}

            {schedule && method.terms ? (
                <p className={style.scheduleNote}>
                    График информационный и может отличаться от итогового при оформлении.{' '}
                    <a href={method.terms.url} target="_blank" rel="noreferrer">{method.terms.label}</a>
                </p>
            ) : null}
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

                        {isOpen ? <p className={style.faqAnswer}>{item.answer}</p> : null}
                    </div>
                );
            })}
        </div>
    );
}

export default function Checkout() {
    const navigate = useNavigate();
    const {contentSafeAreaInset, safeAreaInset} = useAppInsets();
    const {vkGroupId} = useTelegram();

    const userId = useSessionStore(selectUserId);
    const pageId = useSessionStore((state) => state.pageId);
    const user = useSessionStore((state) => state.user);
    const isVk = useSessionStore((state) => state.isVk);
    const isTg = useSessionStore((state) => state.isTg);
    const isWeb = useSessionStore((state) => state.isWeb);
    const platform = useSessionStore((state) => state.platform);

    const pages = useStructureStore((state) => state.pages);
    const catalogs = useStructureStore((state) => state.catalogs);

    const items = useCartStore((state) => state.items);
    const revision = useCartStore((state) => state.revision);
    const loadCart = useCartStore((state) => state.load);
    const reloadCart = useCartStore((state) => state.reload);

    const saved = useMemo(() => recallView(FORM_KEY) || {}, []);

    const [promoCode, setPromoCode] = useState(() => recallView(PROMO_KEY) || '');
    const [method, setMethod] = useState(saved.method || 'sbp');
    const [accountKind, setAccountKind] = useState(saved.accountKind || ACCOUNT_KINDS.NEW);
    const [accountValues, setAccountValues] = useState(saved.accountValues || {});
    const [username, setUsername] = useState(saved.username || '');
    const [email, setEmail] = useState(saved.email || '');
    const [isTouched, setTouched] = useState(false);

    const pageType = useMemo(
        () => (pages || []).find((page) => page.id === pageId)?.type || null,
        [pages, pageId]
    );

    const pageItems = useMemo(() => pageCartItems(items, catalogs, pageId), [items, catalogs, pageId]);

    const {quote, isLoading, error, retry} = useBasketQuote({userId, pageId, promoCode, revision});

    const flow = useOrderFlow(userId);

    const scrollRef = useScrollMemory('checkout', {ready: pageItems !== null});

    useEffect(() => {
        loadCart(userId);
    }, [userId, loadCart]);

    useEffect(() => {
        rememberView(FORM_KEY, {method, accountKind, accountValues, username, email});
    }, [method, accountKind, accountValues, username, email]);

    useEffect(() => {
        rememberView(PROMO_KEY, promoCode);
    }, [promoCode]);

    const total = quote?.total ?? 0;

    useEffect(() => {
        const current = findMethod(method);
        if (total > 0 && !isMethodAvailable(current, total)) setMethod('sbp');
    }, [method, total]);

    const back = useCallback(() => {
        hapticImpact('light');
        navigate('/basket');
    }, [navigate]);

    const hasNativeBack = useBackButton(back, {enabled: flow.screen === SCREEN.NONE});

    const closeFlow = useCallback(() => {
        flow.close();
        reloadCart(userId);
        navigate('/main');
    }, [flow, navigate, reloadCart, userId]);

    const retryFlow = useCallback(() => {
        flow.close();
        reloadCart(userId);
        navigate('/basket');
    }, [flow, navigate, reloadCart, userId]);

    const selected = findMethod(method);
    const isOnline = selected.isOnline;

    const needsUsername = (isTg && !user?.username) || isWeb;
    const contact = contactFor({isVk, isTg, user, username});

    const isContactReady = !needsUsername || username.trim().length > 0;
    const isEmailReady = !isOnline || isEmailValid(email);
    const isAccountReady = isAccountFilled(pageType, accountKind, accountValues);
    const isReady = Boolean(userId) && isContactReady && isEmailReady && isAccountReady
        && total > 0 && !isLoading && !error;

    const submit = useCallback(() => {
        setTouched(true);

        if (!isReady || flow.isSending) return;

        hapticImpact('medium');

        flow.submit({
            platform,
            vkGroupId: isVk ? vkGroupId : undefined,
            pageId,
            contact,
            username: user?.username || username,
            accountData: buildAccountData(pageType, accountKind, accountValues),
            email: email.trim() || undefined,
            paymentMethod: method,
            promoCode: quote?.promo?.name || undefined
        }, {
            items: (pageItems || []).map((item) => ({id: item.id, name: item.name, count: item.count})),
            total
        });
    }, [
        accountKind, accountValues, contact, email, flow, isReady, isVk, method, pageId,
        pageItems, pageType, platform, quote, total, user, username, vkGroupId
    ]);

    if (flow.screen === SCREEN.WAITING) {
        return <PaymentWaiting order={flow.order} onOpenAgain={flow.openAgain} onCancel={flow.cancel}/>;
    }

    if (flow.screen === SCREEN.SUCCESS) {
        return <PaymentSuccess order={flow.order} snapshot={flow.snapshot} onClose={closeFlow}/>;
    }

    if (flow.screen === SCREEN.FAIL) {
        return <PaymentFail order={flow.order} onRetry={retryFlow} onClose={closeFlow}/>;
    }

    if (flow.screen === SCREEN.ACCEPTED) {
        return <OrderAccepted order={flow.order} snapshot={flow.snapshot} onClose={closeFlow}/>;
    }

    if (pageItems !== null && pageItems.length === 0) {
        return (
            <div className={style.screen}>
                <div
                    className={style.header}
                    style={{paddingTop: `calc(${contentSafeAreaInset.top}px + 14 * var(--u))`}}
                >
                    {hasNativeBack ? null : <BackPill className={style.back} onClick={back}/>}
                    <h1 className={style.title}>Оформление</h1>
                </div>

                <div className={style.content}>
                    <EmptyState
                        icon="🛒"
                        title="Корзина опустела"
                        text="Оформлять нечего — добавьте товары и возвращайтесь."
                        actionLabel="Перейти к покупкам"
                        onAction={() => navigate('/main')}
                    />
                </div>
            </div>
        );
    }

    return (
        <div ref={scrollRef} className={style.screen}>
            <div
                className={style.header}
                style={{paddingTop: `calc(${contentSafeAreaInset.top}px + 14 * var(--u))`}}
            >
                {hasNativeBack ? null : <BackPill className={style.back} onClick={back}/>}
                <h1 className={style.title}>Оформление</h1>
            </div>

            <div
                className={style.content}
                style={{paddingBottom: `calc(${safeAreaInset.bottom}px + 20 * var(--u))`}}
            >
                <section className={style.block}>
                    <h2 className={style.blockTitle}>Способ оплаты</h2>

                    <div className={style.payments}>
                        {PAYMENT_METHODS.map((option) => (
                            <PaymentOption
                                key={option.key}
                                method={option}
                                total={total}
                                isActive={option.key === method}
                                onSelect={(key) => {
                                    hapticImpact('light');
                                    setMethod(key);
                                }}
                            />
                        ))}
                    </div>
                </section>

                <AccountFields
                    pageType={pageType}
                    kind={accountKind}
                    values={accountValues}
                    onKind={setAccountKind}
                    onChange={(key, value) => setAccountValues((prev) => ({...prev, [key]: value}))}
                />

                <section className={style.block}>
                    <h2 className={style.blockTitle}>Связь с вами</h2>

                    <div className={style.card}>
                        {needsUsername ? (
                            <label className={style.field}>
                                <span className={style.fieldLabel}>
                                    {isTg ? 'Ник в Telegram' : 'Telegram, VK или телефон'}
                                </span>
                                <input
                                    className={`${style.input} ${isTouched && !isContactReady ? style.inputBad : ''}`}
                                    value={username}
                                    placeholder={isTg ? 'gwstore_admin' : '@username или +79990000000'}
                                    autoComplete="off"
                                    autoCapitalize="none"
                                    onChange={(event) => setUsername(
                                        isTg
                                            ? event.target.value.replace(/[^a-zA-Z0-9_]/g, '')
                                            : event.target.value
                                    )}
                                />
                            </label>
                        ) : (
                            <p className={style.hint}>
                                Напишем в {isVk ? 'VK' : 'Telegram'} — {contact.split('\n')[0]}
                            </p>
                        )}

                        {isOnline ? (
                            <label className={style.field}>
                                <span className={style.fieldLabel}>Почта для чека</span>
                                <input
                                    className={`${style.input} ${isTouched && !isEmailReady ? style.inputBad : ''}`}
                                    type="email"
                                    value={email}
                                    placeholder="mail@example.com"
                                    autoComplete="email"
                                    autoCapitalize="none"
                                    onChange={(event) => setEmail(event.target.value)}
                                />
                                {isTouched && !isEmailReady ? (
                                    <span className={style.fieldError}>Проверьте адрес почты</span>
                                ) : null}
                            </label>
                        ) : null}
                    </div>
                </section>

                <section className={style.block}>
                    <h2 className={style.blockTitle}>Ваш заказ</h2>

                    <div className={style.orderList}>
                        {(quote?.positions || []).map((position, index) => (
                            <div key={`${position.name}-${index}`} className={style.orderRow}>
                                <span className={style.orderName}>{position.name}</span>
                                <span className={style.orderMeta}>
                                    {position.quantity > 1 ? `${position.quantity} шт.` : ''}
                                </span>
                                <span className={style.orderSum}>{money(position.sum)}</span>
                            </div>
                        ))}
                    </div>
                </section>

                <PromoField
                    promo={quote?.promo || null}
                    onApply={setPromoCode}
                    onClear={() => setPromoCode('')}
                />

                <section className={style.block}>
                    <h2 className={style.blockTitle}>Часто спрашивают</h2>
                    <Faq items={faqFor(pageType)}/>
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
                <div className={style.actionSummary}>
                    <span className={style.actionLabel}>К оплате</span>
                    <span className={style.actionPrices}>
                        {quote?.discount > 0 ? (
                            <span className={style.actionOld}>{money(quote.itemsTotal)}</span>
                        ) : null}
                        <span className={style.actionTotal}>{money(total)}</span>
                    </span>
                </div>

                {flow.error ? <p className={style.actionError}>{flow.error}</p> : null}
                {error ? (
                    <button type="button" className={style.secondary} onClick={retry}>
                        Сумма не посчиталась. Повторить
                    </button>
                ) : null}

                <button
                    type="button"
                    className={style.primary}
                    disabled={flow.isSending || isLoading || Boolean(error)}
                    onClick={submit}
                >
                    {flow.isSending
                        ? 'Оформляем…'
                        : isOnline ? 'Перейти к оплате' : 'Оформить заказ'}
                </button>
            </div>
        </div>
    );
}
