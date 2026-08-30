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
    contactHandle,
    faqFor,
    findMethod,
    formatContact,
    isAccountFilled,
    isContactValid,
    isEmailValid,
    isMethodAvailable,
    money,
    pageCartItems,
    splitSchedule
} from './cartModel';
import {unitPrice} from './quoteLocal';
import {useBasketQuote} from './useBasketQuote';
import {usePromoMemory} from './usePromoMemory';
import {useOrderFlow, SCREEN} from './useOrderFlow';
import AccountFields from './AccountFields';
import ContactField from './ContactField';
import PromoField from './PromoField';
import {OrderAccepted, PaymentFail, PaymentSuccess, PaymentWaiting} from './PaymentScreens';
import style from './Basket.module.scss';

const FORM_KEY = 'checkout:form';

const fullName = (user) => `${user?.first_name || ''} ${user?.last_name || ''}`.trim();

const isNativeUser = (user) => Boolean(user?.id) && !user.isGuest
    && (user.platform === 'tg' || user.platform === 'vk');

const nativeContact = (user) => {
    if (user?.platform === 'vk') return `https://vk.com/im/convo/${user.id} \n${fullName(user)}`.trim();
    if (user?.username) return `@${user.username}`;

    return `${fullName(user) || 'Пользователь Telegram'} \ntg://user?id=${user?.id}`;
};

const contactHint = (user) => {
    if (user?.platform === 'vk') return `Напишем в VK — ${fullName(user) || 'вам в личные сообщения'}`;
    if (user?.username) return `Напишем в Telegram — @${user.username}`;

    return 'Напишем в Telegram — в этот же чат с ботом';
};

