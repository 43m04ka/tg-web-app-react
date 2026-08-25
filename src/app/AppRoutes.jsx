import React, {useEffect, useState} from 'react';
import {Navigate, Route, Routes, useLocation} from 'react-router-dom';
import SelectPlatform from '../pages/SelectPlatform/SelectPlatform';
import Main from '../pages/Main/Main';
import Catalog from '../pages/Catalog/Catalog';
import Search from '../pages/Search/Search';
import More from '../pages/More/More';
import Product from '../pages/Product/Product';
import Favorites from '../pages/Account/Favorites';
import OrderHistory from '../pages/Account/OrderHistory';
import Stub from '../pages/Stub/Stub';
import {useSessionStore} from '../store/useSessionStore';
import style from './AppRoutes.module.scss';

const LEAVE_MS = 150;

const PHASE = {
    IDLE: 'idle',
    LEAVING: 'leaving',
    ENTERING: 'entering'
};

function RequirePage({children}) {
    const pageId = useSessionStore((state) => state.pageId);
    return pageId === null ? <Navigate to="/" replace/> : children;
}

export default function AppRoutes() {
    const location = useLocation();
    const [shown, setShown] = useState(location);
    const [phase, setPhase] = useState(PHASE.IDLE);

    useEffect(() => {
        if (location.pathname === shown.pathname) return undefined;

        setPhase(PHASE.LEAVING);

        const timerId = setTimeout(() => {
            setShown(location);
            setPhase(PHASE.ENTERING);
        }, LEAVE_MS);

        return () => clearTimeout(timerId);
    }, [location, shown]);

    // Новую страницу надо один раз показать браузеру погашенной, иначе снятие
    // класса попадает в тот же кадр, что и подмена содержимого, перехода не
    // возникает и страница появляется рывком.
    useEffect(() => {
        if (phase !== PHASE.ENTERING) return undefined;

        let inner = 0;
        const outer = requestAnimationFrame(() => {
            inner = requestAnimationFrame(() => setPhase(PHASE.IDLE));
        });

        return () => {
            cancelAnimationFrame(outer);
            cancelAnimationFrame(inner);
        };
    }, [phase, shown]);

    return (
        <div className={`${style.stage} ${style[phase]}`}>
            <Routes location={shown}>
                <Route path="/" element={<SelectPlatform/>}/>
                <Route path="/main" element={<RequirePage><Main/></RequirePage>}/>
                <Route path="/catalog/*" element={<RequirePage><Catalog/></RequirePage>}/>
                <Route path="/card/:id" element={<RequirePage><Product/></RequirePage>}/>
                <Route path="/search" element={<RequirePage><Search/></RequirePage>}/>
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
