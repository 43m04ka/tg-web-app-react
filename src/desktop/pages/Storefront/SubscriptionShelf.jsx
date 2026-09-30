import React, {useState} from 'react';
import {formatPrice, isSubscription} from '../../../pages/Main/catalogSections';
import {buildPlan} from '../../../pages/Subscription/subscriptionModel';
import {themeOf} from '../../../pages/Services/servicesModel';
import {pluralOf} from '../../../shared/lib/plural';
import {useReveal} from '../../shell/useReveal';
import {familyOf} from '../../model/storefrontModel';
import style from './SubscriptionShelf.module.scss';

const MONTH_WORDS = ['месяц', 'месяца', 'месяцев'];
const WIDE_TERMS = 4;
const OTHERS = 'others';

const FAMILY_TITLES = {
    ps: 'Подписки PlayStation',
    xbox: 'Подписки Xbox'
};

const GLYPHS = {
    psplus: PlusGlyph,
    gamepass: XboxGlyph,
    eaplay: EaGlyph
};

const periodOf = (tier, months) =>
    tier.periods.find((item) => item.months === months && item.isAvailable) || null;

const termsOf = (tiers) => [...new Set(tiers.flatMap((tier) => tier.periods.map((period) => period.months)))]
    .filter((months) => months !== null)
    .sort((a, b) => a - b);

export const subscriptionShelf = (shelf) => {
    const offers = shelf?.offers || [];
    if (offers.length < 2 || !offers.every((offer) => isSubscription(offer.product))) return null;

    const plan = buildPlan(offers.map((offer) => offer.product), {
        catalogPath: shelf.pages?.[0]?.path,
        title: shelf.title
    });
    if (!plan || plan.tiers.length === 0) return null;

    const terms = termsOf(plan.tiers);
    if (terms.length === 0) return null;

    return {plan, terms, offerById: new Map(offers.map((offer) => [offer.product.id, offer]))};
};

export const groupShelves = (shelves) => {
    const entries = [];
    const blocks = new Map();

    (shelves || []).forEach((shelf) => {
        const model = subscriptionShelf(shelf);
        if (!model) {
            entries.push({kind: 'shelf', key: shelf.key, shelf});
            return;
        }

        const family = familyOf(shelf.offers[0]?.origins[0]?.type);
        const block = blocks.get(family);

        if (block) {
            block.items.push({shelf, model});
            return;
        }

        const created = {kind: 'subscriptions', key: `subscriptions:${family}`, family, items: [{shelf, model}]};
        blocks.set(family, created);
        entries.push(created);
    });

    return entries;
};

const termLabel = (months, isShort = false) =>
    (isShort ? `${months} мес.` : `${months} ${pluralOf(months, MONTH_WORDS)}`);

const tierVars = (tier) => {
    const theme = tier.theme || themeOf({accent: tier.accent}, 0);

    return {
        '--sub': theme.base,
        '--sub-edge': theme.edge,
        '--sub-ink': theme.ink,
        '--sub-text': theme.text,
        '--sub-glow': theme.glow
    };
};

const sameText = (one, two) => String(one).toLowerCase() === String(two).toLowerCase();

const shelfCards = ({plan, terms, offerById}, months) => {
    const brand = plan.brand;
    const brandNote = brand.key === 'other' ? null : brand.name;

    if (plan.tiers.length === 1) {
        const [tier] = plan.tiers;
        const note = [brandNote, sameText(tier.name, brand.name) ? null : tier.name].filter(Boolean).join(' · ');

        return terms
            .map((term) => ({key: `${tier.key}:${term}`, tier, period: periodOf(tier, term), title: termLabel(term)}))
            .filter((card) => card.period)
            .map((card) => ({...card, brand, note, offer: offerById.get(card.period.id) || null}));
    }

    return plan.tiers.map((tier) => {
        const period = periodOf(tier, months);

        return {
            key: tier.key,
            tier,
            period,
            brand,
            title: tier.name,
            note: sameText(tier.name, brand.name) ? null : brandNote,
            offer: period ? offerById.get(period.id) || null : null
        };
    });
};

