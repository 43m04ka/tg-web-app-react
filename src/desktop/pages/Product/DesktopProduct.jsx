import React, {useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState} from 'react';
import {Navigate, useNavigate, useParams} from 'react-router-dom';
import {discountPercent, formatPrice} from '../../../pages/Main/catalogSections';
import {
    buildChips,
    buildSpecs,
    descriptionLines,
    editionContents,
    eyebrow,
    hasValue,
    isPurchasable,
    productLink,
    promotionEnd,
    shareText
} from '../../../pages/Product/productView';
import StarRating from '../../../pages/Product/StarRating';
import EmptyState from '../../../shared/ui/EmptyState/EmptyState';
import {usePlatform} from '../../../shared/hooks/usePlatform';
import {createProductOrigin} from '../../../shared/lib/productOrigin';
import {useSessionStore} from '../../../store/useSessionStore';
import {useStructureStore} from '../../../store/useStructureStore';
import {HeartIcon} from '../../shell/DesktopIcons';
import {useScrollArea, useScrollMemory} from '../../shell/ScrollAreaContext';
import {forgetView} from '../../../shared/lib/viewMemory';
import {useCrumbTrail} from '../../shell/useCrumbTrail';
import {useStorefrontScope} from '../../shell/StorefrontScope';
import Crumbs from '../../ui/Crumbs';
import MediaViewer, {PlayGlyph} from '../../ui/MediaViewer';
import ShareActions from '../../ui/ShareActions';
import Spinner from '../../ui/Spinner';
import {useDesktopProduct} from './useDesktopProduct';
import {useCountdown} from './useCountdown';
import {useRegionOffers} from './useRegionOffers';
import {FeatureMark, ProductGlyph, specIconName, uniqueFeatures} from './productIcons';
import style from './DesktopProduct.module.scss';
import {memberPrice} from '../../../shared/lib/membership';

const FEATURES_MOTION_MS = 420;
const DESCRIPTION_MOTION_MS = 480;
const DESCRIPTION_CLAMP_PX = 230;
const DESCRIPTION_SLACK_PX = 72;
const DESCRIPTION_SCROLL_GAP_PX = 48;
const FLASH_MS = 1600;
const RECOMMENDATIONS_LIMIT = 7;
const ADDONS_LIMIT = 8;

