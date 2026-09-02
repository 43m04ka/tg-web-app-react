import React, {useEffect, useRef, useState} from 'react';
import {hapticImpact} from '../../shared/lib/haptic';
import BackPill from '../../shared/ui/BackPill/BackPill';
import EmptyState from '../../shared/ui/EmptyState/EmptyState';
import {money} from '../Basket/cartModel';
import {
    denomLabelOf,
    groupLabelOf,
    isSellable,
    kindLabel,
    priceNoteOf,
    servicesFaq,
    stockLabel,
    themeOf,
    themeVars
} from './servicesModel';
import style from './Services.module.scss';

const RegionMark = ({region}) => {
    if (region?.icon) return <img className={style.regionIcon} src={region.icon} alt=""/>;
    if (region?.flag) return <span className={style.regionFlag}>{region.flag}</span>;

    return null;
};

const centerActive = (strip, smooth) => {
    if (!strip) return;

    const active = strip.querySelector('[data-active="true"]');
    if (!active) return;

    const box = strip.getBoundingClientRect();
    const spot = active.getBoundingClientRect();
    const shift = strip.scrollLeft + (spot.left - box.left) - (box.width - spot.width) / 2;

    strip.scrollTo({left: Math.max(0, shift), behavior: smooth ? 'smooth' : 'auto'});
};

const centerSelf = (spot) => {
    if (!spot) return;

    spot.scrollIntoView({behavior: 'smooth', block: 'nearest', inline: 'center'});
};

