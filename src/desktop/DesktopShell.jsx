import React, {useEffect, useMemo, useRef, useState} from 'react';
import {useLocation} from 'react-router-dom';
import './styles/desktop.css';
import './styles/motion.css';
import TopBar from './shell/TopBar';
import DesktopRoutes from './DesktopRoutes';
import {useCartStore} from '../store/useCartStore';
import {selectUserId, useSessionStore} from '../store/useSessionStore';
import {ScrollAreaContext} from './shell/ScrollAreaContext';
import {StorefrontScopeContext} from './shell/StorefrontScope';
import {MaintenanceContext} from './shell/MaintenanceScope';
import style from './DesktopShell.module.scss';

export default function DesktopShell({sections}) {
    const {pathname} = useLocation();
    const areaRef = useRef(null);

    const [isSearchOpen, setSearchOpen] = useState(false);
    const [scopeId, setScopeId] = useState(null);

    const scope = useMemo(() => ({scopeId, setScopeId}), [scopeId]);

    const userId = useSessionStore(selectUserId);
    const loadCart = useCartStore((store) => store.load);

    useEffect(() => {
        loadCart(userId);
    }, [userId, loadCart]);

    useEffect(() => {
        areaRef.current?.scrollTo({top: 0, behavior: 'instant'});
    }, [pathname]);

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
                        </main>
                    </div>
                </MaintenanceContext.Provider>
            </StorefrontScopeContext.Provider>
        </ScrollAreaContext.Provider>
    );
}
