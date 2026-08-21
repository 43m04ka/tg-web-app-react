import React from 'react';
import {Navigate, Route, Routes} from 'react-router-dom';
import SelectPlatform from '../pages/SelectPlatform/SelectPlatform';
import Main from '../pages/Main/Main';
import Stub from '../pages/Stub/Stub';
import {useSessionStore} from '../store/useSessionStore';

function RequirePage({children}) {
    const pageId = useSessionStore((state) => state.pageId);
    return pageId === null ? <Navigate to="/" replace/> : children;
}

export default function AppRoutes() {
    return (
        <Routes>
            <Route path="/" element={<SelectPlatform/>}/>
            <Route path="/main" element={<RequirePage><Main/></RequirePage>}/>
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
            <Route
                path="/more"
                element={
                    <RequirePage>
                        <Stub title="Ещё" text="Профиль, история заказов и избранное появятся на следующем этапе редизайна."/>
                    </RequirePage>
                }
            />
            <Route path="*" element={<Navigate to="/" replace/>}/>
        </Routes>
    );
}