export default function ServicesView({
    scrollRef,
    brands,
    view,
    error = false,
    onRetry,
    onBack,
    showBack = false,
    topInset = 0,
    bottomInset = 0,
    email = '',
    emailError = null,
    onEmailChange,
    showEmail = true,
    onPickBrand,
    onPickKind,
    onPickRegion,
    onPickGroup,
    onPickOffer,
    action = null
}) {
    const brandsRef = useRef(null);
    const brandsCentered = useRef(false);
    const offersRef = useRef(null);

    const {brand, brandIndex, kinds, kind, regions, regionName, groups, groupKey, groupName, offers, offer} = view;

    useEffect(() => {
        centerActive(brandsRef.current, brandsCentered.current);
        brandsCentered.current = true;
    }, [brand?.id]);

    useEffect(() => {
        centerActive(offersRef.current, true);
    }, [brand?.id, kind, regionName, groupKey, offer?.id]);

    const theme = themeOf(brand, brandIndex);
    const pageTitle = kind === 'subscription' ? 'Подписки' : 'Коды пополнения';

    return (
        <div ref={scrollRef} className={style.screen} style={themeVars(theme)}>
            <div className={style.header} style={{paddingTop: `calc(${topInset}px + 14 * var(--u))`}}>
                {showBack && onBack ? <BackPill className={style.back} onClick={onBack}/> : null}
                <h1 className={style.title}>{pageTitle}</h1>
            </div>

            <div className={style.content} style={{paddingBottom: `calc(${bottomInset}px + 20 * var(--u))`}}>
                {error ? (
                    <EmptyState
                        tone="danger"
                        icon="⚠"
                        title="Витрина не загрузилась"
                        text="Проверьте связь и попробуйте ещё раз."
                        actionLabel={onRetry ? 'Повторить' : undefined}
                        onAction={onRetry}
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
                        actionLabel={onBack ? 'На главную' : undefined}
                        onAction={onBack}
                    />
                ) : (
                    <>
                        <div ref={brandsRef} className={style.brands}>
                            {brands.map((item, index) => {
                                const itemTheme = themeOf(item, index);
                                const isActive = item.id === brand.id;

                                return (
                                    <button
                                        key={item.id}
                                        type="button"
                                        data-active={isActive}
                                        className={`${style.brand} ${isActive ? style.brandActive : ''}`}
                                        aria-pressed={isActive}
                                        style={themeVars(itemTheme)}
                                        onClick={(event) => {
                                            centerSelf(event.currentTarget);
                                            onPickBrand(item);
                                        }}
                                    >
                                        <span className={style.brandTile}>
                                            {item.icon
                                                ? <img className={style.brandImage} src={item.icon} alt=""/>
                                                : item.glyph}
                                        </span>
                                        <span className={style.brandNameBox}>
                                            <span className={style.brandName}>{item.name}</span>
                                        </span>
                                    </button>
                                );
                            })}
                        </div>

                        <div className={style.hero}>
                            <span className={style.heroBlob} aria-hidden="true"/>

                            <div className={style.heroTop}>
                                <span className={style.heroGlyph}>
                                    {brand.icon
                                        ? <img className={style.heroImage} src={brand.icon} alt=""/>
                                        : brand.glyph}
                                </span>
                                <div className={style.heroTitles}>
                                    <span className={style.heroKind}>
                                        {[kindLabel(kind), groupName].filter(Boolean).join(' · ')}
                                    </span>
                                    <span className={style.heroName}>{brand.name}</span>
                                </div>
                            </div>

                            <div className={style.heroBottom}>
                                <div className={style.heroDenom}>
                                    <span className={style.heroDenomLabel}>{denomLabelOf(kind)}</span>
                                    <span className={style.heroDenomValue}>{offer?.denomination || '—'}</span>
                                </div>

                                {regionName ? (
                                    <span className={style.heroRegion}>
                                        <RegionMark region={regions.find((item) => item.name === regionName)}/>
                                        {regionName}
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
                                            className={`${style.kind} ${value === kind ? style.kindActive : ''}`}
                                            aria-pressed={value === kind}
                                            onClick={() => onPickKind(value)}
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

                                <div className={style.regions}>
                                    {regions.map((item) => (
                                        <button
                                            key={item.name}
                                            type="button"
                                            className={`${style.region} ${item.name === regionName ? style.regionActive : ''}`}
                                            aria-pressed={item.name === regionName}
                                            onClick={() => onPickRegion(item.name)}
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

                                <div className={style.kinds}>
                                    {groups.map((item) => (
                                        <button
                                            key={item.key}
                                            type="button"
                                            className={`${style.kind} ${item.key === groupKey ? style.kindActive : ''}`}
                                            aria-pressed={item.key === groupKey}
                                            onClick={() => onPickGroup(item.key)}
                                        >
                                            {item.name}
                                        </button>
                                    ))}
                                </div>
                            </section>
                        ) : null}

                        <section className={style.block}>
                            <div className={style.blockHead}>
                                <h2 className={style.blockTitle}>{denomLabelOf(kind)}</h2>
                                <span className={style.blockNote}>{priceNoteOf(kind)}</span>
                            </div>

                            <div ref={offersRef} className={style.offers}>
                                {offers.map((item) => {
                                    const isActive = item.id === offer?.id;
                                    const isOut = !isSellable(item);

                                    return (
                                        <button
                                            key={item.id}
                                            type="button"
                                            data-active={isActive}
                                            className={`${style.offer} ${isActive ? style.offerActive : ''} ${isOut ? style.offerOut : ''}`}
                                            aria-pressed={isActive}
                                            disabled={isOut}
                                            onClick={() => onPickOffer(item)}
                                        >
                                            <span className={`${style.offerDot} ${isActive ? style.offerDotOn : ''}`}>
                                                {isActive ? '✓' : ''}
                                            </span>

                                            <span className={style.offerName}>{item.denomination}</span>

                                            <span className={style.offerPrices}>
                                                <span className={style.offerPrice}>{money(item.price)}</span>
                                                {item.oldPrice ? (
                                                    <span className={style.offerOldPrice}>{money(item.oldPrice)}</span>
                                                ) : null}
                                            </span>

                                            <span className={`${style.offerStock} ${isOut ? style.offerStockOut : ''}`}>
                                                {stockLabel(item)}
                                            </span>
                                        </button>
                                    );
                                })}
                            </div>
                        </section>

                        {showEmail ? (
                            <section className={style.block}>
                                <h2 className={style.blockTitle}>E-mail для чека</h2>

                                <input
                                    className={`${style.input} ${emailError ? style.inputBad : ''}`}
                                    type="email"
                                    value={email}
                                    placeholder="player@mail.ru"
                                    autoComplete="email"
                                    autoCapitalize="none"
                                    onChange={(event) => onEmailChange?.(event.target.value)}
                                />

                                {emailError ? <span className={style.fieldError}>{emailError}</span> : null}
                            </section>
                        ) : null}

                        <div className={style.total}>
                            <span className={style.totalLabel}>К оплате</span>
                            <span key={offer?.price} className={style.totalValue}>
                                {offer ? money(offer.price) : '—'}
                            </span>
                        </div>

                        <section className={style.block}>
                            <h2 className={style.blockTitle}>Часто спрашивают</h2>
                            <Faq items={servicesFaq(brand, regionName, offer)}/>
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
                    </>
                )}
            </div>

            {action && brand && offers.length ? <div className={style.actionBar}>{action}</div> : null}
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
