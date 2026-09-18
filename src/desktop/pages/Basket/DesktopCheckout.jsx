import React, {useCallback, useEffect, useMemo, useState} from 'react';
import {useNavigate} from 'react-router-dom';
import {useSessionStore, selectUserId} from '../../../store/useSessionStore';
import {useStructureStore} from '../../../store/useStructureStore';
import {useCartStore} from '../../../store/useCartStore';
import {useTelegram} from '../../../shared/hooks/useTelegram';
import {recallView, rememberView} from '../../../shared/lib/viewMemory';
import EmptyState from '../../../shared/ui/EmptyState/EmptyState';
import {fetchPaymentMethods} from '../../../shared/api/payments';
import {
    ACCOUNT_KINDS,
    CONTACT_CHANNELS,
    accountForm,
    buildAccountData,
    contactHandle,
    faqFor,
    findChannel,
    findMethod,
    formatContact,
    isAccountFilled,
    isContactValid,
    isEmailValid,
    isMethodAvailable,
    methodUnavailableReason,
    money,
    normalizeMethods,
    pageCartItems,
    splitSchedule
} from '../../../pages/Basket/cartModel';
import {CHANNEL_ICONS} from '../../../pages/Basket/ContactIcons';
import {unitPrice} from '../../../pages/Basket/quoteLocal';
import {useBasketQuote} from '../../../pages/Basket/useBasketQuote';
import {usePromoMemory} from '../../../pages/Basket/usePromoMemory';
import {useOrderFlow, SCREEN} from '../../../pages/Basket/useOrderFlow';
import {useScrollMemory} from '../../shell/ScrollAreaContext';
import Spinner from '../../ui/Spinner';
import DesktopPromo from './DesktopPromo';
import {DesktopAccepted, DesktopFail, DesktopSuccess, DesktopWaiting} from './CheckoutStates';
import style from './DesktopCheckout.module.scss';

const FORM_KEY = 'checkout:form';
const REQUIRED_KEYS = ['login', 'password'];

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

