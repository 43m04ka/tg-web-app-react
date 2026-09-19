import React, {useCallback, useMemo} from 'react';
import {useLocation, useNavigate} from 'react-router-dom';
import {useSessionStore} from '../../store/useSessionStore';
import {useStructureStore} from '../../store/useStructureStore';
import {useCartStore} from '../../store/useCartStore';
import {usePlatform} from '../../shared/hooks/usePlatform';
import {pageCartItems} from '../../pages/Basket/cartModel';
import {resetSearchState} from '../../shared/lib/searchMemory';
import {resolveBotType, sectionList, storefrontList} from '../model/desktopNav';
import {storefrontConfig} from '../model/storefrontConfig';
import {scopeQueries, useScopeTotals} from '../model/storefrontTotals';
import {useScrolled} from './useScrolled';
import {BasketIcon, UserIcon} from './DesktopIcons';
import logo from '../assets/logo.png';
import SearchBox from './SearchBox';
import RegionMenu from './RegionMenu';
import {useStorefrontScope} from './StorefrontScope';
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

    const sections = useMemo(
        () => sectionList(startPages, pages, botType),
        [startPages, pages, botType]
    );

    const {scopeId, setScopeId} = useStorefrontScope();

    const queries = useMemo(
        () => scopeQueries(storefronts, {
            botType: resolveBotType(startPages, botType),
            sorting: storefrontConfig(null).sorting
        }),
        [storefronts, startPages, botType]
    );

    const totals = useScopeTotals(queries, {enabled: storefronts.length > 0});

    const isScrolled = useScrolled();
    const isStandalone = pathname === '/steam' || pathname === '/services';

    const cartSize = pageCartItems(cartItems, catalogs, pageId)?.length ?? 0;

    const go = useCallback((path, options) => {
        if (pathname === '/search') resetSearchState();
        navigate(path, options);
    }, [navigate, pathname]);

    const openSection = useCallback((section) => {
        setPageId(section.pageId);
        go(section.route);
    }, [go, setPageId]);

    const pickStorefront = useCallback((item) => {
        setScopeId(item.id);
        if (item.id !== null) setPageId(item.id);
        go('/');
    }, [go, setPageId, setScopeId]);

    return (
        <header className={isScrolled ? `${style.bar} ${style.barScrolled}` : style.bar}>
            <div className={style.inner}>
                <button type="button" className={style.logo} onClick={() => go('/')}>
                    <span
                        className={style.mark}
                        style={{'--logo': `url(${logo})`}}
                        aria-hidden="true"
                    />
                    <span className={style.brand}>Геймворд</span>
                </button>

                <nav className={style.nav}>
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

                <SearchBox onOpenChange={onSearchOpenChange}/>

                <div className={style.actions}>
                    <RegionMenu
                        items={storefronts}
                        scopeId={scopeId}
                        onSelect={pickStorefront}
                        totals={totals}
                    />

                    {isStandalone ? null : (
                        <button
                            type="button"
                            className={`${style.action} ${pathname === '/basket' ? style.actionActive : ''}`}
                            onClick={() => go('/basket')}
                            aria-label="Корзина"
                        >
                            <BasketIcon className={style.actionIcon}/>
                            {cartSize > 0 ? (
                                <span key={cartSize} className={style.badge}>{cartSize > 99 ? '99+' : cartSize}</span>
                            ) : null}
                        </button>
                    )}

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
