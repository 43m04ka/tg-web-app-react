import React, {useEffect} from 'react';
import './styles/desktop.css';
import './styles/motion.css';
import DesktopPay from './pages/Pay/DesktopPay';
import DesktopMarketplace from './pages/Marketplace/DesktopMarketplace';
import {applyTheme} from '../shared/lib/theme';
import style from './DesktopShell.module.scss';

const PAY_ACCENT = '#17bfae';

export default function StandalonePay({page = 'pay'}) {
    useEffect(() => {
        applyTheme(PAY_ACCENT);
    }, []);

    return (
        <div className={style.shell}>
            <main className={style.area} data-scrollable="">
                <div className={style.content}>
                    {page === 'activate' ? <DesktopMarketplace/> : <DesktopPay/>}
                </div>
            </main>
        </div>
    );
}
