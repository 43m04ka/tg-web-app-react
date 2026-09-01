import React, {useCallback, useEffect, useMemo, useState} from 'react';
import {useNavigate} from 'react-router-dom';
import {useSessionStore, selectUserId} from '../../store/useSessionStore';
import {useAppInsets} from '../../shared/hooks/useAppInsets';
import {useBackButton} from '../../shared/hooks/useBackButton';
import {useScrollMemory} from '../../shared/hooks/useScrollMemory';
import {hapticImpact, hapticSelection} from '../../shared/lib/haptic';
import {recallView, rememberView} from '../../shared/lib/viewMemory';
import BackPill from '../../shared/ui/BackPill/BackPill';
import EmptyState from '../../shared/ui/EmptyState/EmptyState';
import {isEmailValid, money} from '../Basket/cartModel';
import {CodeDone, CodeFail, CodeStalled, CodeWaiting} from './ServicesScreens';
import {
    deliveryLabelOf,
    denomLabelOf,
    groupLabelOf,
    groupsOf,
    isManual,
    isSellable,
    kindLabel,
    kindsOf,
    offersOf,
    priceNoteOf,
    regionsOf,
    stockLabel,
    toneOf
} from './servicesModel';
import {useCodeCatalog} from './useCodeCatalog';
import {SCREEN, useCodeOrder} from './useCodeOrder';
import style from './Services.module.scss';

const FORM_KEY = 'services:form';

const RegionMark = ({region}) => {
    if (region?.icon) return <img className={style.regionIcon} src={region.icon} alt=""/>;
    if (region?.flag) return <span className={style.regionFlag}>{region.flag}</span>;

    return null;
};

const fullName = (user) => `${user?.first_name || ''} ${user?.last_name || ''}`.trim();

const nativeContact = (user) => {
    if (!user?.id || user.isGuest) return null;
    if (user.platform === 'vk') return `https://vk.com/im/convo/${user.id} \n${fullName(user)}`.trim();
    if (user.platform !== 'tg') return null;
    if (user.username) return `@${user.username}`;

    return `${fullName(user) || 'Пользователь Telegram'} \ntg://user?id=${user.id}`;
};

