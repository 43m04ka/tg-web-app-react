import React, {useCallback} from 'react';
import {useLocation, useNavigate} from 'react-router-dom';
import {useSessionStore} from '../../../store/useSessionStore';
import {useStructureStore} from '../../../store/useStructureStore';
import {useCartStore} from '../../../store/useCartStore';
import {pageCartItems} from '../../../pages/Basket/cartModel';
import {useAppInsets} from '../../hooks/useAppInsets';
import {hapticImpact} from '../../lib/haptic';
import {WIDEST_REGION_TITLE, regionIcon, regionTitle} from '../../lib/region';
import {resetSearchState} from '../../lib/searchMemory';
import {BasketIcon, ChevronIcon, HomeIcon, MoreIcon, SearchIcon} from './NavIcons';
import style from './NavBar.module.scss';

const hasOwnBottomBar = (pathname) => pathname.startsWith('/card/') || pathname === '/checkout';

const TABS = [
    {path: '/main', label: 'Главная', Icon: HomeIcon, effect: 'home'},
    {path: '/search', label: 'Поиск', Icon: SearchIcon, effect: 'search'},
    {path: '/basket', label: 'Корзина', Icon: BasketIcon, effect: 'basket'},
    {path: '/more', label: 'Ещё', Icon: MoreIcon, effect: 'more'}
];

export default function NavBar() {
    const navigate = useNavigate();
    const {pathname, state} = useLocation();
    const {safeAreaInset, isKeyboardOpen} = useAppInsets();

    const pageId = useSessionStore((state) => state.pageId);
    const pages = useStructureStore((state) => state.pages);
    const startPages = useStructureStore((state) => state.startPages);
    const catalogs = useStructureStore((state) => state.catalogs);
    const cartItems = useCartStore((state) => state.items);

    const cartSize = pageCartItems(cartItems, catalogs, pageId)?.length ?? 0;

    const page = pages?.find((candidate) => candidate.id === pageId);
    const startPage = startPages?.find((candidate) => candidate.structurePageId === pageId);
    const icon = regionIcon(page, startPage);

    const press = useCallback(() => hapticImpact('light'), []);

    const isGlobalSearch = pathname === '/search' && Boolean(state?.allPages);

    const go = useCallback((path) => {
        if (pathname === path && !(path === '/search' && isGlobalSearch)) return;

        if (pathname === '/search') resetSearchState();

        if (path === '/search') navigate(path, {state: null, replace: isGlobalSearch});
        else navigate(path);
    }, [navigate, pathname, isGlobalSearch]);

    const isRouteHidden = hasOwnBottomBar(pathname);
    const isHidden = isRouteHidden || isKeyboardOpen;

    const left = TABS.slice(0, 2);
    const right = TABS.slice(2);

    const renderTab = ({path, label, Icon, effect}) => {
        const isActive = pathname === path;
        const badge = path === '/basket' && cartSize > 0 ? cartSize : null;

        return (
            <button
                key={path}
                type="button"
                className={`${style.tab} ${isActive ? style.tabActive : ''}`}
                data-effect={effect}
                onPointerDown={press}
                onClick={() => go(path)}
                aria-current={isActive ? 'page' : undefined}
            >
                <span className={style.iconBox}>
                    <Icon className={style.icon}/>
                    {badge ? <span className={style.badge}>{badge > 99 ? '99+' : badge}</span> : null}
                </span>
                <span className={style.label}>{label}</span>
            </button>
        );
    };

    return (
        <nav
            className={`${style.bar} ${isRouteHidden ? style.barRouteHidden : ''} ${isKeyboardOpen && !isRouteHidden ? style.barHidden : ''}`}
            style={{paddingBottom: `calc(${safeAreaInset.bottom}px + 12 * var(--u))`}}
            aria-hidden={isHidden}
        >
            {left.map(renderTab)}

            <button
                type="button"
                className={`${style.platform} ${pathname === '/' ? style.tabActive : ''}`}
                onPointerDown={press}
                onClick={() => go('/')}
            >
                <span className={style.chip}>
                    {icon ? (
                        <span
                            className={style.chipIcon}
                            style={{backgroundImage: `url(${icon})`}}
                            aria-hidden="true"
                        />
                    ) : null}
                    <span className={style.chipTitle}>
                        <span className={style.sizer} aria-hidden="true">{WIDEST_REGION_TITLE}</span>
                        <span className={style.value}>{regionTitle(page, startPage)}</span>
                    </span>
                    <ChevronIcon className={style.chevron}/>
                </span>
                <span className={style.label}>Платформа</span>
            </button>

            {right.map(renderTab)}
        </nav>
    );
}