const brandCards = (items, months) => items.map(({shelf, model}) => {
    const {plan, offerById} = model;

    const best = plan.tiers
        .map((tier) => ({tier, period: periodOf(tier, months)}))
        .filter((item) => item.period)
        .sort((a, b) => a.period.price - b.period.price)[0] || null;

    const tier = best?.tier || plan.tiers[0];
    const period = best?.period || null;

    return {
        key: shelf.key,
        tier,
        period,
        brand: plan.brand,
        title: plan.brand.key === 'other' ? shelf.title : plan.brand.name,
        note: null,
        isFrom: plan.tiers.length > 1,
        offer: period ? offerById.get(period.id) || null : null
    };
});

const buildView = (items, tab, picked) => {
    const primary = items.reduce((best, item) =>
        (item.model.plan.tiers.length > best.model.plan.tiers.length ? item : best));
    const others = items.filter((item) => item !== primary);

    const tabs = others.length === 0 ? [] : [
        {key: primary.shelf.key, label: primary.model.plan.brand.key === 'other'
            ? primary.shelf.title
            : primary.model.plan.brand.name},
        {key: OTHERS, label: 'Другие подписки'}
    ];

    const isOthers = tab === OTHERS && others.length > 0;
    const active = isOthers ? others : [primary];
    const single = active.length === 1 ? active[0] : null;

    const terms = single
        ? single.model.terms
        : termsOf(active.flatMap((item) => item.model.plan.tiers));
    const months = terms.includes(picked) ? picked : terms[0];

    const showTerms = terms.length > 1 && (!single || single.model.plan.tiers.length > 1);
    const cards = single ? shelfCards(single.model, months) : brandCards(active, months);
    const page = single && single.shelf.pages.length === 1 ? single.shelf.pages[0] : null;

    return {tabs, activeTab: isOthers ? OTHERS : primary.shelf.key, terms, months, showTerms, cards, page, primary};
};

export default function SubscriptionShelf({items, family, onOpen, onOpenCatalog}) {
    const ref = useReveal();
    const [tab, setTab] = useState(null);
    const [picked, setPicked] = useState(null);

    const {tabs, activeTab, terms, months, showTerms, cards, page, primary} = buildView(items, tab, picked);

    const isShortTerms = showTerms && terms.length > WIDE_TERMS;
    const isCompact = cards.length > WIDE_TERMS;
    const title = tabs.length ? (FAMILY_TITLES[family] || 'Подписки') : primary.shelf.title;
    const icon = tabs.length ? null : primary.shelf.icon;

    return (
        <section className={style.shelf} ref={ref} data-reveal="out">
            <header className={isShortTerms ? `${style.head} ${style.headWide}` : style.head}>
                <div className={style.lead}>
                    <span className={style.title}>
                        {icon ? (
                            <span className={style.icon} style={{backgroundImage: `url(${icon})`}} aria-hidden="true"/>
                        ) : null}
                        {title}
                    </span>

                    {tabs.length ? (
                        <div className={style.tabs} role="tablist" aria-label="Подписки">
                            {tabs.map((item) => (
                                <button
                                    key={item.key}
                                    type="button"
                                    role="tab"
                                    aria-selected={item.key === activeTab}
                                    className={item.key === activeTab ? `${style.tab} ${style.tabOn}` : style.tab}
                                    onClick={() => setTab(item.key)}
                                >
                                    {item.label}
                                </button>
                            ))}
                        </div>
                    ) : null}
                </div>

                <div className={style.tools}>
                    {showTerms ? (
                        <div className={style.terms} role="tablist" aria-label="Срок подписки">
                            {terms.map((item) => (
                                <button
                                    key={item}
                                    type="button"
                                    role="tab"
                                    aria-selected={item === months}
                                    className={item === months ? `${style.term} ${style.termOn}` : style.term}
                                    onClick={() => setPicked(item)}
                                >
                                    {termLabel(item, isShortTerms)}
                                </button>
                            ))}
                        </div>
                    ) : null}

                    {page ? (
                        <button type="button" className={style.action} onClick={() => onOpenCatalog?.(page)}>
                            Смотреть все
                            <span className={style.arrow} aria-hidden="true">→</span>
                        </button>
                    ) : null}
                </div>
            </header>

            <div
                key={activeTab}
                className={isCompact ? `${style.cards} ${style.cardsCompact}` : style.cards}
                style={{'--count': Math.min(Math.max(cards.length, 3), WIDE_TERMS)}}
            >
                {cards.map(({key, tier, period, brand, title: cardTitle, note, offer, isFrom}, index) => {
                    const Glyph = GLYPHS[brand.key] || null;
                    const hasFrom = isFrom || (offer?.origins.length ?? 0) > 1;
                    const percent = period?.oldPrice && period.oldPrice > period.price
                        ? Math.round((1 - period.price / period.oldPrice) * 100)
                        : 0;
                    const image = period?.product.image || tier.periods[0]?.product.image || null;

                    return (
                        <button
                            key={key}
                            type="button"
                            className={period ? style.card : `${style.card} ${style.cardOff}`}
                            style={{...tierVars(tier), '--i': index}}
                            disabled={!offer}
                            onClick={() => offer && onOpen?.(offer)}
                        >
                            <span className={Glyph ? style.art : `${style.art} ${style.artImage}`}>
                                {Glyph ? (
                                    <>
                                        <span className={style.glow} aria-hidden="true"/>
                                        <Glyph/>
                                    </>
                                ) : image ? (
                                    <span
                                        className={style.picture}
                                        style={{backgroundImage: `url(${image})`}}
                                        aria-hidden="true"
                                    />
                                ) : null}
                                {note ? <span className={style.brand}>{note}</span> : null}
                                <span className={style.tier}>{cardTitle}</span>
                            </span>

                            <span className={style.bottom}>
                                {period ? (
                                    <>
                                        <span key={`${key}:${months}`} className={style.price}>
                                            {hasFrom ? <span className={style.from}>от </span> : null}
                                            {formatPrice(period.price)}
                                        </span>
                                        {percent > 0 ? <span className={style.percent}>−{percent}%</span> : null}
                                    </>
                                ) : (
                                    <span className={style.none}>Нет на {termLabel(months)}</span>
                                )}
                            </span>
                        </button>
                    );
                })}
            </div>
        </section>
    );
}

