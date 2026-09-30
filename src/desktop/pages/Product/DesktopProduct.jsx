import React, {useCallback, useEffect, useMemo, useState} from 'react';
import {Navigate, useNavigate, useParams} from 'react-router-dom';
import {discountPercent, formatPrice} from '../../../pages/Main/catalogSections';
import {
    buildChips,
    buildSpecs,
    descriptionLines,
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
import {useScrollMemory} from '../../shell/ScrollAreaContext';
import {Reveal} from '../../shell/useReveal';
import {useCrumbTrail} from '../../shell/useCrumbTrail';
import {useStorefrontScope} from '../../shell/StorefrontScope';
import Crumbs from '../../ui/Crumbs';
import MediaViewer, {PlayGlyph} from '../../ui/MediaViewer';
import ShareActions from '../../ui/ShareActions';
import Spinner from '../../ui/Spinner';
import {useDesktopProduct} from './useDesktopProduct';
import {useCountdown} from './useCountdown';
import {useRegionOffers} from './useRegionOffers';
import style from './DesktopProduct.module.scss';

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
                    <div className={style.skeletonCover}/>
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
    const tiles = media.slice(0, 6);
    const hiddenCount = media.length - tiles.length;
    const hasVideo = media[0]?.type === 'video';
    const link = productLink(product, isTg);
    const art = product.backgroundUrl || product.image || null;

    const total = Number(product.price) + selectedAddons.reduce((sum, addon) => sum + Number(addon.price), 0);
    const oldTotal = discount > 0
        ? Number(product.oldPrice) + selectedAddons.reduce((sum, addon) => sum + Number(addon.oldPrice || addon.price), 0)
        : null;
    const saving = oldTotal && oldTotal > total ? oldTotal - total : 0;

    const currentRegion = regions?.find((item) => item.isCurrent) || null;
    const bestRegion = regions?.find((item) => item.isBest) || null;
    const hasPriceGap = Boolean(regions) && regions.some((item) => item.price !== regions[0].price);
    const cheaperBy = currentRegion && bestRegion && bestRegion.pageId !== currentRegion.pageId
        && currentRegion.price !== null && bestRegion.price !== null
        ? currentRegion.price - bestRegion.price
        : 0;

    return (
        <div className={style.page}>
            {art ? (
                <div key={art} className={style.backdrop} style={{backgroundImage: `url(${art})`}} aria-hidden="true"/>
            ) : null}

            <Crumbs trail={trail} className={style.crumbs}/>

            <div className={style.screen}>
                <div className={style.main}>
                    <div className={style.cover} style={art ? {backgroundImage: `url(${art})`} : undefined}>
                        {discount > 0 ? <span className={style.discount}>−{discount}%</span> : null}

                        {hasVideo ? (
                            <button type="button" className={style.play} onClick={() => setViewerIndex(0)}>
                                <span className={style.playIcon}><PlayGlyph/></span>
                                Смотреть трейлер
                            </button>
                        ) : null}
                    </div>

                    {tiles.length ? (
                        <Reveal as="section" className={style.block}>
                            <h2 className={style.blockTitle}>{hasVideo ? 'Трейлер и скриншоты' : 'Скриншоты'}</h2>
                            <div className={style.shots}>
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
                        </Reveal>
                    ) : null}

                    <MediaViewer items={media} index={viewerIndex} onIndex={setViewerIndex} onClose={closeViewer}/>

                    {lines.length ? (
                        <Reveal as="section" className={style.block}>
                            <h2 className={style.blockTitle}>Описание</h2>
                            <div className={style.description}>
                                {lines.map((line, index) => <p key={index}>{line}</p>)}
                            </div>
                        </Reveal>
                    ) : null}

                    {specs.length ? (
                        <Reveal as="section" className={style.block}>
                            <h2 className={style.blockTitle}>Характеристики</h2>
                            <dl className={style.specs}>
                                {specs.map((spec) => (
                                    <div key={spec.label} className={style.spec}>
                                        <dt className={style.specLabel}>{spec.label}</dt>
                                        <dd className={style.specValue}>{spec.value}</dd>
                                    </div>
                                ))}
                            </dl>
                        </Reveal>
                    ) : null}

                    {recommendations?.length ? (
                        <Reveal as="section" className={style.block}>
                            <h2 className={style.blockTitle}>Похожее</h2>
                            <div className={style.recommendations}>
                                {recommendations.slice(0, 5).map((item, index) => (
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
                        </Reveal>
                    ) : null}
                </div>

                <aside className={style.panel}>
                    {eyebrow(product) ? <span className={style.eyebrow}>{eyebrow(product)}</span> : null}

                    <h1 className={style.title}>{product.name}</h1>

                    <div className={style.meta}>
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

                    {chips.length ? (
                        <div className={style.chips}>
                            {chips.map((chip) => (
                                <span key={chip} className={style.chip}>{chip}</span>
                            ))}
                        </div>
                    ) : null}

                    {regions ? (
                        <section className={style.section}>
                            <span className={style.sectionTitle}>Доступный регион</span>
                            <div className={style.regions}>
                                {regions.map((region, index) => (
                                    <button
                                        key={region.pageId}
                                        type="button"
                                        className={`${style.region} ${region.isCurrent ? style.regionOn : ''}`}
                                        style={{'--i': index}}
                                        onClick={() => switchRegion(region)}
                                        aria-pressed={region.isCurrent}
                                    >
                                        {region.icon ? (
                                            <span
                                                className={style.regionIcon}
                                                style={{backgroundImage: `url(${region.icon})`}}
                                                aria-hidden="true"
                                            />
                                        ) : null}
                                        <span className={style.regionName}>{region.label}</span>
                                        {region.isBest && hasPriceGap ? (
                                            <span className={style.regionBadge}>Выгоднее</span>
                                        ) : null}
                                        <span className={style.regionPrice}>{formatPrice(region.price)}</span>
                                    </button>
                                ))}
                            </div>
                        </section>
                    ) : null}

                    {editions.length > 1 ? (
                        <section className={style.section}>
                            <span className={style.sectionTitle}>Издание</span>
                            <div className={style.editions}>
                                {editions.map(({product: edition, label}) => (
                                    <button
                                        key={edition.id}
                                        type="button"
                                        className={`${style.edition} ${edition.id === productId ? style.editionOn : ''}`}
                                        onClick={() => selectEdition(edition)}
                                    >
                                        <span className={style.editionLabel}>{label}</span>
                                        <span className={style.editionPrice}>{formatPrice(edition.price)}</span>
                                    </button>
                                ))}
                            </div>
                        </section>
                    ) : null}

                    {addons.length ? (
                        <section className={style.section}>
                            <span className={style.sectionTitle}>Дополнения</span>
                            <div className={style.addons}>
                                {addons.map((addon) => (
                                    <button
                                        key={addon.id}
                                        type="button"
                                        className={`${style.addon} ${selectedAddonIds.has(addon.id) ? style.addonOn : ''}`}
                                        onClick={() => toggleAddon(addon)}
                                        aria-pressed={selectedAddonIds.has(addon.id)}
                                    >
                                        <span className={style.addonName}>{addon.name}</span>
                                        <span className={style.addonPrice}>+{formatPrice(addon.price)}</span>
                                    </button>
                                ))}
                            </div>
                        </section>
                    ) : null}

                    <div className={style.buy}>
                        <div className={style.prices}>
                            <span key={total} className={style.price}>{formatPrice(total)}</span>
                            {discount > 0 ? <span className={style.pricePercent}>−{discount}%</span> : null}
                        </div>

                        {oldTotal ? (
                            <div className={style.priceNotes}>
                                <span className={style.oldPrice}>{formatPrice(oldTotal)}</span>
                                {saving > 0 ? <span className={style.saving}>выгода {formatPrice(saving)}</span> : null}
                            </div>
                        ) : null}

                        {cheaperBy > 0 ? (
                            <button type="button" className={style.cheaper} onClick={() => switchRegion(bestRegion)}>
                                {bestRegion.icon ? (
                                    <span
                                        className={style.cheaperIcon}
                                        style={{backgroundImage: `url(${bestRegion.icon})`}}
                                        aria-hidden="true"
                                    />
                                ) : null}
                                <span className={style.cheaperText}>
                                    В регионе {bestRegion.label} дешевле на <b>{formatPrice(cheaperBy)}</b>
                                </span>
                                <span className={style.cheaperArrow} aria-hidden="true">→</span>
                            </button>
                        ) : null}

                        {countdown?.label ? (
                            <div className={`${style.timer} ${countdown.isUrgent ? style.timerUrgent : ''}`}>
                                <ClockGlyph/>
                                <span className={style.timerLabel}>До конца скидки</span>
                                <span className={style.timerValue}>{countdown.label}</span>
                            </div>
                        ) : null}

                        {!isPurchasable(product) ? (
                            <span className={style.unavailable}>Нет в наличии</span>
                        ) : cartCount > 0 ? (
                            <div className={style.counter}>
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

                                <button type="button" className={style.toBasket} onClick={() => navigate('/basket')}>
                                    В корзину
                                    <span className={style.toBasketArrow} aria-hidden="true">→</span>
                                </button>
                            </div>
                        ) : (
                            <button type="button" className={style.add} onClick={addAllToCart} disabled={isAdding}>
                                {isAdding ? <Spinner/> : null}
                                {isAdding ? 'Добавляем…' : 'Добавить в корзину'}
                            </button>
                        )}

                        <div className={style.secondary}>
                            <button
                                type="button"
                                className={`${style.favorite} ${isFavorite ? style.favoriteOn : ''}`}
                                onClick={handleFavorite}
                                aria-pressed={isFavorite}
                            >
                                <HeartIcon className={style.favoriteIcon}/>
                                {isFavorite ? 'В избранном' : 'В избранное'}
                            </button>

                            {offerRoute ? (
                                <button type="button" className={style.offer} onClick={() => navigate(offerRoute)}>
                                    Все тарифы
                                </button>
                            ) : null}
                        </div>

                        <ShareActions
                            productId={product.id}
                            text={shareText(product, specs, link)}
                            link={link}
                        />
                    </div>
                </aside>
            </div>
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