export default function DesktopProduct() {
    const {id} = useParams();
    const productId = Number(id);
    const navigate = useNavigate();
    const {isTg} = usePlatform();

    const pages = useStructureStore((store) => store.pages);
    const startPages = useStructureStore((store) => store.startPages);
    const setPageId = useSessionStore((store) => store.setPageId);
    const {scopeId, setScopeId} = useStorefrontScope();

    const {
        product,
        error,
        reload,
        catalogs,
        planRoute,
        editions,
        addons,
        selectedAddonIds,
        selectedAddons,
        offer,
        offerRoute,
        recommendations,
        cartCount,
        isFavorite,
        isAdding,
        toggleAddon,
        selectEdition,
        openProduct,
        addAllToCart,
        changeCount,
        handleFavorite
    } = useDesktopProduct(productId);

    const originOf = useMemo(
        () => createProductOrigin({catalogs, pages, startPages}),
        [catalogs, pages, startPages]
    );

    useScrollMemory(`card:${productId}`, {ready: Boolean(product)});

    const trail = useCrumbTrail({catalogId: product?.catalogId ?? null, current: product?.name || null});
    const regions = useRegionOffers(product);

    const [viewerIndex, setViewerIndex] = useState(null);
    const addonsRef = useRef(null);
    const editionsRef = useRef(null);
    const coverRef = useRef(null);
    const flashTimerRef = useRef(0);
    const [isAddonsOpen, setAddonsOpen] = useState(false);
    const [flash, setFlash] = useState(null);

    useEffect(() => {
        setAddonsOpen(false);
        setFlash(null);
    }, [productId]);

    useEffect(() => () => clearTimeout(flashTimerRef.current), []);

    const jumpTo = useCallback((ref, name) => {
        ref.current?.scrollIntoView({behavior: 'smooth', block: 'start'});
        clearTimeout(flashTimerRef.current);
        setFlash(name);
        flashTimerRef.current = setTimeout(() => setFlash(null), FLASH_MS);
    }, []);

    useEffect(() => {
        setViewerIndex(null);
    }, [productId]);

    const media = useMemo(() => {
        if (!product) return [];

        const poster = product.backgroundUrl || product.image || null;
        const video = hasValue(product.videoUrl) ? [{type: 'video', url: product.videoUrl, poster}] : [];
        const images = (product.descriptionImages || []).filter(hasValue).map((url) => ({type: 'image', url}));

        return [...video, ...images];
    }, [product]);

    const closeViewer = useCallback(() => setViewerIndex(null), []);

    const hasDiscount = Boolean(product) && discountPercent(product.price, product.oldPrice) > 0;
    const countdown = useCountdown(hasDiscount ? promotionEnd(product) : null);

    const switchRegion = useCallback((region) => {
        if (!region || region.isCurrent) return;

        if (scopeId !== null) setScopeId(region.pageId);
        setPageId(region.pageId);
        forgetView(`shell:card:${region.product.id}`);
        navigate(`/card/${region.product.id}`, {replace: true});
    }, [navigate, scopeId, setScopeId, setPageId]);

    if (error) {
        return (
            <div className={style.page}>
                <EmptyState
                    tone="danger"
                    icon="⚠"
                    title="Товар не открылся"
                    text="Возможно, его убрали с витрины или пропала связь"
                    actionLabel="Повторить"
                    onAction={reload}
                />
            </div>
        );
    }

    if (!product) {
        return (
            <div className={style.page}>
                <div className={style.screen}>
                    <div className={style.skeletonHero}>
                        <div className={style.skeletonCover}/>
                        <div className={style.skeletonLines}>
                            <span/>
                            <span/>
                            <span/>
                        </div>
                    </div>
                    <div className={style.skeletonPanel}/>
                </div>
            </div>
        );
    }

    if (planRoute) return <Navigate to={planRoute} replace/>;

    const discount = discountPercent(product.price, product.oldPrice);
    const chips = buildChips(product);
    const specs = buildSpecs(product);
    const lines = descriptionLines(product.description);
    const origin = originOf(product);
    const platforms = hasValue(product.platform)
        ? String(product.platform).split(',').map((item) => item.trim()).filter(Boolean)
        : [];
    const features = uniqueFeatures(chips.slice(platforms.length));
    const isBento = media.length >= 5;
    const tiles = media.slice(0, isBento ? 5 : 3);
    const hiddenCount = media.length - tiles.length;
    const link = productLink(product, isTg);
    const art = product.backgroundUrl || product.image || null;
    const coverArt = product.image || art;

    const addonsTotal = selectedAddons.reduce((sum, addon) => sum + Number(addon.price), 0);
    const total = Number(product.price) + addonsTotal;
    const visibleAddons = isAddonsOpen ? addons : addons.slice(0, ADDONS_LIMIT);
    const showAddons = () => jumpTo(addonsRef, 'addons');
    const showEditions = () => jumpTo(editionsRef, 'editions');
    const openCover = media.length ? () => setViewerIndex(0) : undefined;
    const member = selectedAddons.length ? null : memberPrice(product);
    const oldTotal = discount > 0
        ? Number(product.oldPrice) + selectedAddons.reduce((sum, addon) => sum + Number(addon.oldPrice || addon.price), 0)
        : null;
    const saving = oldTotal && oldTotal > total ? oldTotal - total : 0;

    const currentRegion = regions?.find((item) => item.isCurrent) || null;
    const hasPriceGap = Boolean(regions) && regions.some((item) => item.price !== regions[0].price);
    const cheaperBy = (region) => (region.isBest && hasPriceGap && currentRegion && !region.isCurrent
        && currentRegion.price !== null && region.price !== null
        ? currentRegion.price - region.price
        : 0);

    return (
        <div className={style.page}>
            {art ? (
                <div key={art} className={style.backdrop} style={{backgroundImage: `url(${art})`}} aria-hidden="true"/>
            ) : null}

            <Crumbs trail={trail} className={style.crumbs}/>

            <div className={style.screen}>
                <div className={style.main}>
                    <div className={style.hero}>
                        <div
                            ref={coverRef}
                            className={`${style.cover} ${openCover ? style.coverOpen : ''}`}
                            style={coverArt ? {backgroundImage: `url(${coverArt})`} : undefined}
                            onClick={openCover}
                            role={openCover ? 'button' : undefined}
                            tabIndex={openCover ? 0 : undefined}
                            onKeyDown={openCover ? (event) => {
                                if (event.key === 'Enter' || event.key === ' ') {
                                    event.preventDefault();
                                    openCover();
                                }
                            } : undefined}
                            aria-label={openCover ? 'Смотреть трейлер и скриншоты' : undefined}
                        >
                            {discount > 0 ? <span className={style.discount}>−{discount}%</span> : null}
                            {openCover ? (
                                <span className={style.coverHint} aria-hidden="true">
                                    <span className={style.coverHintIcon}><PlayGlyph/></span>
                                    {media[0].type === 'video' ? 'Трейлер и скриншоты' : 'Скриншоты'}
                                </span>
                            ) : null}
                            <button
                                type="button"
                                className={`${style.coverFavorite} ${isFavorite ? style.coverFavoriteOn : ''}`}
                                onClick={(event) => {
                                    event.stopPropagation();
                                    handleFavorite();
                                }}
                                onKeyDown={(event) => event.stopPropagation()}
                                aria-pressed={isFavorite}
                                title={isFavorite ? 'Убрать из избранного' : 'В избранное'}
                            >
                                <HeartIcon className={style.favoriteIcon}/>
                            </button>
                        </div>

                        <div className={style.heroInfo}>
                            {eyebrow(product) ? <span className={style.eyebrow}>{eyebrow(product)}</span> : null}

                            <h1 className={style.title}>{product.name}</h1>

                            <div className={style.meta}>
                                {platforms.length ? (
                                    <span className={style.platforms}>
                                        {platforms.map((item) => <span key={item} className={style.platform}>{item}</span>)}
                                    </span>
                                ) : null}
                                {origin && !regions ? (
                                    <span className={style.origin}>
                                        {origin.icon ? (
                                            <span
                                                className={style.originIcon}
                                                style={{backgroundImage: `url(${origin.icon})`}}
                                                aria-hidden="true"
                                            />
                                        ) : null}
                                        {origin.label}
                                    </span>
                                ) : null}
                                <StarRating rating={product.starRating}/>
                            </div>

                            {features.length ? (
                                <HeroFeatures key={productId} items={features} coverRef={coverRef}/>
                            ) : null}
                        </div>
                    </div>

                    <MediaViewer items={media} index={viewerIndex} onIndex={setViewerIndex} onClose={closeViewer}/>

                    {lines.length || specs.length ? (
                        <section
                            className={`${style.block} ${style.about} ${lines.length && specs.length ? '' : style.aboutSolo}`}
                        >
                            {lines.length ? (
                                <Description key={productId} lines={lines}/>
                            ) : null}

                            {specs.length ? (
                                <div className={style.aboutSpecs}>
                                    <h2 className={style.blockTitle}>Информация</h2>
                                    <dl className={style.specs}>
                                        {specs.map((spec) => (
                                            <div key={spec.label} className={style.spec}>
                                                <span className={style.specIcon} aria-hidden="true">
                                                    <ProductGlyph name={specIconName(spec.label)}/>
                                                </span>
                                                <dt className={style.specLabel}>{spec.label}</dt>
                                                <dd className={style.specValue}>{spec.value}</dd>
                                            </div>
                                        ))}
                                    </dl>
                                </div>
                            ) : null}
                        </section>
                    ) : null}

                    {tiles.length ? (
                        <section className={style.block}>
                            <div className={style.blockHead}>
                                <h2 className={style.blockTitle}>
                                    {media[0]?.type === 'video' ? 'Трейлер и скриншоты' : 'Скриншоты'}
                                    <span className={style.blockCount}>{media.length}</span>
                                </h2>
                            </div>
                            <div
                                className={`${style.shots} ${isBento ? style.shotsBento : ''}`}
                                style={{'--cols': tiles.length}}
                            >
                                {tiles.map((item, index) => (
                                    <button
                                        key={`${item.type}:${item.url}`}
                                        type="button"
                                        className={style.shot}
                                        style={{backgroundImage: `url(${item.type === 'video' ? item.poster : item.url})`}}
                                        onClick={() => setViewerIndex(index)}
                                        aria-label={item.type === 'video' ? 'Смотреть трейлер' : `Открыть скриншот ${index + 1}`}
                                    >
                                        {item.type === 'video' ? (
                                            <span className={style.shotPlay}><PlayGlyph/></span>
                                        ) : null}
                                        {hiddenCount > 0 && index === tiles.length - 1 ? (
                                            <span className={style.shotMore}>+{hiddenCount}</span>
                                        ) : null}
                                    </button>
                                ))}
                            </div>
                        </section>
                    ) : null}

                    {editions.length > 1 ? (
                        <section className={`${style.block} ${flash === 'editions' ? style.blockFlash : ''}`}>
                            <div ref={editionsRef} className={style.blockHead}>
                                <h2 className={style.blockTitle}>
                                    Издания <span className={style.blockCount}>{editions.length}</span>
                                </h2>
                            </div>
                            <div className={style.editions}>
                                {editions.map(({product: edition, label}) => {
                                    const isOn = edition.id === productId;
                                    const percent = discountPercent(edition.price, edition.oldPrice);
                                    const contents = editionContents(edition.description);
                                    const items = contents.length ? contents : [
                                        'Основная игра',
                                        hasValue(edition.platform) ? `Версия для ${edition.platform}` : null
                                    ].filter(Boolean);

                                    return (
                                        <button
                                            key={edition.id}
                                            type="button"
                                            className={`${style.edition} ${isOn ? style.editionOn : ''}`}
                                            onClick={() => selectEdition(edition)}
                                            aria-pressed={isOn}
                                        >
                                            <span
                                                className={style.editionCover}
                                                style={edition.image ? {backgroundImage: `url(${edition.image})`} : undefined}
                                            >
                                                {percent > 0 ? <span className={style.tileDiscount}>−{percent}%</span> : null}
                                                {isOn ? <span className={style.tileCheck} aria-hidden="true"><CheckGlyph/></span> : null}
                                            </span>
                                            <span className={style.editionBody}>
                                                <span className={style.editionName}>{label}</span>
                                                <span className={style.editionPrices}>
                                                    <span className={style.editionPrice}>{formatPrice(edition.price)}</span>
                                                    {percent > 0 ? (
                                                        <span className={style.editionOldPrice}>{formatPrice(edition.oldPrice)}</span>
                                                    ) : null}
                                                </span>
                                                {items.length ? (
                                                    <span className={style.editionContents}>
                                                        {items.map((item) => (
                                                            <span key={item} className={style.editionItem}>
                                                                <span className={style.featureMark} aria-hidden="true"><CheckGlyph/></span>
                                                                {item}
                                                            </span>
                                                        ))}
                                                    </span>
                                                ) : null}
                                            </span>
                                        </button>
                                    );
                                })}
                            </div>
                        </section>
                    ) : null}

                    {addons.length ? (
                        <section className={`${style.block} ${flash === 'addons' ? style.blockFlash : ''}`}>
                            <div ref={addonsRef} className={style.blockHead}>
                                <h2 className={style.blockTitle}>
                                    Дополнения <span className={style.blockCount}>{addons.length}</span>
                                </h2>
                                {selectedAddons.length ? (
                                    <span className={style.addonsNote}>
                                        {`Выбрано ${selectedAddons.length} · +${formatPrice(addonsTotal)}`}
                                    </span>
                                ) : (
                                    <span className={style.blockHint}>Добавятся в корзину вместе с игрой</span>
                                )}
                            </div>
                            <div className={style.addons}>
                                {visibleAddons.map((addon, index) => {
                                    const isOn = selectedAddonIds.has(addon.id);
                                    const percent = discountPercent(addon.price, addon.oldPrice);

                                    return (
                                        <button
                                            key={addon.id}
                                            type="button"
                                            className={`${style.addon} ${isOn ? style.addonOn : ''} ${index >= ADDONS_LIMIT ? style.addonLate : ''}`}
                                            style={{'--i': index - ADDONS_LIMIT}}
                                            onClick={() => toggleAddon(addon)}
                                            aria-pressed={isOn}
                                            title={addon.name}
                                        >
                                            <span
                                                className={style.addonCover}
                                                style={addon.image ? {backgroundImage: `url(${addon.image})`} : undefined}
                                            >
                                                {percent > 0 ? <span className={style.tileDiscount}>−{percent}%</span> : null}
                                            </span>
                                            <span className={style.addonBody}>
                                                <span className={style.addonName}>{addon.name}</span>
                                                <span className={style.addonPrice}>+{formatPrice(addon.price)}</span>
                                                <span className={style.addonPick} aria-hidden="true">
                                                    {isOn ? 'Выбрано' : 'Выбрать'}
                                                </span>
                                            </span>
                                        </button>
                                    );
                                })}
                            </div>
                            {addons.length > ADDONS_LIMIT ? (
                                <button
                                    type="button"
                                    className={style.addonsMore}
                                    onClick={() => setAddonsOpen((open) => !open)}
                                >
                                    {isAddonsOpen ? 'Свернуть' : `Показать все ${addons.length}`}
                                </button>
                            ) : null}
                        </section>
                    ) : null}
                </div>

                <aside className={style.panel}>
                    {regions ? (
                        <section className={style.section}>
                            <span className={style.sectionTitle}>Регион покупки</span>
                            <div className={style.regions}>
                                {regions.map((region, index) => {
                                    const gap = cheaperBy(region);

                                    return (
                                        <button
                                            key={region.pageId}
                                            type="button"
                                            className={`${style.region} ${region.isCurrent ? style.regionOn : ''}`}
                                            style={{'--i': index}}
                                            onClick={() => switchRegion(region)}
                                            aria-pressed={region.isCurrent}
                                        >
                                            <span className={style.regionRadio} aria-hidden="true"/>
                                            {region.icon ? (
                                                <span
                                                    className={style.regionIcon}
                                                    style={{backgroundImage: `url(${region.icon})`}}
                                                    aria-hidden="true"
                                                />
                                            ) : null}
                                            <span className={style.regionText}>
                                                <span className={style.regionName}>{region.label}</span>
                                                {gap > 0 ? (
                                                    <span className={style.regionGap}>дешевле на {formatPrice(gap)}</span>
                                                ) : null}
                                            </span>
                                            {region.isBest && hasPriceGap && !gap ? (
                                                <span className={style.regionBadge}>Выгоднее</span>
                                            ) : null}
                                            <span className={style.regionPrice}>{formatPrice(region.price)}</span>
                                        </button>
                                    );
                                })}
                            </div>
                        </section>
                    ) : null}

                    <div className={style.buy}>
                        <div className={style.prices}>
                            <span key={total} className={style.price}>{formatPrice(total)}</span>
                            {discount > 0 ? <span className={style.pricePercent}>−{discount}%</span> : null}
                        </div>

                        {oldTotal || member ? (
                            <div className={style.priceNotes}>
                                {oldTotal ? <span className={style.oldPrice}>{formatPrice(oldTotal)}</span> : null}
                                {saving > 0 ? <span className={style.saving}>выгода {formatPrice(saving)}</span> : null}
                                {member ? (
                                    <span className={`${style.memberPrice} ${style[`memberPrice_${member.brand}`] || ''}`}>
                                        {formatPrice(member.value)} {member.label}
                                    </span>
                                ) : null}
                            </div>
                        ) : null}

                        {countdown?.label ? (
                            <div className={`${style.timer} ${countdown.isUrgent ? style.timerUrgent : ''}`}>
                                <ClockGlyph/>
                                <span className={style.timerLabel}>До конца скидки</span>
                                <span className={style.timerValue}>{countdown.label}</span>
                            </div>
                        ) : null}

                        {editions.length > 1 || addons.length ? (
                            <div className={style.picks}>
                                {editions.length > 1 ? (
                                    <button type="button" className={style.pick} onClick={showEditions}>
                                        <span className={style.pickLabel}>Издание</span>
                                        <span className={style.pickValue}>
                                            {editions.find((item) => item.product.id === productId)?.label || product.name}
                                        </span>
                                        <span className={style.pickAction}>
                                            Все издания
                                            <ArrowGlyph/>
                                        </span>
                                    </button>
                                ) : null}
                                {addons.length ? (
                                    <button type="button" className={`${style.pick} ${style.pickStack}`} onClick={showAddons}>
                                        <span className={style.pickLabel}>Дополнения</span>
                                        <span className={style.pickValue}>
                                            {selectedAddons.length
                                                ? selectedAddons.map((addon) => addon.name).join(', ')
                                                : `доступно ${addons.length}`}
                                        </span>
                                        <span className={style.pickAction}>
                                            {selectedAddons.length ? 'Изменить' : 'Выбрать'}
                                            <ArrowGlyph/>
                                        </span>
                                    </button>
                                ) : null}
                            </div>
                        ) : null}

                        {!isPurchasable(product) ? (
                            <span className={style.unavailable}>Нет в наличии</span>
                        ) : cartCount > 0 ? (
                            <div className={style.counter}>
                                <span className={style.counterBox}>
                                    <button
                                        type="button"
                                        className={style.counterButton}
                                        aria-label="Убрать одну штуку"
                                        onClick={() => changeCount(cartCount - 1)}
                                    >
                                        −
                                    </button>

                                    <span key={cartCount} className={style.counterValue}>{cartCount}</span>

                                    <button
                                        type="button"
                                        className={style.counterButton}
                                        aria-label="Добавить ещё одну штуку"
                                        onClick={() => changeCount(cartCount + 1)}
                                    >
                                        +
                                    </button>
                                </span>

                                <button type="button" className={style.toBasket} onClick={() => navigate('/basket')}>
                                    Оформить
                                    <span className={style.toBasketArrow} aria-hidden="true">→</span>
                                </button>
                            </div>
                        ) : (
                            <button type="button" className={style.add} onClick={addAllToCart} disabled={isAdding}>
                                {isAdding ? <Spinner/> : null}
                                {isAdding ? 'Добавляем…' : 'Добавить в корзину'}
                            </button>
                        )}

                        {offer ? (
                            <button
                                type="button"
                                className={`${style.membership} ${style[`membership${offer.brand}`] || ''}`}
                                onClick={offerRoute ? () => navigate(offerRoute) : undefined}
                                disabled={!offerRoute}
                            >
                                <span className={style.membershipText}>
                                    <span className={style.membershipTitle}>{offer.title}</span>
                                    {offer.note ? <span className={style.membershipNote}>{offer.note}</span> : null}
                                </span>
                                {offerRoute ? <span className={style.membershipGo}>Тарифы →</span> : null}
                            </button>
                        ) : null}
                    </div>

                    <ShareActions
                        productId={product.id}
                        text={shareText(product, specs, link)}
                        link={link}
                        className={style.share}
                    />
                </aside>
            </div>

            {recommendations?.length ? (
                <section className={style.shelf}>
                    <h2 className={style.blockTitle}>Похожее</h2>
                    <div className={style.recommendations}>
                        {recommendations.slice(0, RECOMMENDATIONS_LIMIT).map((item, index) => (
                            <article
                                key={item.id}
                                className={style.recommendation}
                                style={{'--i': index}}
                                onClick={() => openProduct(item)}
                            >
                                <span
                                    className={style.recommendationCover}
                                    style={item.image ? {backgroundImage: `url(${item.image})`} : undefined}
                                />
                                <span className={style.recommendationName}>{item.name}</span>
                                <span className={style.recommendationPrice}>{formatPrice(item.price)}</span>
                            </article>
                        ))}
                    </div>
                </section>
            ) : null}
        </div>
    );
}

