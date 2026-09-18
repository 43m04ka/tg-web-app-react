import React, {useCallback, useEffect, useMemo, useState} from 'react';
import {useLocation, useNavigate} from 'react-router-dom';
import {useSessionStore} from '../../store/useSessionStore';
import {useStructureStore} from '../../store/useStructureStore';
import {useCartStore} from '../../store/useCartStore';
import {usePlatform} from '../../shared/hooks/usePlatform';
import {pageCartItems} from '../../pages/Basket/cartModel';
import {resetSearchState} from '../../shared/lib/searchMemory';
import {sectionList, storefrontList} from '../model/desktopNav';
import {useScrolled} from './useScrolled';
import {BasketIcon, UserIcon} from './DesktopIcons';
import SearchBox from './SearchBox';
import RegionMenu from './RegionMenu';
import style from './TopBar.module.scss';

export default function TopBar() {
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

    const [pickedId, setPickedId] = useState(null);
    const [isSearchOpen, setSearchOpen] = useState(false);

    const isScrolled = useScrolled();

    useEffect(() => {
        if (storefronts.some((item) => item.id === pageId)) setPickedId(pageId);
    }, [pageId, storefronts]);

    const storefrontId = pickedId ?? storefronts[0]?.id ?? null;

    const cartSize = pageCartItems(cartItems, catalogs, pageId)?.length ?? 0;

    const go = useCallback((path, options) => {
        if (pathname === '/search') resetSearchState();
        navigate(path, options);
    }, [navigate, pathname]);

    const openSection = useCallback((section) => {
        setPageId(section.pageId);
        go(section.route);
    }, [go, setPageId]);

    const openCatalog = useCallback(() => {
        if (storefrontId === null) return;

        setPageId(storefrontId);
        go('/main');
    }, [go, setPageId, storefrontId]);

    const pickStorefront = useCallback((item) => {
        setPageId(item.id);
        go('/main');
    }, [go, setPageId]);

    return (
        <header className={[style.bar, isScrolled ? style.barScrolled : '', isSearchOpen ? style.quiet : ''].filter(Boolean).join(' ')}>
            <div className={style.inner}>
                <button type="button" className={style.logo} onClick={() => go('/')}>
                    <span className={style.mark}>Г</span>
                    <span className={style.brand}>Геймворд</span>
                </button>

                <nav className={isSearchOpen ? style.nav + ' ' + style.navQuiet : style.nav}>
                    <button
                        type="button"
                        className={`${style.link} ${pathname === '/main' ? style.linkActive : ''}`}
                        onClick={openCatalog}
                    >
                        Каталог
                    </button>

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

                <SearchBox onOpenChange={setSearchOpen}/>

                <div className={style.actions}>
                    <RegionMenu items={storefronts} activeId={storefrontId} onSelect={pickStorefront}/>

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
