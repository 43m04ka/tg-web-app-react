import React, {Suspense, lazy} from 'react';
import {Navigate, Route, Routes, useLocation} from 'react-router-dom';
import './styles/global.css';
import {useBootstrap} from './useBootstrap';
import {useMaintenance} from './useMaintenance';
import AppRoutes from './AppRoutes';
import Maintenance from '../pages/Maintenance/Maintenance';
import BackButton from '../shared/ui/BackButton/BackButton';
import NavBar from '../shared/ui/NavBar/NavBar';
import Splash from '../shared/ui/Splash/Splash';
import {useAccentTheme} from '../shared/hooks/useAccentTheme';
import {useSessionStore} from '../store/useSessionStore';
import style from './App.module.scss';

// Админка грузится отдельным чанком: она весит больше самой витрины, а покупателю
// не нужна никогда.
const AdminAuth = lazy(() => import('../pages/AdminPanel/AP_Authentication'));
const AdminPanel = lazy(() => import('../pages/AdminPanel/AdminPanel'));

export default function App() {
    const {isReady} = useBootstrap();
    const {isMaintenance, maintenanceUntil} = useMaintenance();
    const {pathname} = useLocation();
    const pageId = useSessionStore((state) => state.pageId);

    useAccentTheme();

    // Раньше /admin проваливался в общий catch-all и уезжал на выбор витрины.
    // Ветка стоит до техработ и до сплеша намеренно: админка нужна именно тогда,
    // когда витрина выключена или данные не грузятся.
    if (pathname.startsWith('/admin')) {
        return (
            <Suspense fallback={<Splash/>}>
                <Routes>
                    <Route path="/admin" element={<AdminAuth/>}/>
                    <Route path="/admin-panel/*" element={<AdminPanel/>}/>
                    <Route path="*" element={<Navigate to="/admin" replace/>}/>
                </Routes>
            </Suspense>
        );
    }

    if (isMaintenance) return <Maintenance until={maintenanceUntil}/>;

    if (!isReady) return <Splash/>;

    return (
        <div className={style.app}>
            <BackButton/>
            <main className={style.content}>
                <AppRoutes/>
            </main>
            {pathname === '/' && pageId === null ? null : <NavBar/>}
        </div>
    );
}
