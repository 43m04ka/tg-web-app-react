import React, {useCallback, useMemo, useState} from 'react';
import {useLocation, useNavigate} from 'react-router-dom';
import {useSessionStore} from '../../store/useSessionStore';
import {useStructureStore} from '../../store/useStructureStore';
import {useCartStore} from '../../store/useCartStore';
import {usePlatform} from '../../shared/hooks/usePlatform';
import {resetSearchState} from '../../shared/lib/searchMemory';
import {navLabel, resolveBotType, sectionList, storefrontList, storefrontRoute} from '../model/desktopNav';
import {useScrolled} from './useScrolled';
import {BasketIcon, UserIcon} from './DesktopIcons';
import SearchBox from './SearchBox';
import BackLink from '../ui/BackLink';
import RouteLink from '../ui/RouteLink';
import MenuDrop from './MenuDrop';
import BrandLogo from './BrandLogo';
import ReviewRating from './ReviewRating';
import PlayStationNav from './PlayStationNav';
import {useSiteMenu} from './useSiteMenu';
import {useStorefrontScope} from './StorefrontScope';
import {useOpenSections} from './MaintenanceScope';
import style from './TopBar.module.scss';

export default function TopBar({onSearchOpenChange}) {
    const navigate = useNavigate();
    const {pathname} = useLocation();
    const {botType} = usePlatform();

    const pages = useStructureStore((store) => store.pages);
    const startPages = useStructureStore((store) => store.startPages);
    const catalogs = useStructureStore((store) => store.catalogs);
    const cartItems = useCartStore((store) => store.items);

    const pageId = useSessionStore((store) => store.pageId);
    const setPageId = useSessionStore((store) => store.setPageId);

    const storefronts = useMemo(
        () => storefrontList(startPages, pages, botType),
        [startPages, pages, botType]
    );

    const allSections = useMemo(
        () => sectionList(startPages, pages, botType),
        [startPages, pages, botType]
    );

    const sections = useOpenSections(allSections);

    const {scopeId, setScopeId} = useStorefrontScope();

    const isScrolled = useScrolled();
    const isStandalone = pathname === '/steam' || pathname === '/services';
    const isSearchPage = pathname === '/search';

    const [isSearchOpen, setSearchOpen] = useState(false);

    const isFocusMode = isSearchOpen;
    const showBack = pathname !== '/' && !isFocusMode;

    const onSearchOpen = useCallback((open) => {
        setSearchOpen(open);
        onSearchOpenChange?.(open);
    }, [onSearchOpenChange]);

    const isScoped = scopeId !== null;
    const cartCount = cartItems?.length ?? 0;
    const playstation = storefronts.filter((item) => item.type === 'ps' || item.type === 'ps_india').map((item) => {
        const entry = (startPages || []).find((row) => row.structurePageId === item.id && row.type === 'page'
            && row.platform === resolveBotType(startPages, botType));
        return {...item, note: entry?.text, choiceIcon: entry?.icon, choiceColor: entry?.color};
    });
    const otherStorefronts = storefronts.filter((item) => item.type !== 'ps' && item.type !== 'ps_india');

    const go = useCallback((path, options) => {
        if (pathname === '/search') resetSearchState();
        navigate(path, options);
    }, [navigate, pathname]);

    const openSection = useCallback((section) => {
        setPageId(section.pageId);
        go(section.route);
    }, [go, setPageId]);

    const openHome = useCallback(() => {
        setScopeId(null);
        go('/');
    }, [go, setScopeId]);

    const pickStorefront = useCallback((item) => {
        setScopeId(item.id);
        setPageId(item.id);
        go(storefrontRoute(item.id));
    }, [go, setPageId, setScopeId]);

    const openCart = useCallback(() => {
        const hasCurrentItems = cartItems?.some((item) => catalogs?.some((catalog) => catalog.id === item.catalogId && catalog.structurePageId === pageId));
        const target = hasCurrentItems ? pageId
            : catalogs?.find((catalog) => catalog.id === cartItems?.[0]?.catalogId)?.structurePageId
                ?? storefronts[0]?.id ?? null;
        if (target !== null) {
            setScopeId(target);
            setPageId(target);
        }
        go('/basket');
    }, [cartItems, catalogs, pageId, storefronts, setScopeId, setPageId, go]);

    const {groups: menu, select: selectMenuItem} = useSiteMenu();

    return (
        <header className={isScrolled ? `${style.bar} ${style.barScrolled}` : style.bar}>
            <div className={style.utility}>
                <div className={style.utilityInner}>
                    <span className={style.fulfillment} title="Приём заказов круглосуточно">
                        <span className={style.statusDot} aria-hidden="true"/>
                        Выдача заказов с 10:00 до 22:00 МСК, приём заказов круглосуточно
                    </span>
                    <div className={style.utilityLinks}>
                        <RouteLink to="/activate" className={style.marketplace}>Получить заказ с маркетплейса</RouteLink>
                        <RouteLink to="/faq">База знаний</RouteLink>
                        <span className={style.reviewsGroup}>
                            <RouteLink to="/reviews">Отзывы</RouteLink>
                            <ReviewRating/>
                        </span>
                    </div>
                </div>
            </div>
            <div className={style.inner}>
                <div className={style.lead} data-hidden={isFocusMode ? '' : undefined}>
                    <div className={style.backSlot} data-hidden={showBack ? undefined : ''}>
                        <BackLink to="/" label="Назад" className={style.back}/>
                    </div>

                    <RouteLink to="/" className={style.logo} onOpen={openHome} aria-label="Главная">
                        <BrandLogo/>
                    </RouteLink>
                </div>

                <nav className={style.nav} data-hidden={isFocusMode ? '' : undefined}>
                    <RouteLink
                        to="/"
                        className={pathname === '/' && !isScoped ? `${style.link} ${style.linkActive}` : style.link}
                        onOpen={openHome}
                    >
                        Главная
                    </RouteLink>

                    <PlayStationNav items={playstation} scopeId={scopeId} onSelect={pickStorefront}/>

                    {otherStorefronts.map((item) => (
                        <RouteLink
                            key={item.id}
                            to={storefrontRoute(item.id)}
                            className={!isStandalone && scopeId === item.id
                                ? `${style.link} ${style.linkActive}`
                                : style.link}
                            onOpen={() => pickStorefront(item)}
                        >
                            {navLabel(item.type, item.label)}
                        </RouteLink>
                    ))}

                    {[...sections].sort((a, b) => (a.key === 'services' ? -1 : 1) - (b.key === 'services' ? -1 : 1)).map((section) => (
                        <RouteLink
                            key={section.key}
                            to={section.route}
                            className={`${style.link} ${pathname === section.route ? style.linkActive : ''}`}
                            onOpen={() => openSection(section)}
                        >
                            {section.label}
                        </RouteLink>
                    ))}
                </nav>

                <SearchBox
                    onOpenChange={onSearchOpen}
                    hidden={isStandalone || isSearchPage}
                />

                <div className={style.actions} data-hidden={isFocusMode ? '' : undefined}>

                    <div
                        className={style.slot}
                        style={{'--slot': '38px'}}
                        data-slot="cart"
                    >
                        <button
                            type="button"
                            className={`${style.action} ${pathname === '/basket' ? style.actionActive : ''}`}
                            onClick={openCart}
                            aria-label="Корзина"
                        >
                            <BasketIcon className={style.actionIcon}/>
                            {cartCount > 0 ? (
                                <span key={cartCount} className={style.badge}>{cartCount > 99 ? '99+' : cartCount}</span>
                            ) : null}
                        </button>
                    </div>

                    <RouteLink
                        to="/more"
                        className={`${style.action} ${pathname === '/more' ? style.actionActive : ''}`}
                        onOpen={() => go('/more')}
                        aria-label="Профиль"
                    >
                        <UserIcon className={style.actionIcon}/>
                    </RouteLink>
                    <MenuDrop groups={menu} onSelect={selectMenuItem} compact/>
                </div>
            </div>
        </header>
    );
}
