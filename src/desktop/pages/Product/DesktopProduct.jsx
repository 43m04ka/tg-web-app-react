import React, {useMemo} from 'react';
import {Navigate, useNavigate, useParams} from 'react-router-dom';
import {discountPercent, formatPrice} from '../../../pages/Main/catalogSections';
import {
    buildChips,
    buildSpecs,
    descriptionLines,
    eyebrow,
    isPurchasable,
    promotionLabel
} from '../../../pages/Product/productView';
import StarRating from '../../../pages/Product/StarRating';
import EmptyState from '../../../shared/ui/EmptyState/EmptyState';
import {createProductOrigin} from '../../../shared/lib/productOrigin';
import {useStructureStore} from '../../../store/useStructureStore';
import {HeartIcon} from '../../shell/DesktopIcons';
import {useScrollMemory} from '../../shell/ScrollAreaContext';
import {Reveal} from '../../shell/useReveal';
import Spinner from '../../ui/Spinner';
import {useDesktopProduct} from './useDesktopProduct';
import style from './DesktopProduct.module.scss';

export default function DesktopProduct() {
    const {id} = useParams();
    const productId = Number(id);
    const navigate = useNavigate();

    const pages = useStructureStore((store) => store.pages);
    const startPages = useStructureStore((store) => store.startPages);

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

    if (error) {
        return (
            <EmptyState
                tone="danger"
                icon="⚠"
                title="Товар не открылся"
                text="Возможно, его убрали с витрины или пропала связь"
                actionLabel="Повторить"
                onAction={reload}
            />
        );
    }

    if (!product) {
        return (
            <div className={style.screen}>
                <div className={style.skeletonCover}/>
                <div className={style.skeletonPanel}/>
            </div>
        );
    }

    if (planRoute) return <Navigate to={planRoute} replace/>;

    const discount = discountPercent(product.price, product.oldPrice);
    const promoUntil = discount > 0 ? promotionLabel(product) : null;
    const chips = buildChips(product);
    const specs = buildSpecs(product);
    const lines = descriptionLines(product.description);
    const origin = originOf(product);
    const shots = (product.descriptionImages || []).slice(0, 6);

    const total = Number(product.price) + selectedAddons.reduce((sum, addon) => sum + Number(addon.price), 0);
    const oldTotal = discount > 0
        ? Number(product.oldPrice) + selectedAddons.reduce((sum, addon) => sum + Number(addon.oldPrice || addon.price), 0)
        : null;

    return (
        <div className={style.screen}>
            <div className={style.main}>
                <div
                    className={style.cover}
                    style={product.backgroundUrl || product.image
                        ? {backgroundImage: `url(${product.backgroundUrl || product.image})`}
                        : undefined}
                >
                    {discount > 0 ? <span className={style.discount}>−{discount}%</span> : null}
                </div>

                {shots.length ? (
                    <Reveal as="section" className={style.block}>
                        <h2 className={style.blockTitle}>Скриншоты</h2>
                        <div className={style.shots}>
                            {shots.map((url) => (
                                <span key={url} className={style.shot} style={{backgroundImage: `url(${url})`}}/>
                            ))}
                        </div>
                    </Reveal>
                ) : null}

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
                    {origin ? (
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
                        <span className={style.price}>{formatPrice(total)}</span>
                        {oldTotal ? <span className={style.oldPrice}>{formatPrice(oldTotal)}</span> : null}
                        {promoUntil ? <span className={style.promo}>{promoUntil}</span> : null}
                    </div>

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
                </div>
            </aside>
        </div>
    );
}