export default function Services() {
    const navigate = useNavigate();
    const {contentSafeAreaInset, safeAreaInset} = useAppInsets();

    const userId = useSessionStore(selectUserId);
    const user = useSessionStore((state) => state.user);
    const platform = useSessionStore((state) => state.platform);
    const botType = useSessionStore((state) => state.botType);

    const {brands, error, retry} = useCodeCatalog();

    const saved = useMemo(() => recallView(FORM_KEY) || {}, []);

    const [brandId, setBrandId] = useState(saved.brandId ?? null);
    const [kind, setKind] = useState(saved.kind ?? null);
    const [regionName, setRegionName] = useState(saved.regionName ?? null);
    const [groupName, setGroupName] = useState(saved.groupName ?? null);
    const [offerId, setOfferId] = useState(saved.offerId ?? null);
    const [email, setEmail] = useState(saved.email || '');
    const [isTouched, setTouched] = useState(false);

    const flow = useCodeOrder(userId);
    const scrollRef = useScrollMemory('services', {ready: brands !== null});

    const brand = useMemo(
        () => (brands || []).find((item) => item.id === brandId) || (brands || [])[0] || null,
        [brands, brandId]
    );

    const kinds = useMemo(() => kindsOf(brand), [brand]);
    const activeKind = kinds.includes(kind) ? kind : kinds[0] || null;

    const regions = useMemo(() => regionsOf(brand, activeKind), [brand, activeKind]);
    const activeRegion = regions.some((item) => item.name === regionName)
        ? regionName
        : regions[0]?.name || null;

    const groups = useMemo(() => groupsOf(brand, activeKind, activeRegion), [brand, activeKind, activeRegion]);
    const activeGroup = groups.some((item) => item.key === groupName) ? groupName : (groups[0]?.key ?? null);
    const activeGroupName = groups.find((item) => item.key === activeGroup)?.key || null;

    const offers = useMemo(
        () => offersOf(brand, activeKind, activeRegion, activeGroup),
        [brand, activeKind, activeRegion, activeGroup]
    );

    const offer = useMemo(
        () => offers.find((item) => item.id === offerId) || offers.find(isSellable) || offers[0] || null,
        [offers, offerId]
    );

    useEffect(() => {
        rememberView(FORM_KEY, {
            brandId: brand?.id ?? null,
            kind: activeKind,
            regionName: activeRegion,
            groupName: activeGroup,
            offerId: offer?.id ?? null,
            email
        });
    }, [brand, activeKind, activeRegion, activeGroup, offer, email]);

    const back = useCallback(() => {
        hapticImpact('light');
        navigate('/');
    }, [navigate]);

    const hasNativeBack = useBackButton(back, {enabled: flow.screen === SCREEN.NONE});

    const pickBrand = useCallback((item) => {
        hapticSelection();
        setBrandId(item.id);
        setKind(null);
        setRegionName(null);
        setGroupName(null);
        setOfferId(null);
    }, []);

    const pickKind = useCallback((value) => {
        hapticSelection();
        setKind(value);
        setRegionName(null);
        setGroupName(null);
        setOfferId(null);
    }, []);

    const pickRegion = useCallback((value) => {
        hapticSelection();
        setRegionName(value);
        setGroupName(null);
        setOfferId(null);
    }, []);

    const pickGroup = useCallback((value) => {
        hapticSelection();
        setGroupName(value);
        setOfferId(null);
    }, []);

    const pickOffer = useCallback((value) => {
        hapticSelection();
        setOfferId(value.id);
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

        hapticImpact('medium');

        flow.submit({
            platform,
            contact: nativeContact(user) || `Почта: ${email.trim()}`,
            username: user?.username || undefined,
            email: email.trim(),
            offerId: offer.id,
            quantity: 1
        }, {
            title: [brand?.name, offer.groupName, offer.denomination].filter(Boolean).join(' · '),
            manual: isManual(offer)
        });
    }, [isReady, flow, platform, user, email, offer, brand]);

    if (flow.screen === SCREEN.WAITING) {
        return <CodeWaiting order={flow.order} onOpenAgain={flow.openAgain} onCancel={flow.cancel}/>;
    }

    if (flow.screen === SCREEN.DONE) {
        return <CodeDone order={flow.order} botType={botType} onClose={flow.close}/>;
    }

    if (flow.screen === SCREEN.FAIL) {
        return <CodeFail order={flow.order} onRetry={flow.close} onClose={back}/>;
    }

    if (flow.screen === SCREEN.STALLED) {
        return <CodeStalled order={flow.order} botType={botType} onClose={flow.close}/>;
    }

    const tone = toneOf(brand, Math.max(0, (brands || []).findIndex((item) => item.id === brand?.id)));

    return (
        <div ref={scrollRef} className={style.screen}>
            <div
                className={style.header}
                style={{paddingTop: `calc(${contentSafeAreaInset.top}px + 14 * var(--u))`}}
            >
                {hasNativeBack ? null : <BackPill className={style.back} onClick={back}/>}
                <h1 className={style.title}>Коды пополнения</h1>
            </div>

            <div
                className={style.content}
                style={{paddingBottom: `calc(${safeAreaInset.bottom}px + 20 * var(--u))`}}
            >
                {error ? (
                    <EmptyState
                        tone="danger"
                        icon="⚠"
                        title="Витрина не загрузилась"
                        text="Проверьте связь и попробуйте ещё раз."
                        actionLabel="Повторить"
                        onAction={retry}
                    />
                ) : brands === null ? (
                    <div className={style.skeleton}>
                        <span className={`${style.skeletonHero} ${style.shimmer}`}/>
                        <span className={`${style.skeletonRow} ${style.shimmer}`}/>
                        <span className={`${style.skeletonRow} ${style.shimmer}`}/>
                    </div>
                ) : brands.length === 0 || !brand ? (
                    <EmptyState
                        icon="🎁"
                        title="Здесь пока пусто"
                        text="Коды пополнения ещё не завезли. Загляните чуть позже."
                        actionLabel="На главную"
                        onAction={back}
                    />
                ) : (
                    <>
                        <div className={style.brands}>
                            {brands.map((item, index) => {
                                const itemTone = toneOf(item, index);
                                const isActive = item.id === brand.id;

                                return (
                                    <button
                                        key={item.id}
                                        type="button"
                                        className={`${style.brand} ${isActive ? style.brandActive : ''}`}
                                        onClick={() => pickBrand(item)}
                                    >
                                        <span
                                            className={style.brandTile}
                                            style={{
                                                background: `linear-gradient(140deg, ${itemTone.from}, ${itemTone.to})`,
                                                borderColor: isActive ? itemTone.ring : 'transparent'
                                            }}
                                        >
                                            {item.icon
                                                ? <img className={style.brandImage} src={item.icon} alt=""/>
                                                : item.glyph}
                                        </span>
                                        <span className={style.brandName}>{item.name}</span>
                                    </button>
                                );
                            })}
                        </div>

                        <div
                            className={style.hero}
                            style={{
                                background: `linear-gradient(135deg, ${tone.from}, ${tone.to})`,
                                borderColor: tone.ring
                            }}
                        >
                            <span className={style.heroBlob} aria-hidden="true"/>

                            <div className={style.heroTop}>
                                <span className={style.heroGlyph}>
                                    {brand.icon
                                        ? <img className={style.heroImage} src={brand.icon} alt=""/>
                                        : brand.glyph}
                                </span>
                                <div className={style.heroTitles}>
                                    <span className={style.heroKind}>
                                        {[kindLabel(activeKind), activeGroupName].filter(Boolean).join(' · ')}
                                    </span>
                                    <span className={style.heroName}>{brand.name}</span>
                                </div>
                            </div>

                            <div className={style.heroBottom}>
                                <div className={style.heroDenom}>
                                    <span className={style.heroDenomLabel}>{denomLabelOf(activeKind)}</span>
                                    <span className={style.heroDenomValue}>{offer?.denomination || '—'}</span>
                                </div>

                                {activeRegion ? (
                                    <span className={style.heroRegion}>
                                        <RegionMark region={regions.find((item) => item.name === activeRegion)}/>
                                        {activeRegion}
                                    </span>
                                ) : null}
                            </div>
                        </div>

                        {kinds.length > 1 ? (
                            <section className={style.block}>
                                <h2 className={style.blockTitle}>Тип товара</h2>

                                <div className={style.kinds}>
                                    {kinds.map((value) => (
                                        <button
                                            key={value}
                                            type="button"
                                            className={`${style.kind} ${value === activeKind ? style.kindActive : ''}`}
                                            aria-pressed={value === activeKind}
                                            onClick={() => pickKind(value)}
                                        >
                                            {kindLabel(value)}
                                        </button>
                                    ))}
                                </div>
                            </section>
                        ) : null}

                        {groups.length > 1 ? (
                            <section className={style.block}>
                                <h2 className={style.blockTitle}>{groupLabelOf(brand)}</h2>

                                <div className={style.kinds}>
                                    {groups.map((item) => (
                                        <button
                                            key={item.key}
                                            type="button"
                                            className={`${style.kind} ${item.key === activeGroup ? style.kindActive : ''}`}
                                            aria-pressed={item.key === activeGroup}
                                            onClick={() => pickGroup(item.key)}
                                        >
                                            {item.name}
                                        </button>
                                    ))}
                                </div>
                            </section>
                        ) : null}

                        {regions.length > 1 ? (
                            <section className={style.block}>
                                <h2 className={style.blockTitle}>Регион</h2>

                                <div className={style.regions}>
                                    {regions.map((item) => (
                                        <button
                                            key={item.name}
                                            type="button"
                                            className={`${style.region} ${item.name === activeRegion ? style.regionActive : ''}`}
                                            aria-pressed={item.name === activeRegion}
                                            onClick={() => pickRegion(item.name)}
                                        >
                                            <RegionMark region={item}/>
                                            {item.name}
                                        </button>
                                    ))}
                                </div>
                            </section>
                        ) : null}

                        <section className={style.block}>
                            <div className={style.blockHead}>
                                <h2 className={style.blockTitle}>{denomLabelOf(activeKind)}</h2>
                                <span className={style.blockNote}>{priceNoteOf(activeKind)}</span>
                            </div>

                            <div className={style.offers}>
                                {offers.map((item) => {
                                    const isActive = item.id === offer?.id;
                                    const isOut = !isSellable(item);

                                    return (
                                        <button
                                            key={item.id}
                                            type="button"
                                            className={`${style.offer} ${isActive ? style.offerActive : ''} ${isOut ? style.offerOut : ''}`}
                                            aria-pressed={isActive}
                                            disabled={isOut}
                                            onClick={() => pickOffer(item)}
                                        >
                                            <span className={`${style.offerDot} ${isActive ? style.offerDotOn : ''}`}>
                                                {isActive ? '✓' : ''}
                                            </span>

                                            <span className={style.offerBody}>
                                                <span className={style.offerName}>{item.denomination}</span>
                                                <span className={`${style.offerStock} ${isOut ? style.offerStockOut : ''}`}>
                                                    {stockLabel(item)}
                                                </span>
                                            </span>

                                            <span className={style.offerPrices}>
                                                <span className={style.offerPrice}>{money(item.price)}</span>
                                                {item.oldPrice ? (
                                                    <span className={style.offerOldPrice}>{money(item.oldPrice)}</span>
                                                ) : null}
                                            </span>
                                        </button>
                                    );
                                })}
                            </div>
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
                                <span className={style.fieldError}>Проверьте адрес почты</span>
                            ) : null}
                        </section>

                        <div className={style.summary}>
                            <div className={style.facts}>
                                <div className={style.fact}>
                                    <span className={style.factIcon} aria-hidden="true">
                                        <svg viewBox="0 0 24 24" fill="none">
                                            <path
                                                d="M13 2.5 5 13.2h5.6L10 21.5 19 10.8h-5.6z"
                                                stroke="currentColor"
                                                strokeWidth="1.7"
                                                strokeLinejoin="round"
                                            />
                                        </svg>
                                    </span>
                                    <span className={style.factBody}>
                                        <span className={style.factLabel}>Доставка</span>
                                        <span className={style.factValue}>{deliveryLabelOf(offer, brand)}</span>
                                    </span>
                                </div>

                                <div className={style.fact}>
                                    <span className={style.factIcon} aria-hidden="true">
                                        <svg viewBox="0 0 24 24" fill="none">
                                            <circle cx="8.6" cy="12" r="4.1" stroke="currentColor" strokeWidth="1.7"/>
                                            <path
                                                d="M12.7 12H21m-3.4 0v3.1m-3-3.1v2.2"
                                                stroke="currentColor"
                                                strokeWidth="1.7"
                                                strokeLinecap="round"
                                            />
                                        </svg>
                                    </span>
                                    <span className={style.factBody}>
                                        <span className={style.factLabel}>Активация</span>
                                        <span className={style.factValue}>
                                            {[activeRegion, brand.activationNote || 'без VPN'].filter(Boolean).join(', ')}
                                        </span>
                                    </span>
                                </div>
                            </div>

                            <div className={style.total}>
                                <span className={style.totalLabel}>К оплате</span>
                                <span key={offer?.price} className={style.totalValue}>
                                    {offer ? money(offer.price) : '—'}
                                </span>
                            </div>
                        </div>

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
                    </>
                )}
            </div>

            {brand && offers.length ? (
                <div className={style.actionBar}>
                    {blockReason ? <p className={style.actionError}>{blockReason}</p> : null}
                    {flow.error ? <p className={style.actionError}>{flow.error}</p> : null}

                    <button
                        type="button"
                        className={style.primary}
                        disabled={flow.isSending}
                        onClick={submit}
                    >
                        {flow.isSending ? 'Создаём заказ…' : 'Оплатить'}
                        {offer && !flow.isSending ? (
                            <span className={style.primaryPrice}>{money(offer.price)}</span>
                        ) : null}
                    </button>
                </div>
            ) : null}
        </div>
    );
}