function PaymentOption({method, total, isActive, onSelect}) {
    const isAvailable = isMethodAvailable(method, total);
    const schedule = method.schedule ? splitSchedule(total) : null;

    return (
        <div className={`${style.payment} ${isActive ? style.paymentActive : ''} ${isAvailable ? '' : style.paymentLocked}`}>
            <button
                type="button"
                className={style.paymentHead}
                disabled={!isAvailable}
                aria-pressed={isActive}
                onClick={() => onSelect(method.key)}
            >
                <span
                    className={`${style.paymentMark} ${method.icon ? style.paymentMarkIcon : style[method.tone]}`}
                    style={method.icon
                        ? {backgroundImage: `url(${process.env.PUBLIC_URL}/payments/${method.icon}.png)`}
                        : undefined}
                    aria-hidden="true"
                />

                <span className={style.paymentBody}>
                    <span className={style.paymentTitle}>{method.title}</span>
                    <span className={style.paymentNote}>
                        {isAvailable ? method.note : `Доступно от ${money(method.minTotal)}`}
                    </span>
                </span>

                <span className={`${style.radio} ${isActive ? style.radioOn : ''}`} aria-hidden="true">✓</span>
            </button>

            {schedule ? (
                <div className={`${style.reveal} ${isActive ? style.revealOpen : ''}`}>
                    <div className={style.revealInner}>
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

                        {method.terms ? (
                            <p className={style.scheduleNote}>
                                График информационный и может отличаться от итогового при оформлении.{' '}
                                <a href={method.terms.url} target="_blank" rel="noreferrer">{method.terms.label}</a>
                            </p>
                        ) : null}
                    </div>
                </div>
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

export default function Checkout() {
    const navigate = useNavigate();
    const {contentSafeAreaInset, safeAreaInset} = useAppInsets();
    const {vkGroupId} = useTelegram();

    const userId = useSessionStore(selectUserId);
    const pageId = useSessionStore((state) => state.pageId);
    const user = useSessionStore((state) => state.user);
    const isVk = useSessionStore((state) => state.isVk);
    const platform = useSessionStore((state) => state.platform);

    const pages = useStructureStore((state) => state.pages);
    const catalogs = useStructureStore((state) => state.catalogs);

    const items = useCartStore((state) => state.items);
    const loadCart = useCartStore((state) => state.load);
    const reloadCart = useCartStore((state) => state.reload);

    const saved = useMemo(() => recallView(FORM_KEY) || {}, []);

    const hasNativeContact = isNativeUser(user);

    const [method, setMethod] = useState(saved.method || 'sbp');
    const [accountKind, setAccountKind] = useState(saved.accountKind || ACCOUNT_KINDS.NEW);
    const [accountValues, setAccountValues] = useState(saved.accountValues || {});
    const [channel, setChannel] = useState(saved.channel || (isVk ? 'vk' : 'telegram'));
    const [contactValue, setContactValue] = useState(saved.contactValue || '');
    const [email, setEmail] = useState(saved.email || '');
    const [isTouched, setTouched] = useState(false);

    const pageType = useMemo(
        () => (pages ? (pages.find((page) => page.id === pageId)?.type || null) : undefined),
        [pages, pageId]
    );

    const pageItems = useMemo(() => pageCartItems(items, catalogs, pageId), [items, catalogs, pageId]);

    const {promo, apply, clear} = usePromoMemory();
    const {quote, isLoading, error, retry} = useBasketQuote({items: pageItems, pageType, promo});

    const flow = useOrderFlow(userId);

    const scrollRef = useScrollMemory('checkout', {ready: pageItems !== null});

    useEffect(() => {
        loadCart(userId);
    }, [userId, loadCart]);

    useEffect(() => {
        rememberView(FORM_KEY, {method, accountKind, accountValues, channel, contactValue, email});
    }, [method, accountKind, accountValues, channel, contactValue, email]);

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

    const finishFlow = useCallback(() => {
        clear();
        closeFlow();
    }, [clear, closeFlow]);

    const retryFlow = useCallback(() => {
        flow.close();
        reloadCart(userId);
        navigate('/basket');
    }, [flow, navigate, reloadCart, userId]);

    const selected = findMethod(method);
    const isOnline = selected.isOnline;

    const contact = hasNativeContact
        ? nativeContact(user)
        : formatContact(channel, contactValue);

    const isContactReady = hasNativeContact || isContactValid(channel, contactValue);
    const isEmailReady = !isOnline || isEmailValid(email);
    const isAccountReady = isAccountFilled(pageType, accountKind, accountValues);
    const isReady = Boolean(userId) && isContactReady && isEmailReady && isAccountReady
        && total > 0 && !isLoading && !error;

    const blockReason = useMemo(() => {
        if (!isTouched || isReady) return null;
        if (!userId) return 'Не удалось определить ваш профиль — перезапустите приложение';
        if (!isAccountReady) return 'Заполните логин и пароль от аккаунта выше';
        if (!isContactReady) return 'Укажите контакт для связи';
        if (!isEmailReady) return 'Укажите почту для чека';

        return null;
    }, [isTouched, isReady, userId, isAccountReady, isContactReady, isEmailReady]);

    const submit = useCallback(() => {
        setTouched(true);

        if (!isReady || flow.isSending) return;

        hapticImpact('medium');

        const handle = hasNativeContact
            ? user?.username
            : (channel === 'telegram' ? contactHandle(channel, contactValue) : undefined);

        flow.submit({
            platform,
            vkGroupId: isVk ? vkGroupId : undefined,
            pageId,
            contact,
            username: handle || undefined,
            accountData: buildAccountData(pageType, accountKind, accountValues),
            email: email.trim() || undefined,
            paymentMethod: method,
            promoCode: quote?.promo?.name || undefined
        }, {
            items: (pageItems || []).map((item) => ({
                id: item.id,
                name: item.name,
                count: item.count,
                image: item.image || null,
                platform: item.platform || null,
                typeLabel: item.typeLabel || null,
                sum: unitPrice(item) * item.count
            })),
            positions: quote?.positions || [],
            itemsTotal: quote?.itemsTotal ?? total,
            discount: quote?.discount ?? 0,
            promo: quote?.promo || null,
            paymentTitle: selected.title,
            total
        });
    }, [
        accountKind, accountValues, channel, contact, contactValue, email, flow, hasNativeContact,
        isReady, isVk, method, pageId, pageItems, pageType, platform, quote, selected, total, user, vkGroupId
    ]);

    if (flow.screen === SCREEN.WAITING) {
        return <PaymentWaiting order={flow.order} onOpenAgain={flow.openAgain} onCancel={flow.cancel}/>;
    }

    if (flow.screen === SCREEN.SUCCESS) {
        return <PaymentSuccess order={flow.order} snapshot={flow.snapshot} onClose={finishFlow}/>;
    }

    if (flow.screen === SCREEN.FAIL) {
        return <PaymentFail order={flow.order} onRetry={retryFlow} onClose={closeFlow}/>;
    }

    if (flow.screen === SCREEN.ACCEPTED) {
        return <OrderAccepted order={flow.order} snapshot={flow.snapshot} onClose={finishFlow}/>;
    }

    if (pageItems !== null && pageItems.length === 0) {
        return (
            <div className={style.screen}>
                <div
                    className={style.header}
                    style={{paddingTop: `calc(${contentSafeAreaInset.top}px + 14 * var(--u))`}}
                >
                    {hasNativeBack ? null : <BackPill className={style.back} onClick={back}/>}
                    <h1 className={style.title}>Оформление заказа</h1>
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
                <h1 className={style.title}>Оформление заказа</h1>
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
                    isTouched={isTouched}
                    onKind={setAccountKind}
                    onChange={(key, value) => setAccountValues((prev) => ({...prev, [key]: value}))}
                />

                <section className={style.block}>
                    <h2 className={style.blockTitle}>Связь с вами</h2>

                    <div className={style.card}>
                        {hasNativeContact ? (
                            <p className={style.hint}>{contactHint(user)}</p>
                        ) : (
                            <>
                                {platform === 'tg' ? (
                                    <p className={style.hint}>
                                        Не удалось прочитать ваш профиль Telegram — оставьте контакт,
                                        чтобы менеджер вас нашёл.
                                    </p>
                                ) : null}

                                <ContactField
                                    channel={channel}
                                    value={contactValue}
                                    isTouched={isTouched}
                                    onChannel={setChannel}
                                    onChange={setContactValue}
                                />
                            </>
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
                                <span key={position.sum} className={style.orderSum}>{money(position.sum)}</span>
                            </div>
                        ))}
                    </div>
                </section>

                <PromoField promo={quote?.promo || null} onApply={apply} onClear={clear}/>

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
                        <span key={total} className={style.actionTotal}>{money(total)}</span>
                    </span>
                </div>

                {blockReason ? <p className={style.actionError}>{blockReason}</p> : null}
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
