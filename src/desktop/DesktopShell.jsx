import React, {useEffect} from 'react';
import {useLocation} from 'react-router-dom';
import './styles/desktop.css';
import TopBar from './shell/TopBar';
import DesktopRoutes from './DesktopRoutes';
import style from './DesktopShell.module.scss';

export default function DesktopShell({sections}) {
    const {pathname} = useLocation();

    useEffect(() => {
        window.scrollTo(0, 0);
    }, [pathname]);

    return (
        <div className={style.shell}>
            <TopBar/>

            <main className={style.content}>
                <DesktopRoutes sections={sections}/>
            </main>
        </div>
    );
}
