import React from 'react';
import {useLocation} from 'react-router-dom';
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

export default function App() {
    const {isReady} = useBootstrap();
    const {isMaintenance, maintenanceUntil} = useMaintenance();
    const {pathname} = useLocation();
    const pageId = useSessionStore((state) => state.pageId);

    useAccentTheme();

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
