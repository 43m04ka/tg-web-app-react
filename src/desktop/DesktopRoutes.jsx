import React, {useEffect, useMemo} from 'react';
import {Navigate, Route, Routes, useLocation} from 'react-router-dom';
import DesktopCatalog from './pages/Catalog/DesktopCatalog';
import DesktopSearch from './pages/Search/DesktopSearch';
import DesktopBasket from './pages/Basket/DesktopBasket';
import DesktopCheckout from './pages/Basket/DesktopCheckout';
import DesktopMore from './pages/Account/DesktopMore';
import DesktopFavorites from './pages/Account/DesktopFavorites';
import DesktopHistory from './pages/Account/DesktopHistory';
import DesktopSteam from './pages/Steam/DesktopSteam';
import DesktopServices from './pages/Services/DesktopServices';
import DesktopSubscription from './pages/Subscription/DesktopSubscription';
import DesktopProduct from './pages/Product/DesktopProduct';
import Maintenance from '../pages/Maintenance/Maintenance';
import {useSessionStore} from '../store/useSessionStore';
import {useStructureStore} from '../store/useStructureStore';
import {usePlatform} from '../shared/hooks/usePlatform';
import {closedSection} from '../shared/lib/maintenance';
import {isStandalonePage, pageTypeOf} from '../shared/lib/pageRoutes';
import {defaultStorefrontId, pageIdOfType} from './model/desktopNav';
import Storefront from './pages/Storefront/Storefront';

function useDefaultPageId() {
    const {botType} = usePlatform();
    const pages = useStructureStore((store) => store.pages);
    const startPages = useStructureStore((store) => store.startPages);

    return useMemo(
        () => defaultStorefrontId(startPages, pages, botType),
        [startPages, pages, botType]
    );
}

function EnsurePage({children}) {
    const pages = useStructureStore((store) => store.pages);
    const pageId = useSessionStore((store) => store.pageId);
    const setPageId = useSessionStore((store) => store.setPageId);

    const fallbackId = useDefaultPageId();
    const needsStorefront = pageId === null || isStandalonePage(pageTypeOf(pages, pageId));

    useEffect(() => {
        if (needsStorefront && fallbackId !== null) setPageId(fallbackId);
    }, [fallbackId, needsStorefront, setPageId]);

    if (!needsStorefront) return children;
    return fallbackId === null ? <Navigate to="/" replace/> : null;
}

function EnsureStandalone({type, children}) {
    const pages = useStructureStore((store) => store.pages);
    const setPageId = useSessionStore((store) => store.setPageId);
    const pageId = useSessionStore((store) => store.pageId);

    const targetId = useMemo(() => pageIdOfType(pages, type), [pages, type]);

    useEffect(() => {
        if (targetId !== null && pageId !== targetId) setPageId(targetId);
    }, [pageId, setPageId, targetId]);

    if (targetId === null) return <Navigate to="/" replace/>;
    return pageId === targetId ? children : null;
}

export default function DesktopRoutes({sections}) {
    const location = useLocation();
    const closed = closedSection(location.pathname, sections);

    if (closed) {
        return <Maintenance until={closed.until} section={closed.title} sectionId={closed.id}/>;
    }

    return (
        <Routes location={location}>
            <Route path="/" element={<Storefront/>}/>
            <Route path="/main" element={<Navigate to="/" replace/>}/>
            <Route path="/steam" element={<EnsureStandalone type="steam"><DesktopSteam/></EnsureStandalone>}/>
            <Route path="/services" element={<EnsureStandalone type="services"><DesktopServices/></EnsureStandalone>}/>
            <Route path="/subscription/*" element={<EnsurePage><DesktopSubscription/></EnsurePage>}/>
            <Route path="/catalog/*" element={<EnsurePage><DesktopCatalog/></EnsurePage>}/>
            <Route path="/card/:id" element={<EnsurePage><DesktopProduct/></EnsurePage>}/>
            <Route path="/search" element={<EnsurePage><DesktopSearch/></EnsurePage>}/>
            <Route path="/basket" element={<EnsurePage><DesktopBasket/></EnsurePage>}/>
            <Route path="/checkout" element={<EnsurePage><DesktopCheckout/></EnsurePage>}/>
            <Route path="/more" element={<EnsurePage><DesktopMore/></EnsurePage>}/>
            <Route path="/favorites" element={<EnsurePage><DesktopFavorites/></EnsurePage>}/>
            <Route path="/history" element={<EnsurePage><DesktopHistory/></EnsurePage>}/>
            <Route path="*" element={<Navigate to="/" replace/>}/>
        </Routes>
    );
}