function CheckGlyph() {
    return (
        <svg className={style.checkGlyph} viewBox="0 0 24 24" fill="none" aria-hidden="true">
            <path d="m5 12.5 4.5 4.5L19 7.5" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
    );
}

function ArrowGlyph() {
    return (
        <svg className={style.pickArrow} viewBox="0 0 24 24" fill="none" aria-hidden="true">
            <path d="M12 5v14m0 0-6-6m6 6 6-6" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
    );
}

function topWithin(element, root) {
    let top = 0;
    let node = element;
    while (node && node !== root) {
        top += node.offsetTop;
        node = node.offsetParent;
    }
    return top;
}

function HeroFeatures({items, coverRef}) {
    const boxRef = useRef(null);
    const listRef = useRef(null);
    const collapsedRef = useRef(0);
    const openingRef = useRef(false);
    const timerRef = useRef(0);
    const [isOpen, setOpen] = useState(false);
    const [isMoving, setMoving] = useState(false);
    const [fit, setFit] = useState(items.length);

    const refit = useCallback(() => setFit(items.length), [items.length]);

    useEffect(() => {
        const cover = coverRef.current;
        if (!cover) return undefined;

        document.fonts?.ready.then(refit);
        if (typeof ResizeObserver === 'undefined') return undefined;

        const observer = new ResizeObserver(refit);
        observer.observe(cover);
        return () => observer.disconnect();
    }, [coverRef, refit]);

    useEffect(() => () => clearTimeout(timerRef.current), []);

    useLayoutEffect(() => {
        const cover = coverRef.current;
        const list = listRef.current;
        if (isOpen || isMoving || !cover || !list || fit <= 0) return;

        const root = cover.offsetParent;
        const limit = topWithin(cover, root) + cover.offsetHeight - topWithin(list, root);
        if (list.offsetHeight > limit + 1) setFit(fit - 1);
    });

    const animate = (from, to, done) => {
        const box = boxRef.current;
        box.style.height = `${from}px`;
        void box.offsetHeight;
        box.style.height = `${to}px`;
        clearTimeout(timerRef.current);
        timerRef.current = setTimeout(() => {
            box.style.height = '';
            done();
        }, FEATURES_MOTION_MS);
    };

    useLayoutEffect(() => {
        if (!isOpen || !openingRef.current) return;
        openingRef.current = false;
        animate(collapsedRef.current, listRef.current.offsetHeight, () => setMoving(false));
    }, [isOpen]);

    const toggle = () => {
        const box = boxRef.current;
        if (!box || isMoving) return;

        if (!isOpen) {
            collapsedRef.current = box.offsetHeight;
            box.style.height = `${collapsedRef.current}px`;
            openingRef.current = true;
            setMoving(true);
            setOpen(true);
            return;
        }

        setMoving(true);
        animate(box.offsetHeight, collapsedRef.current, () => {
            setOpen(false);
            setMoving(false);
        });
    };

    const shown = isOpen ? items : items.slice(0, fit);
    const hidden = items.length - fit;

    return (
        <div ref={boxRef} className={style.featuresBox}>
            <ul ref={listRef} className={style.features}>
                {shown.map((item, index) => (
                    <li
                        key={item}
                        className={`${style.feature} ${index >= fit ? style.featureLate : ''}`}
                        style={{'--i': index - fit}}
                    >
                        <FeatureMark text={item} style={style}/>
                        {item}
                    </li>
                ))}
                {hidden > 0 || isOpen ? (
                    <li>
                        <button
                            type="button"
                            className={style.featuresToggle}
                            onClick={toggle}
                            aria-expanded={isOpen}
                        >
                            {isOpen ? 'Свернуть' : `Ещё ${hidden}`}
                        </button>
                    </li>
                ) : null}
            </ul>
        </div>
    );
}

