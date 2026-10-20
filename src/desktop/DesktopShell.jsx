import React, {useEffect, useLayoutEffect, useMemo, useRef, useState} from 'react';
import {useLocation, useNavigationType} from 'react-router-dom';
import './styles/desktop.css';
import './styles/motion.css';
import TopBar from './shell/TopBar';

import SiteFooter from './shell/SiteFooter';
import CookieNotice from './shell/CookieNotice';
import DesktopRoutes from './DesktopRoutes';
import {useCartStore} from '../store/useCartStore';
import {selectUserId, useSessionStore} from '../store/useSessionStore';
import {ScrollAreaContext} from './shell/ScrollAreaContext';
import {StorefrontScopeContext} from './shell/StorefrontScope';
import {MaintenanceContext} from './shell/MaintenanceScope';
import {useDesktopAccent} from './shell/useDesktopAccent';
import {storefrontParam} from './model/desktopNav';
import style from './DesktopShell.module.scss';

export default function DesktopShell({sections}) {
    const {pathname, search} = useLocation();
    const navigationType = useNavigationType();
    const areaRef = useRef(null);

    const [isSearchOpen, setSearchOpen] = useState(false);

    const storeParam = pathname === '/' ? storefrontParam(search) : null;
    const urlScope = storeParam !== null
        ? storeParam
        : pathname === '/' && navigationType === 'POP' ? null : undefined;
    const [keptScope, setScopeId] = useState(() => urlScope ?? null);
    const scopeId = urlScope === undefined ? keptScope : urlScope;

    useEffect(() => {
        if (urlScope !== undefined) setScopeId(urlScope);
    }, [urlScope]);

    const scope = useMemo(() => ({scopeId, setScopeId}), [scopeId]);

    useDesktopAccent(scopeId);

    const userId = useSessionStore(selectUserId);
    const loadCart = useCartStore((store) => store.load);

    useEffect(() => {
        loadCart(userId);
    }, [userId, loadCart]);

    useLayoutEffect(() => {
        const node = areaRef.current;
        if (!node) return;

        const restored = node.dataset.restored === pathname;
        delete node.dataset.restored;

        if (navigationType === 'POP' && restored) return;
        node.scrollTo({top: 0, behavior: 'instant'});
    }, [pathname, navigationType]);

    return (
        <ScrollAreaContext.Provider value={areaRef}>
            <StorefrontScopeContext.Provider value={scope}>
                <MaintenanceContext.Provider value={sections}>
                    <div className={style.shell}>
                        <div
                            className={isSearchOpen ? `${style.scrim} ${style.scrimOn}` : style.scrim}
                            aria-hidden="true"
                        />

                        <TopBar onSearchOpenChange={setSearchOpen}/>

                        <main className={style.area} ref={areaRef} data-scrollable="">
                            <div key={pathname} className={style.content}>
                                <DesktopRoutes sections={sections}/>
                            </div>
                            <SiteFooter/>
                        </main>

                        <CookieNotice/>
                    </div>
                </MaintenanceContext.Provider>
            </StorefrontScopeContext.Provider>
        </ScrollAreaContext.Provider>
    );
}
