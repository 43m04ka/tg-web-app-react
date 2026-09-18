import React, {useEffect, useMemo} from 'react';
import {Navigate, Route, Routes, useLocation} from 'react-router-dom';
import DesktopMain from './pages/Main/DesktopMain';
import Catalog from '../pages/Catalog/Catalog';
import Search from '../pages/Search/Search';
import Basket from '../pages/Basket/Basket';
import Checkout from '../pages/Basket/Checkout';
import More from '../pages/More/More';
import Product from '../pages/Product/Product';
import Favorites from '../pages/Account/Favorites';
import OrderHistory from '../pages/Account/OrderHistory';
import Steam from '../pages/Steam/Steam';
import Services from '../pages/Services/Services';
import Subscription from '../pages/Subscription/Subscription';
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
            <Route path="/main" element={<EnsurePage><DesktopMain/></EnsurePage>}/>
            <Route path="/steam" element={<EnsureStandalone type="steam"><Steam/></EnsureStandalone>}/>
            <Route path="/services" element={<EnsureStandalone type="services"><Services/></EnsureStandalone>}/>
            <Route path="/subscription/*" element={<EnsurePage><Subscription/></EnsurePage>}/>
            <Route path="/catalog/*" element={<EnsurePage><Catalog/></EnsurePage>}/>
            <Route path="/card/:id" element={<EnsurePage><Product/></EnsurePage>}/>
            <Route path="/search" element={<EnsurePage><Search/></EnsurePage>}/>
            <Route path="/basket" element={<EnsurePage><Basket/></EnsurePage>}/>
            <Route path="/checkout" element={<EnsurePage><Checkout/></EnsurePage>}/>
            <Route path="/more" element={<EnsurePage><More/></EnsurePage>}/>
            <Route path="/favorites" element={<EnsurePage><Favorites/></EnsurePage>}/>
            <Route path="/history" element={<EnsurePage><OrderHistory/></EnsurePage>}/>
            <Route path="*" element={<Navigate to="/" replace/>}/>
        </Routes>
    );
}