function isHeadingLine(line) {
    return line.length <= 60 && line === line.toUpperCase() && /[A-ZА-ЯЁ]/.test(line);
}

function Description({lines}) {
    const areaRef = useScrollArea();
    const rootRef = useRef(null);
    const textRef = useRef(null);
    const timerRef = useRef(0);
    const [isLong, setLong] = useState(false);
    const [phase, setPhase] = useState('closed');
    const content = lines.join('\n');

    useLayoutEffect(() => {
        const text = textRef.current;
        if (!text) return undefined;

        const measure = () => setLong(text.scrollHeight > DESCRIPTION_CLAMP_PX + DESCRIPTION_SLACK_PX);

        measure();
        document.fonts?.ready.then(measure);
        if (typeof ResizeObserver === 'undefined') return undefined;

        const observer = new ResizeObserver(measure);
        observer.observe(text);
        return () => observer.disconnect();
    }, [content]);

    useEffect(() => () => clearTimeout(timerRef.current), []);

    const animate = (to, next, done) => {
        const text = textRef.current;
        text.style.maxHeight = `${text.offsetHeight}px`;
        void text.offsetHeight;
        text.style.maxHeight = `${to}px`;
        setPhase(next);
        clearTimeout(timerRef.current);
        timerRef.current = setTimeout(() => {
            text.style.maxHeight = '';
            done();
        }, DESCRIPTION_MOTION_MS);
    };

    const isOpen = phase === 'open' || phase === 'opening';

    const toggle = () => {
        const text = textRef.current;
        if (!text) return;

        if (!isOpen) {
            animate(text.scrollHeight, 'opening', () => setPhase('open'));
            return;
        }

        const root = rootRef.current;
        const area = areaRef?.current;
        if (root && area) {
            const top = root.getBoundingClientRect().top - area.getBoundingClientRect().top;
            if (top < DESCRIPTION_SCROLL_GAP_PX) {
                area.scrollTo({top: area.scrollTop + top - DESCRIPTION_SCROLL_GAP_PX, behavior: 'smooth'});
            }
        }

        animate(DESCRIPTION_CLAMP_PX, 'closing', () => setPhase('closed'));
    };

    const isClamped = isLong && phase === 'closed';
    const isFaded = isLong && (phase === 'closed' || phase === 'closing');

    return (
        <div ref={rootRef} className={style.aboutText}>
            <h2 className={style.blockTitle}>Описание</h2>
            <div
                ref={textRef}
                className={`${style.description} ${isClamped ? style.descriptionClosed : ''} ${isFaded ? style.descriptionFade : ''}`}
            >
                {lines.map((line, index) => (isHeadingLine(line)
                    ? <h3 key={index} className={style.descriptionHeading}>{line}</h3>
                    : <p key={index}>{line}</p>))}
            </div>
            {isLong ? (
                <button
                    type="button"
                    className={style.descriptionToggle}
                    onClick={toggle}
                    aria-expanded={isOpen}
                >
                    {isOpen ? 'Свернуть' : 'Читать полностью'}
                </button>
            ) : null}
        </div>
    );
}

function ClockGlyph() {
    return (
        <svg className={style.timerIcon} viewBox="0 0 24 24" aria-hidden="true">
            <circle cx="12" cy="12" r="9"/>
            <path d="M12 7v5l3 2"/>
        </svg>
    );
}
