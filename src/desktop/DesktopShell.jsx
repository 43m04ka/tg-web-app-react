import React from 'react';
import './styles/desktop.css';
import TopBar from './shell/TopBar';
import DesktopRoutes from './DesktopRoutes';
import style from './DesktopShell.module.scss';

export default function DesktopShell({sections}) {
    return (
        <div className={style.shell}>
            <TopBar/>

            <main className={style.content}>
                <DesktopRoutes sections={sections}/>
            </main>
        </div>
    );
}