function PlusGlyph() {
    return (
        <svg className={style.glyph} viewBox="0 0 100 100" aria-hidden="true">
            <path d="M40 6h20a6 6 0 0 1 6 6v22h22a6 6 0 0 1 6 6v20a6 6 0 0 1-6 6H66v22a6 6 0 0 1-6 6H40a6 6 0 0 1-6-6V66H12a6 6 0 0 1-6-6V40a6 6 0 0 1 6-6h22V12a6 6 0 0 1 6-6z"/>
        </svg>
    );
}

function XboxGlyph() {
    return (
        <svg className={style.glyph} viewBox="0 0 24 24" aria-hidden="true">
            <path d="M4.102 21.033C6.211 22.881 8.977 24 12 24c3.026 0 5.789-1.119 7.902-2.967 1.877-1.912-4.316-8.709-7.902-11.417-3.582 2.708-9.779 9.505-7.898 11.417zm11.16-14.406c2.5 2.961 7.484 10.313 6.076 12.912C23.002 17.48 24 14.861 24 12.004c0-3.34-1.365-6.362-3.57-8.536 0 0-.027-.022-.082-.042-.063-.022-.152-.045-.281-.045-.592 0-1.985.434-4.805 3.246zM3.654 3.426c-.057.02-.082.041-.086.042C1.365 5.642 0 8.664 0 12.004c0 2.854.998 5.473 2.661 7.533-1.401-2.605 3.579-9.951 6.08-12.91-2.82-2.813-4.216-3.245-4.806-3.245-.131 0-.223.021-.281.046v-.002zM12 3.551S9.055 1.828 6.755 1.746c-.903-.033-1.454.295-1.521.339C7.379.646 9.659 0 11.984 0H12c2.334 0 4.605.646 6.766 2.085-.068-.046-.615-.372-1.52-.339C14.946 1.828 12 3.545 12 3.545v.006z"/>
        </svg>
    );
}

function EaGlyph() {
    return (
        <svg className={`${style.glyph} ${style.glyphWide}`} viewBox="0 0 24 24" aria-hidden="true">
            <path d="M16.635 6.162l-5.928 9.377H4.24l1.508-2.3h4.024l1.474-2.335H2.264L.79 13.239h2.156L0 17.84h12.072l4.563-7.259 1.652 2.66h-1.401l-1.473 2.299h4.347l1.473 2.3H24zm-11.461.107L3.7 8.604l9.52-.035 1.474-2.3z"/>
        </svg>
    );
}
