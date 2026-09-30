import React, {useCallback, useEffect, useMemo, useRef, useState} from 'react';
import {useLocation, useNavigate} from 'react-router-dom';
import {useSessionStore} from '../../store/useSessionStore';
import {useStructureStore} from '../../store/useStructureStore';
import {useCartStore} from '../../store/useCartStore';
import {usePlatform} from '../../shared/hooks/usePlatform';
import {pageCartItems} from '../../pages/Basket/cartModel';
import {resetSearchState} from '../../shared/lib/searchMemory';
import {navLabel, sectionList, storefrontList} from '../model/desktopNav';
import {menuGroups} from '../model/menuModel';
import {useTextPageLinks} from '../../shared/textPages/useTextPages';
import {useScrolled} from './useScrolled';
import {BasketIcon, UserIcon} from './DesktopIcons';
import logo from '../assets/logo-full.png';
import SearchBox from './SearchBox';
import BackLink from '../ui/BackLink';
import MenuDrop from './MenuDrop';
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
    const isCatalog = pathname === '/' || pathname.startsWith('/catalog');
    const isSearchPage = pathname === '/search';

    const [isSearchOpen, setSearchOpen] = useState(false);

    const isFocusMode = isSearchOpen;
    const showBack = pathname !== '/' && !isFocusMode;

    const onSearchOpen = useCallback((open) => {
        setSearchOpen(open);
        onSearchOpenChange?.(open);
    }, [onSearchOpenChange]);

    const isScoped = scopeId !== null;
    const cartSize = isScoped ? (pageCartItems(cartItems, catalogs, pageId)?.length ?? 0) : 0;

    const keptCartRef = useRef(cartSize);
    if (!isStandalone) keptCartRef.current = cartSize;

    const cartCount = isStandalone ? keptCartRef.current : cartSize;

    const go = useCallback((path, options) => {
        if (pathname === '/search') resetSearchState();
        navigate(path, options);
    }, [navigate, pathname]);

    const openSection = useCallback((section) => {
        setPageId(section.pageId);
        go(section.route);
    }, [go, setPageId]);

    const storefrontIds = useMemo(() => storefronts.map((item) => item.id), [storefronts]);

    useEffect(() => {
        if (isStandalone) return;

        const target = scopeId ?? (storefrontIds.includes(pageId) ? pageId : storefrontIds[0] ?? null);

        if (target !== null && target !== pageId) setPageId(target);
    }, [isStandalone, scopeId, pageId, storefrontIds, setPageId]);

    const openHome = useCallback(() => {
        setScopeId(null);
        go('/');
    }, [go, setScopeId]);

    const textPages = useTextPageLinks();

    const pickStorefront = useCallback((item) => {
        setScopeId(item.id);
        setPageId(item.id);
        go('/');
    }, [go, setPageId, setScopeId]);

    const selectMenuItem = useCallback((item) => {
        if (item.action === 'storefront') pickStorefront(item.shop);
        else if (item.action === 'section') openSection(item.section);
        else if (item.action === 'subscription') {
            setScopeId(item.shop.id);
            setPageId(item.shop.id);
            go(item.to);
        } else go(item.to);
    }, [go, openSection, pickStorefront, setPageId, setScopeId]);

    const menu = useMemo(
        () => menuGroups({storefronts, sections, catalogs, textPages}),
        [storefronts, sections, catalogs, textPages]
    );

    return (
        <header className={isScrolled ? `${style.bar} ${style.barScrolled}` : style.bar}>
            <div className={style.inner}>
                <div className={style.lead} data-hidden={isFocusMode ? '' : undefined}>
                    <div className={style.backSlot} data-hidden={showBack ? undefined : ''}>
                        <BackLink to="/" label="Назад" className={style.back}/>
                    </div>

                    <button type="button" className={style.logo} onClick={openHome}>
                        <img className={style.mark} src={logo} alt="Геймворд"/>
                    </button>
                </div>

                <nav className={style.nav} data-hidden={isFocusMode ? '' : undefined}>
                    <button
                        type="button"
                        className={isCatalog && !isScoped ? `${style.link} ${style.linkActive}` : style.link}
                        onClick={openHome}
                    >
                        Главная
                    </button>

                    {storefronts.map((item) => (
                        <button
                            key={item.id}
                            type="button"
                            className={isCatalog && scopeId === item.id
                                ? `${style.link} ${style.linkActive}`
                                : style.link}
                            onClick={() => pickStorefront(item)}
                        >
                            {navLabel(item.type, item.label)}
                        </button>
                    ))}

                    {sections.map((section) => (
                        <button
                            key={section.key}
                            type="button"
                            className={`${style.link} ${pathname === section.route ? style.linkActive : ''}`}
                            onClick={() => openSection(section)}
                        >
                            {section.label}
                        </button>
                    ))}
                </nav>

                <SearchBox
                    onOpenChange={onSearchOpen}
                    hidden={isStandalone || isSearchPage}
                />

                <div className={style.actions} data-hidden={isFocusMode ? '' : undefined}>
                    <MenuDrop groups={menu} onSelect={selectMenuItem}/>

                    <div
                        className={style.slot}
                        style={{'--slot': '38px'}}
                        data-slot="cart"
                        data-hidden={isStandalone ? '' : undefined}
                        aria-hidden={isStandalone ? 'true' : undefined}
                    >
                        <button
                            type="button"
                            className={`${style.action} ${pathname === '/basket' ? style.actionActive : ''}`}
                            onClick={() => go('/basket')}
                            disabled={!isScoped}
                            title={isScoped ? undefined : 'Выберите витрину'}
                            aria-label="Корзина"
                        >
                            <BasketIcon className={style.actionIcon}/>
                            {cartCount > 0 ? (
                                <span key={cartCount} className={style.badge}>{cartCount > 99 ? '99+' : cartCount}</span>
                            ) : null}
                        </button>
                    </div>

                    <button
                        type="button"
                        className={`${style.action} ${pathname === '/more' ? style.actionActive : ''}`}
                        onClick={() => go('/more')}
                        aria-label="Профиль"
                    >
                        <UserIcon className={style.actionIcon}/>
                    </button>
                </div>
            </div>
        </header>
    );
}
