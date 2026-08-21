import React, {useCallback} from 'react';
import {useLocation, useNavigate} from 'react-router-dom';
import {useSessionStore} from '../../../store/useSessionStore';
import {useStructureStore} from '../../../store/useStructureStore';
import {useAppInsets} from '../../hooks/useAppInsets';
import {getTelegramObject} from '../../lib/telegram';
import {BasketIcon, ChevronIcon, HomeIcon, MoreIcon, SearchIcon} from './NavIcons';
import style from './NavBar.module.scss';

const SHORT_TITLES = {
    ps: 'Турция',
    ps_india: 'Индия',
    xbox: 'Xbox',
    steam: 'Steam',
    services: 'Сервисы'
};

const WIDEST_TITLE = Object.values(SHORT_TITLES).reduce(
    (widest, title) => (title.length > widest.length ? title : widest),
    ''
);

const TABS = [
    {path: '/main', label: 'Главная', Icon: HomeIcon, effect: 'home'},
    {path: '/search', label: 'Поиск', Icon: SearchIcon, effect: 'search'},
    {path: '/basket', label: 'Корзина', Icon: BasketIcon, effect: 'basket'},
    {path: '/more', label: 'Ещё', Icon: MoreIcon, effect: 'more'}
];

export default function NavBar() {
    const navigate = useNavigate();
    const {pathname} = useLocation();
    const {safeAreaInset, isKeyboardOpen} = useAppInsets();

    const pageId = useSessionStore((state) => state.pageId);
    const pages = useStructureStore((state) => state.pages);
    const startPages = useStructureStore((state) => state.startPages);

    const page = pages?.find((candidate) => candidate.id === pageId);
    const startPage = startPages?.find((candidate) => candidate.structurePageId === pageId);
    const icon = startPage?.icon || page?.barIcon;

    const go = useCallback((path) => {
        if (pathname === path) return;
        getTelegramObject().HapticFeedback?.selectionChanged?.();
        navigate(path);
    }, [navigate, pathname]);

    if (isKeyboardOpen) return null;

    const left = TABS.slice(0, 2);
    const right = TABS.slice(2);

    const renderTab = ({path, label, Icon, effect}) => {
        const isActive = pathname === path;

        return (
            <button
                key={path}
                type="button"
                className={`${style.tab} ${isActive ? style.tabActive : ''}`}
                data-effect={effect}
                onClick={() => go(path)}
                aria-current={isActive ? 'page' : undefined}
            >
                <Icon className={style.icon}/>
                <span className={style.label}>{label}</span>
            </button>
        );
    };

    return (
        <nav
            className={style.bar}
            style={{paddingBottom: `calc(${safeAreaInset.bottom}px + 12 * var(--u))`}}
        >
            {left.map(renderTab)}

            <button
                type="button"
                className={`${style.platform} ${pathname === '/' ? style.tabActive : ''}`}
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
                        <span className={style.sizer} aria-hidden="true">{WIDEST_TITLE}</span>
                        <span className={style.value}>
                            {SHORT_TITLES[page?.type] || startPage?.title || page?.title || 'Витрина'}
                        </span>
                    </span>
                    <ChevronIcon className={style.chevron}/>
                </span>
                <span className={style.label}>Платформа</span>
            </button>

            {right.map(renderTab)}
        </nav>
    );
}
