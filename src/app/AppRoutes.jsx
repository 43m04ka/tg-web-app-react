import React, {useEffect, useState} from 'react';
import {Navigate, Route, Routes, useLocation} from 'react-router-dom';
import SelectPlatform from '../pages/SelectPlatform/SelectPlatform';
import Main from '../pages/Main/Main';
import More from '../pages/More/More';
import Product from '../pages/Product/Product';
import Favorites from '../pages/Account/Favorites';
import OrderHistory from '../pages/Account/OrderHistory';
import Stub from '../pages/Stub/Stub';
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
    const [isLeaving, setIsLeaving] = useState(false);

    useEffect(() => {
        if (location.pathname === shown.pathname) return;

        setIsLeaving(true);
        const timerId = setTimeout(() => {
            setShown(location);
            setIsLeaving(false);
        }, LEAVE_MS);

        return () => clearTimeout(timerId);
    }, [location, shown]);

    return (
        <div className={`${style.stage} ${isLeaving ? style.leaving : ''}`}>
            <Routes location={shown}>
                <Route path="/" element={<SelectPlatform/>}/>
                <Route path="/main" element={<RequirePage><Main/></RequirePage>}/>
                <Route
                    path="/catalog/*"
                    element={
                        <RequirePage>
                            <Stub title="Каталог" text="Список товаров каталога появится на следующем этапе редизайна."/>
                        </RequirePage>
                    }
                />
                <Route path="/card/:id" element={<RequirePage><Product/></RequirePage>}/>
                <Route
                    path="/search"
                    element={
                        <RequirePage>
                            <Stub title="Поиск" text="Поиск по каталогу появится на следующем этапе редизайна."/>
                        </RequirePage>
                    }
                />
                <Route
                    path="/basket"
                    element={
                        <RequirePage>
                            <Stub title="Корзина" text="Корзина и оформление заказа появятся на следующем этапе редизайна."/>
                        </RequirePage>
                    }
                />
                <Route path="/more" element={<RequirePage><More/></RequirePage>}/>
                <Route path="/favorites" element={<RequirePage><Favorites/></RequirePage>}/>
                <Route path="/history" element={<RequirePage><OrderHistory/></RequirePage>}/>
                <Route path="*" element={<Navigate to="/" replace/>}/>
            </Routes>
        </div>
    );
}
