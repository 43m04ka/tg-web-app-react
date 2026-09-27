import React, {useCallback, useEffect, useMemo, useRef, useState} from 'react';
import {useNavigate} from 'react-router-dom';
import {useStructureStore} from '../../store/useStructureStore';
import {useSessionStore} from '../../store/useSessionStore';
import {usePlatform} from '../../shared/hooks/usePlatform';
import {fallbackBotType} from '../../shared/lib/platform';
import {useAppInsets} from '../../shared/hooks/useAppInsets';
import {hapticImpact} from '../../shared/lib/haptic';
import {primeKeyboard} from '../../shared/lib/keyboard';
import {getTelegramObject} from '../../shared/lib/telegram';
import {standaloneRoute} from '../../shared/lib/pageRoutes';
import {regionIcon, regionLabel} from '../../shared/lib/region';
import {glowStyle} from './accent';
import PopularRail from './PopularRail';
import PlatformCard from './PlatformCard';
import PlatformLink from './PlatformLink';
import TypingHint from './TypingHint';
import style from './SelectPlatform.module.scss';

const MIN_FADE_PX = 24;
const LEAVE_MS = 265;
const CONTENT_BASE_MS = 360;
const ITEM_ORDER_CAP = 9;
const SEARCH_HINT = 'Поиск по всем витринам';
const EXTRA_HINTS = ['Game Pass', 'PlayStation Plus'];
const RAIL_ORDER_CAP = 6;

const TITLE_WORDS = [
    ['Геймворд'],
    ['—'],
    ['игры'],
    ['и'],
    ['подписки'],
    ['для'],
    ['PlayStation', 'ps'],
    ['и'],
    ['Xbox', 'xbox']
];

let introPlayed = false;

const useRevealOrder = (cap) => {
    const orderRef = useRef(new Map());

    return (key) => {
        const order = orderRef.current;
        if (!order.has(key)) order.set(key, Math.min(order.size, cap));
        return order.get(key);
    };
};

const toGroups = (items) => {
    const groups = [];
    let current = null;

    items.forEach((item) => {
        if (item.type === 'title' || !current) {
            current = {header: item.type === 'title' ? item : null, key: item.id, children: []};
            groups.push(current);
            if (item.type === 'title') return;
        }
        current.children.push(item);
    });

    return groups;
};

