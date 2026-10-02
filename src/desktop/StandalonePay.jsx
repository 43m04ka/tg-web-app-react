import React from 'react';
import './styles/desktop.css';
import './styles/motion.css';
import DesktopPay from './pages/Pay/DesktopPay';
import style from './DesktopShell.module.scss';

export default function StandalonePay() {
    return (
        <div className={style.shell}>
            <main className={style.area} data-scrollable="">
                <div className={style.content}>
                    <DesktopPay/>
                </div>
            </main>
        </div>
    );
}
