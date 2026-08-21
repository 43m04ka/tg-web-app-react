import React from 'react';
import './styles/global.css';
import {useBootstrap} from './useBootstrap';
import {useMaintenance} from './useMaintenance';
import AppRoutes from './AppRoutes';
import Maintenance from '../pages/Maintenance/Maintenance';
import BackButton from '../shared/ui/BackButton/BackButton';
import Splash from '../shared/ui/Splash/Splash';
import style from './App.module.scss';

export default function App() {
    const {isReady} = useBootstrap();
    const {isMaintenance, maintenanceUntil} = useMaintenance();

    if (isMaintenance) return <Maintenance until={maintenanceUntil}/>;

    if (!isReady) return <Splash/>;

    return (
        <div className={style.app}>
            <BackButton/>
            <AppRoutes/>
        </div>
    );
}