function PaymentOption({method, total, isActive, index, onSelect}) {
    const isAvailable = isMethodAvailable(method, total);
    const schedule = method.schedule ? splitSchedule(total) : null;

    return (
        <div
            className={[style.payment, isActive ? style.paymentActive : '', isAvailable ? '' : style.paymentLocked]
                .filter(Boolean)
                .join(' ')}
            style={{'--i': index}}
        >
            <button
                type="button"
                className={style.paymentHead}
                disabled={!isAvailable}
                aria-pressed={isActive}
                onClick={() => onSelect(method.key)}
            >
                <span
                    className={style.paymentMark}
                    style={method.icon
                        ? {backgroundImage: `url(${process.env.PUBLIC_URL}/payments/${method.icon}.png)`}
                        : undefined}
                    aria-hidden="true"
                />

                <span className={style.paymentBody}>
                    <span className={style.paymentTitle}>{method.title}</span>
                    <span className={style.paymentNote}>
                        {isAvailable ? method.note : methodUnavailableReason(method, money)}
                    </span>
                </span>

                <span className={isActive ? `${style.radio} ${style.radioOn}` : style.radio} aria-hidden="true">✓</span>
            </button>

            {schedule ? (
                <div className={isActive ? `${style.reveal} ${style.revealOpen}` : style.reveal}>
                    <div className={style.revealInner}>
                        <div className={style.schedule}>
                            {schedule.map((part, partIndex) => (
                                <div key={part.label} className={style.schedulePart}>
                                    <span
                                        className={partIndex === 0
                                            ? `${style.scheduleBar} ${style.scheduleBarPaid}`
                                            : style.scheduleBar}
                                    />
                                    <span className={style.scheduleSum}>{money(part.amount)}</span>
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

function AccountBlock({pageType, kind, values, isTouched, onKind, onChange}) {
    const form = accountForm(pageType);
    if (!form) return null;

    const isNew = kind === ACCOUNT_KINDS.NEW;
    const shortFields = form.fields.filter((field) => field.short);
    const longFields = form.fields.filter((field) => !field.short);

    const isMissing = (field) => !isNew && isTouched
        && REQUIRED_KEYS.includes(field.key)
        && String(values[field.key] || '').trim() === '';

    const missingCount = form.fields.filter(isMissing).length;

    return (
        <section className={style.block}>
            <h2 className={style.blockTitle}>Куда оформить заказ</h2>

            <div className={style.switcher}>
                <span className={isNew ? style.switcherPill : `${style.switcherPill} ${style.switcherPillRight}`}/>

                <button
                    type="button"
                    className={isNew ? `${style.switcherButton} ${style.switcherActive}` : style.switcherButton}
                    onClick={() => onKind(ACCOUNT_KINDS.NEW)}
                >
                    Новый аккаунт
                </button>

                <button
                    type="button"
                    className={isNew ? style.switcherButton : `${style.switcherButton} ${style.switcherActive}`}
                    onClick={() => onKind(ACCOUNT_KINDS.OWN)}
                >
                    На мой аккаунт
                </button>
            </div>

            <div className={style.card}>
                <p key={isNew ? 'new' : 'own'} className={style.hint}>{isNew ? form.newHint : form.ownHint}</p>

                <div className={isNew ? style.reveal : `${style.reveal} ${style.revealOpen}`}>
                    <div className={style.revealInner}>
                        <div className={style.fields}>
                            {longFields.map((field) => (
                                <input
                                    key={field.key}
                                    className={isMissing(field) ? `${style.input} ${style.inputBad}` : style.input}
                                    value={values[field.key] || ''}
                                    placeholder={field.placeholder}
                                    autoComplete="off"
                                    autoCapitalize="none"
                                    spellCheck="false"
                                    tabIndex={isNew ? -1 : undefined}
                                    onChange={(event) => onChange(field.key, event.target.value)}
                                />
                            ))}

                            {shortFields.length ? (
                                <div className={style.fieldsRow}>
                                    {shortFields.map((field) => (
                                        <input
                                            key={field.key}
                                            className={`${style.input} ${style.inputShort}`}
                                            value={values[field.key] || ''}
                                            placeholder={field.placeholder}
                                            maxLength={field.maxLength}
                                            inputMode="numeric"
                                            autoComplete="off"
                                            tabIndex={isNew ? -1 : undefined}
                                            onChange={(event) => onChange(field.key, event.target.value)}
                                        />
                                    ))}
                                </div>
                            ) : null}

                            {missingCount > 0 ? (
                                <span className={style.fieldError}>
                                    Заполните логин и пароль от аккаунта {form.service} — без них заказ не оформить
                                </span>
                            ) : null}

                            <a
                                className={style.guide}
                                href={form.guide.url}
                                target="_blank"
                                rel="noreferrer"
                                tabIndex={isNew ? -1 : undefined}
                            >
                                {form.guide.label}
                                <span className={style.guideArrow} aria-hidden="true">→</span>
                            </a>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
}

function ContactBlock({channel, value, isTouched, onChannel, onChange}) {
    const active = findChannel(channel);
    const isValid = isContactValid(active.key, value);
    const isBad = isTouched && !isValid;

    return (
        <div className={style.contact}>
            <div className={style.channels} role="tablist">
                {CONTACT_CHANNELS.map((option) => {
                    const Icon = CHANNEL_ICONS[option.key];
                    const isActive = option.key === active.key;

                    return (
                        <button
                            key={option.key}
                            type="button"
                            role="tab"
                            aria-selected={isActive}
                            className={isActive ? `${style.channel} ${style.channelActive}` : style.channel}
                            onClick={() => {
                                if (!isActive) onChannel(option.key);
                            }}
                        >
                            <Icon className={style.channelIcon}/>
                            <span>{option.title}</span>
                        </button>
                    );
                })}
            </div>

            <label key={active.key} className={style.field}>
                <span className={style.fieldLabel}>{active.label}</span>

                <span className={isBad ? `${style.contactInput} ${style.inputBad}` : style.contactInput}>
                    {active.key === 'telegram' ? <span className={style.contactPrefix}>@</span> : null}

                    <input
                        className={style.bareInput}
                        value={value}
                        type={active.key === 'phone' ? 'tel' : 'text'}
                        placeholder={active.placeholder}
                        autoComplete={active.key === 'email' ? 'email' : 'off'}
                        autoCapitalize="none"
                        autoCorrect="off"
                        spellCheck="false"
                        onChange={(event) => onChange(event.target.value)}
                    />

                    <span
                        className={isValid ? `${style.contactCheck} ${style.contactCheckOn}` : style.contactCheck}
                        aria-hidden="true"
                    >
                        ✓
                    </span>
                </span>

                <span className={isBad ? `${style.contactNote} ${style.contactNoteBad}` : style.contactNote}>
                    {isBad ? active.error : active.note}
                </span>
            </label>
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

export default function DesktopCheckout() {
    const navigate = useNavigate();
    const {vkGroupId} = useTelegram();

    const userId = useSessionStore((state) => selectUserId(state));
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
    const [methods, setMethods] = useState(() => normalizeMethods(null));

    const pageType = useMemo(
        () => (pages ? (pages.find((page) => page.id === pageId)?.type || null) : undefined),
        [pages, pageId]
    );

    const pageItems = useMemo(() => pageCartItems(items, catalogs, pageId), [items, catalogs, pageId]);

    const {promo, apply, clear} = usePromoMemory();
    const {quote, isLoading, error, retry} = useBasketQuote({items: pageItems, pageType, promo});

    const flow = useOrderFlow(userId);

    useScrollMemory('checkout', {ready: pageItems !== null});

    useEffect(() => {
        loadCart(userId);
    }, [userId, loadCart]);

    useEffect(() => {
        rememberView(FORM_KEY, {method, accountKind, accountValues, channel, contactValue, email});
    }, [method, accountKind, accountValues, channel, contactValue, email]);

    const total = quote?.total ?? 0;

    useEffect(() => {
        if (!pageId) return undefined;

        const controller = new AbortController();

        fetchPaymentMethods({platform, scenario: 'catalog', pageId}, controller.signal)
            .then((list) => {
                if (!controller.signal.aborted) setMethods(normalizeMethods(list));
            })
            .catch(() => undefined);

        return () => controller.abort();
    }, [pageId, platform]);

    useEffect(() => {
        const current = findMethod(methods, method);
        const usable = total <= 0 || isMethodAvailable(current, total);

        if (current.key !== method || !usable) {
            const next = methods.find((option) => isMethodAvailable(option, total)) || methods[0];
            if (next && next.key !== method) setMethod(next.key);
        }
    }, [method, methods, total]);

    const closeFlow = useCallback(() => {
        flow.close();
        reloadCart(userId);
        navigate('/');
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

    const selected = findMethod(methods, method);
    const needsEmail = selected.requiresEmail;
    const isOnline = selected.flow === 'auto';

    const contact = hasNativeContact ? nativeContact(user) : formatContact(channel, contactValue);

    const isContactReady = hasNativeContact || isContactValid(channel, contactValue);
    const isEmailReady = !needsEmail || isEmailValid(email);
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
        return <DesktopWaiting order={flow.order} onOpenAgain={flow.openAgain} onCancel={flow.cancel}/>;
    }

    if (flow.screen === SCREEN.SUCCESS) {
        return <DesktopSuccess order={flow.order} snapshot={flow.snapshot} onClose={finishFlow}/>;
    }

    if (flow.screen === SCREEN.FAIL) {
        return <DesktopFail order={flow.order} onRetry={retryFlow} onClose={closeFlow}/>;
    }

    if (flow.screen === SCREEN.ACCEPTED) {
        return <DesktopAccepted order={flow.order} snapshot={flow.snapshot} onClose={finishFlow}/>;
    }

    if (pageItems !== null && pageItems.length === 0) {
        return (
            <div className={style.screen}>
                <h1 className={style.title}>Оформление заказа</h1>

                <EmptyState
                    icon="🛒"
                    title="Корзина опустела"
                    text="Оформлять нечего — добавьте товары и возвращайтесь."
                    actionLabel="Перейти к покупкам"
                    onAction={() => navigate('/')}
                />
            </div>
        );
    }

    return (
        <div className={style.screen}>
            <header className={style.head}>
                <button type="button" className={style.back} onClick={() => navigate('/basket')}>
                    <span aria-hidden="true">←</span>
                    Назад в корзину
                </button>

                <h1 className={style.title}>Оформление заказа</h1>
            </header>

            <div className={style.body}>
                <div className={style.main}>
                    <section className={style.block}>
                        <h2 className={style.blockTitle}>Способ оплаты</h2>

                        <div className={style.payments}>
                            {methods.map((option, index) => (
                                <PaymentOption
                                    key={option.key}
                                    method={option}
                                    index={index}
                                    total={total}
                                    isActive={option.key === method}
                                    onSelect={setMethod}
                                />
                            ))}
                        </div>
                    </section>

                    <AccountBlock
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
                                <ContactBlock
                                    channel={channel}
                                    value={contactValue}
                                    isTouched={isTouched}
                                    onChannel={setChannel}
                                    onChange={setContactValue}
                                />
                            )}

                            {needsEmail ? (
                                <label className={style.field}>
                                    <span className={style.fieldLabel}>Почта для чека</span>
                                    <input
                                        className={isTouched && !isEmailReady
                                            ? `${style.input} ${style.inputBad}`
                                            : style.input}
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

                <aside className={style.panel}>
                    <span className={style.panelTitle}>Ваш заказ</span>

                    <div className={style.orderList}>
                        {(quote?.positions || []).map((position, index) => (
                            <div
                                key={`${position.name}-${index}`}
                                className={style.orderRow}
                                style={{'--i': index}}
                            >
                                <span className={style.orderName}>{position.name}</span>
                                {position.quantity > 1 ? (
                                    <span className={style.orderMeta}>{position.quantity} шт.</span>
                                ) : null}
                                <span key={position.sum} className={style.orderSum}>{money(position.sum)}</span>
                            </div>
                        ))}
                    </div>

                    <DesktopPromo promo={quote?.promo || null} onApply={apply} onClear={clear}/>

                    <span className={style.divider} aria-hidden="true"/>

                    <div className={style.totalsRow}>
                        <span className={style.totalsLabel}>К оплате</span>
                        <span className={style.totalsPrices}>
                            {quote?.discount > 0 ? (
                                <span className={style.totalsOld}>{money(quote.itemsTotal)}</span>
                            ) : null}
                            <span key={total} className={style.totalsFinal}>{money(total)}</span>
                        </span>
                    </div>

                    {blockReason ? <p className={style.error}>{blockReason}</p> : null}
                    {flow.error ? <p className={style.error}>{flow.error}</p> : null}

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
                        {flow.isSending ? <Spinner/> : null}
                        {flow.isSending ? 'Оформляем…' : isOnline ? 'Перейти к оплате' : 'Оформить заказ'}
                    </button>
                </aside>
            </div>
        </div>
    );
}
