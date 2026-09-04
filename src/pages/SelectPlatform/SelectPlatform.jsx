import React, {useCallback, useEffect, useMemo, useState} from 'react';
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
import {glowStyle} from './accent';
import PopularRail from './PopularRail';
import PlatformCard from './PlatformCard';
import PlatformLink from './PlatformLink';
import style from './SelectPlatform.module.scss';

const MIN_FADE_PX = 24;
const STAGGER_MS = 22;
const STAGGER_CAP_MS = 170;
const LEAVE_MS = 265;
const ENTER_MS = 210;

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
    const [isEntering, setIsEntering] = useState(true);

    useEffect(() => {
        getTelegramObject().BackButton?.hide();
    }, []);

    useEffect(() => {
        const timerId = setTimeout(() => setIsEntering(false), STAGGER_CAP_MS + ENTER_MS + 120);
        return () => clearTimeout(timerId);
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

    // Карточка товара живёт внутри страницы: без pageId роутер уводит покупателя
    // обратно на выбор витрины. Берём страницу каталога товара, а если каталог
    // ни к одной не привязан — первую обычную страницу витрины.
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

    let order = 0;
    const revealProps = () => {
        const delay = Math.min(order++ * STAGGER_MS, STAGGER_CAP_MS);
        return isEntering ? {style: {animationDelay: `${delay}ms`}} : {};
    };

    const renderChild = (item) => {
        const isPicked = pickedId === item.id;
        const className = [
            style.item,
            isEntering ? style.entering : '',
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
                    onSelect={() => handleSelect(item, page)}
                />
            );
        } else if (item.type === 'link') {
            content = <PlatformLink item={item}/>;
        } else {
            content = <p className={style.hint}>{item.text}</p>;
        }

        return (
            <div key={item.id} className={className} {...revealProps()}>
                {content}
            </div>
        );
    };

    return (
        <div
            className={`${style.screen} ${pickedId !== null ? style.leaving : ''}`}
            style={{
                paddingTop: `calc(${contentSafeAreaInset.top}px + 14 * var(--u))`,
                paddingBottom: `calc(${pageId === null ? safeAreaInset.bottom : 0}px + 32 * var(--u))`
            }}
        >
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

            <h1 className={style.title}>
                Геймворд — ваш сервис для покупки игр и подписок для <span className={style.ps}>PlayStation</span> и{' '}
                <span className={style.xbox}>Xbox</span>
            </h1>

            <button type="button" className={style.search} onClick={openGlobalSearch}>
                <span className={style.searchIcon} aria-hidden="true">
                    <svg viewBox="0 0 24 24" fill="none">
                        <circle cx="10.6" cy="10.6" r="6.7" stroke="currentColor" strokeWidth="2"/>
                        <path d="m15.6 15.6 5 5" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                    </svg>
                </span>

                <span className={style.searchBody}>
                    <span className={style.searchTitle}>Поиск</span>
                    <span className={style.searchNote}>Игры, подписки и донат в одном месте</span>
                </span>

                <span className={style.searchArrow} aria-hidden="true">
                    <svg viewBox="0 0 24 24" fill="none">
                        <path d="m9 5 7 7-7 7" stroke="currentColor" strokeWidth="2.4"
                              strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                </span>
            </button>

            <PopularRail items={popular} onOpen={openProduct}/>

            {groups.map((group) => (
                <section key={group.key} className={style.group}>
                    {group.header ? (
                        <div className={`${style.item} ${isEntering ? style.entering : ''}`} {...revealProps()}>
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

                    {group.children.map(renderChild)}
                </section>
            ))}
        </div>
    );
}
