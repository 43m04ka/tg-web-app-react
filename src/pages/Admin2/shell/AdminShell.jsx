import React, {Suspense, useCallback, useEffect, useMemo, useState} from 'react';
import {Navigate, Route, Routes, useNavigate} from 'react-router-dom';
import Navigation from './Navigation';
import ContextBar from './ContextBar';
import CommandPalette from './CommandPalette';
import TaskDock from './TaskDock/TaskDock';
import {BASE, homePath, moduleRoutes} from '../platform/registry';
import {signOut} from '../platform/session';
import {SkeletonRows} from '../ui/primitives/Feedback';
import style from './AdminShell.module.scss';

export default function AdminShell({theme, onToggleTheme}) {
    const navigate = useNavigate();
    const [paletteOpen, setPaletteOpen] = useState(false);

    const routes = useMemo(() => moduleRoutes().map((route) => ({
        ...route,
        localPath: route.path === '/' ? '' : route.path.replace(/^\//, ''),
    })), []);

    useEffect(() => {
        const onKey = (event) => {
            if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === 'k') {
                event.preventDefault();
                setPaletteOpen((value) => !value);
                return;
            }

            if (event.key === '/' && event.target === document.body) {
                event.preventDefault();
                setPaletteOpen(true);
            }
        };

        document.addEventListener('keydown', onKey);
        return () => document.removeEventListener('keydown', onKey);
    }, []);

    const go = useCallback((path) => navigate(path), [navigate]);

    const extraCommands = useMemo(() => [
        {
            id: 'shell.theme',
            title: theme === 'dark' ? 'Включить светлую тему' : 'Включить тёмную тему',
            moduleTitle: 'Оболочка',
            icon: theme === 'dark' ? 'sun' : 'moon',
            run: () => onToggleTheme(),
        },
        {
            id: 'shell.signout',
            title: 'Выйти из админки',
            moduleTitle: 'Оболочка',
            icon: 'exit',
            run: () => signOut(),
        },
    ], [theme, onToggleTheme]);

    return (
        <div className={style.shell}>
            <Navigation
                theme={theme}
                onToggleTheme={onToggleTheme}
                onSignOut={signOut}
            />

            <div className={style.main}>
                <ContextBar onOpenPalette={() => setPaletteOpen(true)}/>

                <div className={style.work}>
                    <Suspense fallback={<div className={style.loading}><SkeletonRows count={6}/></div>}>
                        <Routes>
                            {routes.map((route) => (route.localPath
                                ? <Route key={route.path} path={route.localPath} element={<route.element/>}/>
                                : <Route key={route.path} index element={<route.element/>}/>
                            ))}
                            <Route path="*" element={<Navigate to={`${BASE}${homePath()}`} replace/>}/>
                        </Routes>
                    </Suspense>
                </div>
            </div>

            <TaskDock/>

            <CommandPalette
                open={paletteOpen}
                onClose={() => setPaletteOpen(false)}
                go={go}
                extraCommands={extraCommands}
            />
        </div>
    );
}
