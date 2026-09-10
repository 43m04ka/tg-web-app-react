import React from 'react';
import AdminShell from './shell/AdminShell';
import LoginScreen from './shell/LoginScreen';
import ViewportGuard from './shell/ViewportGuard';
import Toaster from './ui/Toaster';
import ConfirmHost from './ui/ConfirmHost';
import {useSession} from './platform/session';
import {useTheme} from './shell/theme/useTheme';
import './shell/theme/tokens.scss';
import style from './Admin2.module.scss';

export default function Admin2() {
    const session = useSession();
    const {theme, toggle} = useTheme();

    return (
        <div className={style.root} data-a2-root data-a2-theme={theme}>
            <ViewportGuard>
                {session
                    ? <AdminShell theme={theme} onToggleTheme={toggle}/>
                    : <LoginScreen/>}

                <Toaster/>
                <ConfirmHost/>
            </ViewportGuard>
        </div>
    );
}
