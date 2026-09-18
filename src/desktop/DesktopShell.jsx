import React, {useEffect, useRef} from 'react';
import {useLocation} from 'react-router-dom';
import './styles/desktop.css';
import './styles/motion.css';
import TopBar from './shell/TopBar';
import DesktopRoutes from './DesktopRoutes';
import {ScrollAreaContext} from './shell/ScrollAreaContext';
import style from './DesktopShell.module.scss';

export default function DesktopShell({sections}) {
    const {pathname} = useLocation();
    const areaRef = useRef(null);

    useEffect(() => {
        areaRef.current?.scrollTo({top: 0, behavior: 'instant'});
    }, [pathname]);

    return (
        <ScrollAreaContext.Provider value={areaRef}>
            <div className={style.shell}>
                <TopBar/>

                <main className={style.area} ref={areaRef} data-scrollable="">
                    <div key={pathname} className={style.content}>
                        <DesktopRoutes sections={sections}/>
                    </div>
                </main>
            </div>
        </ScrollAreaContext.Provider>
    );
}
