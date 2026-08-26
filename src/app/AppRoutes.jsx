import React, {useEffect, useState} from 'react';
import {Navigate, Route, Routes, useLocation} from 'react-router-dom';
import SelectPlatform from '../pages/SelectPlatform/SelectPlatform';
import Main from '../pages/Main/Main';
import Catalog from '../pages/Catalog/Catalog';
import Search from '../pages/Search/Search';
import Basket from '../pages/Basket/Basket';
import Checkout from '../pages/Basket/Checkout';
import More from '../pages/More/More';
import Product from '../pages/Product/Product';
import Favorites from '../pages/Account/Favorites';
import OrderHistory from '../pages/Account/OrderHistory';
import {useSessionStore} from '../store/useSessionStore';
import style from './AppRoutes.module.scss';

const LEAVE_MS = 150;

function RequirePage({children}) {
    const pageId = useSessionStore((state) => state.pageId);
    return pageId === null ? <Navigate to="/" replace/> : children;
}

export default function AppRoutes() {
    const location = useLocation();
    const [shown, setShown] = useState(location);
    const [isLeaving, setLeaving] = useState(false);

    useEffect(() => {
        if (location.pathname === shown.pathname) return undefined;

        if (location.state?.skipLeave) {
            setShown(location);
            setLeaving(false);
            return undefined;
        }

        setLeaving(true);

        const timerId = setTimeout(() => {
            setShown(location);
            setLeaving(false);
        }, LEAVE_MS);

        return () => clearTimeout(timerId);
    }, [location, shown]);

    return (
        <div
            key={shown.pathname}
            className={`${style.stage} ${isLeaving ? style.leaving : ''}`}
        >
            <Routes location={shown}>
                <Route path="/" element={<SelectPlatform/>}/>
                <Route path="/main" element={<RequirePage><Main/></RequirePage>}/>
                <Route path="/catalog/*" element={<RequirePage><Catalog/></RequirePage>}/>
                <Route path="/card/:id" element={<RequirePage><Product/></RequirePage>}/>
                <Route path="/search" element={<RequirePage><Search/></RequirePage>}/>
                <Route path="/basket" element={<RequirePage><Basket/></RequirePage>}/>
                <Route path="/checkout" element={<RequirePage><Checkout/></RequirePage>}/>
                <Route path="/more" element={<RequirePage><More/></RequirePage>}/>
                <Route path="/favorites" element={<RequirePage><Favorites/></RequirePage>}/>
                <Route path="/history" element={<RequirePage><OrderHistory/></RequirePage>}/>
                <Route path="*" element={<Navigate to="/" replace/>}/>
            </Routes>
        </div>
    );
}