export default function SelectPlatform() {
    const navigate = useNavigate();
    const {botType, isSettled} = usePlatform();
    const {safeAreaInset, contentSafeAreaInset} = useAppInsets();

    const startPages = useStructureStore((state) => state.startPages);
    const pages = useStructureStore((state) => state.pages);
    const popularProducts = useStructureStore((state) => state.popularProducts);
    const pageId = useSessionStore((state) => state.pageId);
    const setPageId = useSessionStore((state) => state.setPageId);

    const [pickedId, setPickedId] = useState(null);
    const [isQuickIntro] = useState(() => introPlayed);
    const mountedAtRef = useRef(performance.now());
    const shiftRef = useRef(null);
    const itemOrder = useRevealOrder(ITEM_ORDER_CAP);
    const railOrder = useRevealOrder(RAIL_ORDER_CAP);

    useEffect(() => {
        getTelegramObject().BackButton?.hide();
        introPlayed = true;
    }, []);

    const activeGlow = useMemo(() => {
        if (!Array.isArray(startPages)) return {};

        const active = startPages.find((item) =>
            pickedId !== null ? item.id === pickedId : item.structurePageId === pageId
        );

        return active ? glowStyle(active.color) : {};
    }, [startPages, pickedId, pageId]);

    const groups = useMemo(() => {
        if (!Array.isArray(startPages) || !isSettled) return [];

        const itemsOf = (platform) => [...startPages]
            .filter((item) => item.platform === platform)
            .sort((a, b) => a.serialNumber - b.serialNumber);

        const visible = itemsOf(botType);
        const fallback = fallbackBotType(botType);

        return toGroups(visible.length || !fallback ? visible : itemsOf(fallback));
    }, [startPages, botType, isSettled]);

    const popular = useMemo(() => {
        if (!Array.isArray(popularProducts) || !isSettled) return [];

        const itemsOf = (platform) => popularProducts
            .filter((item) => item.platform === platform && item.product)
            .sort((a, b) => a.serialNumber - b.serialNumber);

        const visible = itemsOf(botType);
        const fallback = fallbackBotType(botType);

        return visible.length || !fallback ? visible : itemsOf(fallback);
    }, [popularProducts, botType, isSettled]);

    const popularNames = useMemo(() => [...new Set([
        ...popular.map(({product}) => product.name?.trim()).filter(Boolean),
        ...EXTRA_HINTS
    ])], [popular]);

    const regionOfProduct = useMemo(() => {
        const pageById = new Map((pages || []).map((page) => [page.id, page]));
        const startPageByPageId = new Map((startPages || []).map((item) => [item.structurePageId, item]));

        return (product) => {
            const productPageId = product.structurePageId ?? null;
            if (productPageId === null) return null;

            const page = pageById.get(productPageId) || null;
            const startPage = startPageByPageId.get(productPageId) || null;
            if (!page && !startPage) return null;

            return {
                title: regionLabel(page, startPage),
                icon: regionIcon(page, startPage),
                color: startPage?.color || null
            };
        };
    }, [pages, startPages]);

    const openProduct = useCallback((product) => {
        if (pickedId !== null) return;

        hapticImpact('light');

        const fallbackPage = (pages || []).find((page) => !standaloneRoute(page.type));
        const targetPageId = product.structurePageId ?? pageId ?? fallbackPage?.id ?? null;
        if (targetPageId === null) return;

        setPageId(targetPageId);
        navigate(`/card/${product.id}`);
    }, [navigate, pages, pageId, pickedId, setPageId]);

    const openGlobalSearch = useCallback(() => {
        hapticImpact('light');
        primeKeyboard();
        navigate('/search', {state: {allPages: true}});
    }, [navigate]);

    const handleSelect = useCallback((item, page) => {
        if (pickedId !== null) return;

        window.Telegram?.WebApp?.HapticFeedback?.impactOccurred('medium');
        setPickedId(item.id);
        setPageId(item.structurePageId);

        const target = standaloneRoute(page?.type) || '/main';
        setTimeout(() => navigate(target, {state: {skipLeave: true}}), LEAVE_MS);
    }, [navigate, pickedId, setPageId]);

    const fadeZone = contentSafeAreaInset.top;
    const fadeHeight = Math.max(fadeZone - safeAreaInset.top, Math.min(fadeZone, MIN_FADE_PX));
    const solidHeight = Math.max(fadeZone - fadeHeight, 0);

    const pace = isQuickIntro ? 0.5 : 1;
    if (shiftRef.current === null && (groups.length || popular.length)) {
        shiftRef.current = Math.min(performance.now() - mountedAtRef.current, CONTENT_BASE_MS * pace);
    }

    const revealProps = (key) => ({style: {'--i': itemOrder(key)}});

    const renderChild = (item, isTile) => {
        const isPicked = pickedId === item.id;
        const className = [
            style.item,
            style.reveal,
            isTile && item.type === 'page' ? '' : style.itemWide,
            isPicked ? style.picked : ''
        ].join(' ');

        let content;

        if (item.type === 'page') {
            const page = pages?.find((candidate) => candidate.id === item.structurePageId);
            if (!page) return null;

            content = (
                <PlatformCard
                    item={{...page, ...item}}
                    isActive={isPicked || item.structurePageId === pageId}
                    isTile={isTile}
                    onSelect={() => handleSelect(item, page)}
                />
            );
        } else if (item.type === 'link') {
            content = <PlatformLink item={item}/>;
        } else {
            content = <p className={style.hint}>{item.text}</p>;
        }

        return (
            <div key={item.id} className={className} {...revealProps(item.id)}>
                {content}
            </div>
        );
    };

    return (
        <div
            className={[
                style.screen,
                isQuickIntro ? style.screenQuick : '',
                pickedId !== null ? style.leaving : ''
            ].join(' ')}
            style={{
                '--shift': `${Math.round(shiftRef.current ?? 0)}ms`,
                paddingTop: `calc(${contentSafeAreaInset.top}px + 14 * var(--u))`,
                paddingBottom: `calc(${pageId === null ? safeAreaInset.bottom : 0}px + 32 * var(--u))`
            }}
        >
            <div className={style.aurora} aria-hidden="true"/>

            <div
                className={`${style.glow} ${activeGlow.backgroundColor ? style.glowVisible : ''}`}
                style={activeGlow}
                aria-hidden="true"
            />

            {fadeZone > 0 ? (
                <>
                    <div
                        className={style.topSolid}
                        style={{height: `${solidHeight}px`}}
                        aria-hidden="true"
                    />
                    <div
                        className={style.topFade}
                        style={{top: `${solidHeight}px`, height: `${fadeHeight}px`}}
                        aria-hidden="true"
                    />
                </>
            ) : null}

            <h1 className={style.title} aria-label={TITLE_WORDS.map(([word]) => word).join(' ')}>
                {TITLE_WORDS.map(([word, tone], index) => (
                    <React.Fragment key={index}>
                        {index ? ' ' : null}
                        <span
                            className={`${style.word} ${tone ? `${style[tone]} ${style.shine}` : ''}`}
                            style={{'--w': index}}
                            aria-hidden="true"
                        >
                            {word}
                        </span>
                    </React.Fragment>
                ))}
            </h1>

            <button type="button" className={style.search} onClick={openGlobalSearch} aria-label={SEARCH_HINT}>
                <span className={style.searchIcon} aria-hidden="true">
                    <svg viewBox="0 0 24 24" fill="none">
                        <circle cx="10.6" cy="10.6" r="6.7" stroke="currentColor" strokeWidth="2"/>
                        <path d="m15.6 15.6 5 5" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                    </svg>
                </span>

                <span className={style.searchTitle}>
                    <TypingHint base={SEARCH_HINT} phrases={popularNames}/>
                </span>

                <span className={style.searchArrow} aria-hidden="true">
                    <svg viewBox="0 0 24 24" fill="none">
                        <path d="m9 5 7 7-7 7" stroke="currentColor" strokeWidth="2.4"
                              strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                </span>
            </button>

            <PopularRail items={popular} regionOf={regionOfProduct} onOpen={openProduct} orderOf={railOrder}/>

            {groups.map((group) => {
                const isGrid = group.children.filter((item) => item.type === 'page').length > 1;

                return (
                    <section key={group.key} className={`${style.group} ${isGrid ? style.groupGrid : ''}`}>
                        {group.header ? (
                            <div
                                className={`${style.item} ${style.reveal} ${style.itemWide}`}
                                {...revealProps(`title:${group.header.id}`)}
                            >
                                <div className={style.sectionHeader}>
                                    {group.header.icon ? (
                                        <span
                                            className={style.sectionIcon}
                                            style={{backgroundImage: `url(${group.header.icon})`}}
                                            aria-hidden="true"
                                        />
                                    ) : null}
                                    <span className={style.sectionTitle}>{group.header.text}</span>
                                </div>
                            </div>
                        ) : null}

                        {group.children.map((item) => renderChild(item, isGrid))}
                    </section>
                );
            })}
        </div>
    );
}
