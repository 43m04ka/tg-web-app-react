import React, {useCallback, useEffect, useMemo, useState} from 'react';
import {useLocation, useNavigate} from 'react-router-dom';
import {useSessionStore, selectUserId} from '../../../store/useSessionStore';
import {recallView, rememberView} from '../../../shared/lib/viewMemory';
import EmptyState from '../../../shared/ui/EmptyState/EmptyState';
import {usePaymentMethods} from '../../../shared/hooks/usePaymentMethods';
import {isEmailValid, isMethodAvailable, methodUnavailableReason, money} from '../../../pages/Basket/cartModel';
import {
    bestValueOffer,
    denomLabelOf,
    groupLabelOf,
    isManual,
    isSellable,
    kindLabel,
    monthlyPrice,
    priceNoteOf,
    resolveSelection,
    servicesFaq,
    stockLabel,
    themeOf,
    themeVars
} from '../../../pages/Services/servicesModel';
import {useCodeCatalog} from '../../../pages/Services/useCodeCatalog';
import {SCREEN, useCodeOrder} from '../../../pages/Services/useCodeOrder';
import {useScrollMemory} from '../../shell/ScrollAreaContext';
import Spinner from '../../ui/Spinner';
import {CodeDoneDesktop, CodeFailDesktop, CodeStalledDesktop, CodeWaitingDesktop} from './ServicesStates';
import style from './DesktopServices.module.scss';

const FORM_KEY = 'services:form';

const fullName = (user) => `${user?.first_name || ''} ${user?.last_name || ''}`.trim();

const nativeContact = (user) => {
    if (!user?.id || user.isGuest) return null;
    if (user.platform === 'vk') return `https://vk.com/im/convo/${user.id} \n${fullName(user)}`.trim();
    if (user.platform !== 'tg') return null;
    if (user.username) return `@${user.username}`;

    return `${fullName(user) || 'Пользователь Telegram'} \ntg://user?id=${user.id}`;
};

