import React from 'react';
import {Navigate, Route, Routes} from 'react-router-dom';
import SelectPlatform from '../pages/SelectPlatform/SelectPlatform';
import Main from '../pages/Main/Main';
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
            <Route path="*" element={<Navigate to="/" replace/>}/>
        </Routes>
    );
}