const RegionMark = ({region}) => {
    if (region?.icon) return <img className={style.regionIcon} src={region.icon} alt=""/>;
    if (region?.flag) return <span className={style.regionFlag}>{region.flag}</span>;

    return null;
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

export default function DesktopServices() {
    const navigate = useNavigate();
    const location = useLocation();

    const userId = useSessionStore(selectUserId);
    const user = useSessionStore((state) => state.user);
    const platform = useSessionStore((state) => state.platform);
    const botType = useSessionStore((state) => state.botType);

    const {brands, error, retry} = useCodeCatalog();

    const target = useMemo(() => location.state || {}, [location.state]);
    const isSingle = Boolean(target.single);

    const saved = useMemo(() => (isSingle ? target : recallView(FORM_KEY) || {}), [isSingle, target]);

    const [brandId, setBrandId] = useState(saved.brandId ?? null);
    const [kind, setKind] = useState(saved.kind ?? null);
    const [regionName, setRegionName] = useState(saved.regionName ?? null);
    const [groupName, setGroupName] = useState(saved.groupName ?? null);
    const [offerId, setOfferId] = useState(saved.offerId ?? null);
    const [email, setEmail] = useState(saved.email || '');
    const [isTouched, setTouched] = useState(false);

    const flow = useCodeOrder(userId);

    useScrollMemory('services', {ready: brands !== null});

    const view = useMemo(
        () => resolveSelection(brands, {brandId, kind, regionName, groupName, offerId}),
        [brands, brandId, kind, regionName, groupName, offerId]
    );

    const {brand, brandIndex, kinds, regions, groups, groupKey, groupName: viewGroupName, offers, offer} = view;

    const payment = usePaymentMethods({platform, scenario: 'services', total: offer?.price ?? 0});

    useEffect(() => {
        if (isSingle) return;

        rememberView(FORM_KEY, {
            brandId: brand?.id ?? null,
            kind: view.kind,
            regionName: view.regionName,
            groupName: view.groupKey,
            offerId: offer?.id ?? null,
            email
        });
    }, [isSingle, brand, view.kind, view.regionName, view.groupKey, offer, email]);

    const back = useCallback(() => {
        if (isSingle) navigate(-1);
        else navigate('/');
    }, [isSingle, navigate]);

    const pickBrand = useCallback((item) => {
        setBrandId(item.id);
        setKind(null);
        setRegionName(null);
        setGroupName(null);
        setOfferId(null);
    }, []);

    const isEmailReady = isEmailValid(email);
    const isStockReady = isSellable(offer);
    const isReady = Boolean(userId) && isStockReady && isEmailReady;

    const blockReason = useMemo(() => {
        if (!isTouched || isReady) return null;
        if (!userId) return 'Не удалось определить ваш профиль — перезапустите приложение';
        if (!offer) return 'Выберите номинал';
        if (!isStockReady) return 'Этот номинал закончился — выберите другой';
        if (!isEmailReady) return 'Укажите почту для чека';

        return null;
    }, [isTouched, isReady, userId, offer, isStockReady, isEmailReady]);

    const submit = useCallback(() => {
        setTouched(true);

        if (!isReady || flow.isSending) return;

        flow.submit({
            platform,
            contact: nativeContact(user) || `Почта: ${email.trim()}`,
            username: user?.username || undefined,
            email: email.trim(),
            offerId: offer.id,
            paymentMethod: payment.method,
            quantity: 1
        }, {
            title: [brand?.name, offer.groupName, offer.denomination].filter(Boolean).join(' · '),
            manual: isManual(offer)
        });
    }, [isReady, flow, platform, user, email, offer, brand, payment.method]);

    if (flow.screen === SCREEN.WAITING) {
        return <CodeWaitingDesktop order={flow.order} onOpenAgain={flow.openAgain} onCancel={flow.cancel}/>;
    }

    if (flow.screen === SCREEN.DONE) {
        return <CodeDoneDesktop order={flow.order} botType={botType} onClose={flow.close}/>;
    }

    if (flow.screen === SCREEN.FAIL) {
        return <CodeFailDesktop order={flow.order} onRetry={flow.close} onClose={back}/>;
    }

    if (flow.screen === SCREEN.STALLED) {
        return <CodeStalledDesktop order={flow.order} botType={botType} onClose={flow.close}/>;
    }

    const theme = themeOf(brand, brandIndex);
    const best = view.kind === 'subscription' ? bestValueOffer(offers) : null;

    const pageTitle = isSingle && brand
        ? brand.name
        : view.kind === 'subscription' ? 'Подписки' : 'Коды пополнения';

    const heroImage = offer?.image || offers.find((item) => item.image)?.image || target.poster || null;

    if (error) {
        return (
            <EmptyState
                tone="danger"
                icon="⚠"
                title="Витрина не загрузилась"
                text="Проверьте связь и попробуйте ещё раз."
                actionLabel="Повторить"
                onAction={retry}
            />
        );
    }

    if (brands === null) {
        return (
            <div className={style.screen}>
                <div className={style.skeletonHead}/>
                <div className={style.body}>
                    <div className={style.skeletonHero}/>
                    <div className={style.skeletonPanel}/>
                </div>
            </div>
        );
    }

    if (brands.length === 0 || !brand) {
        return (
            <EmptyState
                icon="🎁"
                title="Здесь пока пусто"
                text="Коды пополнения ещё не завезли. Загляните чуть позже."
                actionLabel="На главную"
                onAction={back}
            />
        );
    }

    return (
        <div className={style.screen} style={themeVars(theme)}>
            <header className={style.head}>
                <h1 className={style.title}>{pageTitle}</h1>
            </header>

            {isSingle ? null : (
                <div className={style.brands}>
                    {brands.map((item, index) => {
                        const isActive = item.id === brand.id;

                        return (
                            <button
                                key={item.id}
                                type="button"
                                className={isActive ? `${style.brand} ${style.brandActive}` : style.brand}
                                aria-pressed={isActive}
                                style={{...themeVars(themeOf(item, index)), '--i': index}}
                                onClick={() => pickBrand(item)}
                            >
                                <span className={style.brandTile}>
                                    {item.icon
                                        ? <img className={style.brandImage} src={item.icon} alt=""/>
                                        : item.glyph}
                                </span>
                                <span className={style.brandName}>{item.name}</span>
                            </button>
                        );
                    })}
                </div>
            )}

            <div className={style.body}>
                <div className={style.main}>
                    <div className={heroImage ? `${style.hero} ${style.heroShot}` : style.hero}>
                        {heroImage ? (
                            <>
                                <span
                                    className={style.heroArt}
                                    style={{backgroundImage: `url(${heroImage})`}}
                                    aria-hidden="true"
                                />
                                <span className={style.heroVeil} aria-hidden="true"/>
                            </>
                        ) : null}

                        <div className={style.heroTop}>
                            <span className={style.heroGlyph}>
                                {brand.icon
                                    ? <img className={style.heroImage} src={brand.icon} alt=""/>
                                    : brand.glyph}
                            </span>

                            <div className={style.heroTitles}>
                                <span className={style.heroKind}>
                                    {[kindLabel(view.kind), viewGroupName].filter(Boolean).join(' · ')}
                                </span>
                                <span className={style.heroName}>{brand.name}</span>
                            </div>
                        </div>

                        <div className={style.heroBottom}>
                            <div className={style.heroDenom}>
                                <span className={style.heroDenomLabel}>{denomLabelOf(view.kind)}</span>
                                <span className={style.heroDenomValue}>{offer?.denomination || '—'}</span>
                            </div>

                            {view.regionName ? (
                                <span className={style.heroRegion}>
                                    <RegionMark region={regions.find((item) => item.name === view.regionName)}/>
                                    {view.regionName}
                                </span>
                            ) : null}
                        </div>
                    </div>

                    {kinds.length > 1 ? (
                        <section className={style.block}>
                            <h2 className={style.blockTitle}>Тип товара</h2>

                            <div className={style.chips}>
                                {kinds.map((value) => (
                                    <button
                                        key={value}
                                        type="button"
                                        className={value === view.kind ? `${style.chip} ${style.chipActive}` : style.chip}
                                        aria-pressed={value === view.kind}
                                        onClick={() => {
                                            setKind(value);
                                            setRegionName(null);
                                            setGroupName(null);
                                            setOfferId(null);
                                        }}
                                    >
                                        {kindLabel(value)}
                                    </button>
                                ))}
                            </div>
                        </section>
                    ) : null}

                    {regions.length > 1 ? (
                        <section className={style.block}>
                            <h2 className={style.blockTitle}>Регион</h2>

                            <div className={style.chips}>
                                {regions.map((item) => (
                                    <button
                                        key={item.name}
                                        type="button"
                                        className={item.name === view.regionName
                                            ? `${style.chip} ${style.chipActive}`
                                            : style.chip}
                                        aria-pressed={item.name === view.regionName}
                                        onClick={() => {
                                            setRegionName(item.name);
                                            setGroupName(null);
                                            setOfferId(null);
                                        }}
                                    >
                                        <RegionMark region={item}/>
                                        {item.name}
                                    </button>
                                ))}
                            </div>
                        </section>
                    ) : null}

                    {groups.length > 1 ? (
                        <section className={style.block}>
                            <h2 className={style.blockTitle}>{groupLabelOf(brand)}</h2>

                            <div className={style.chips}>
                                {groups.map((item) => (
                                    <button
                                        key={item.key}
                                        type="button"
                                        className={item.key === groupKey ? `${style.chip} ${style.chipActive}` : style.chip}
                                        aria-pressed={item.key === groupKey}
                                        onClick={() => {
                                            setGroupName(item.key);
                                            setOfferId(null);
                                        }}
                                    >
                                        {item.name}
                                    </button>
                                ))}
                            </div>
                        </section>
                    ) : null}

                    <section className={style.block}>
                        <div className={style.blockHead}>
                            <h2 className={style.blockTitle}>{denomLabelOf(view.kind)}</h2>
                            <span className={style.blockNote}>{priceNoteOf(view.kind)}</span>
                        </div>

                        <div className={style.offers}>
                            {offers.map((item, index) => {
                                const isActive = item.id === offer?.id;
                                const isOut = !isSellable(item);

                                return (
                                    <button
                                        key={item.id}
                                        type="button"
                                        className={[
                                            style.offer,
                                            isActive ? style.offerActive : '',
                                            isOut ? style.offerOut : ''
                                        ].filter(Boolean).join(' ')}
                                        style={{'--i': index}}
                                        aria-pressed={isActive}
                                        disabled={isOut}
                                        onClick={() => setOfferId(item.id)}
                                    >
                                        <span className={isActive ? `${style.offerDot} ${style.offerDotOn}` : style.offerDot}>
                                            {isActive ? '✓' : ''}
                                        </span>

                                        <span className={style.offerName}>
                                            {item.denomination}
                                            {best && item.id === best.id ? (
                                                <span className={style.offerBadge}>Выгодно</span>
                                            ) : null}
                                        </span>

                                        <span className={style.offerPrices}>
                                            <span className={style.offerPrice}>{money(item.price)}</span>
                                            {item.oldPrice ? (
                                                <span className={style.offerOldPrice}>{money(item.oldPrice)}</span>
                                            ) : null}
                                        </span>

                                        <span className={isOut ? `${style.offerStock} ${style.offerStockOut}` : style.offerStock}>
                                            {monthlyPrice(item)
                                                ? `${money(monthlyPrice(item))} в месяц`
                                                : stockLabel(item)}
                                        </span>
                                    </button>
                                );
                            })}
                        </div>
                    </section>

                    <section className={style.block}>
                        <h2 className={style.blockTitle}>Часто спрашивают</h2>
                        <Faq items={servicesFaq(brand, view.regionName, offer)}/>
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
                    <span className={style.panelTitle}>Заказ</span>

                    <div className={style.pick}>
                        <span className={style.pickLabel}>{brand.name}</span>
                        <span className={style.pickValue}>{offer?.denomination || 'Выберите номинал'}</span>
                    </div>

                    <label className={style.field}>
                        <span className={style.fieldLabel}>E-mail для чека</span>
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
                            <span className={style.fieldError}>Проверьте адрес почты</span>
                        ) : null}
                    </label>

                    {payment.hasChoice ? (
                        <div className={style.payments}>
                            {payment.methods.map((option) => {
                                const isAvailable = isMethodAvailable(option, offer?.price ?? 0);
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
                                        disabled={!isAvailable}
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
                                    </button>
                                );
                            })}
                        </div>
                    ) : null}

                    <span className={style.divider} aria-hidden="true"/>

                    <div className={style.totalRow}>
                        <span className={style.totalLabel}>К оплате</span>
                        <span key={offer?.price} className={style.totalValue}>
                            {offer ? money(offer.price) : '—'}
                        </span>
                    </div>

                    {blockReason ? <p className={style.error}>{blockReason}</p> : null}
                    {flow.error ? <p className={style.error}>{flow.error}</p> : null}

                    <button
                        type="button"
                        className={style.primary}
                        disabled={flow.isSending || !offers.length}
                        onClick={submit}
                    >
                        {flow.isSending ? <Spinner/> : null}
                        {flow.isSending ? 'Создаём заказ…' : 'Оплатить'}
                    </button>
                </aside>
            </div>
        </div>
    );
}
