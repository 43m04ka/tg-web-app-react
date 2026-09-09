import React from 'react';
import styles from './AdminSidebar.module.scss';
import {useLocation, useNavigate} from 'react-router-dom';
import AdminDock from './AdminDock';
import useData from '../useData';

const AdminSidebar = ({routeGroups, theme, onToggleTheme}) => {
    const navigator = useNavigate();
    const location = useLocation();
    const setAuthenticationData = useData((state) => state.setAuthenticationData);

    const pathAfterAdmin = location.pathname.replace(/^\/admin-panel\/?/, '').replace(/\/$/, '');
    const activeSlug = (pathAfterAdmin.split('/')[0] || '').trim();

    const onLogout = () => {
        setAuthenticationData(null);
        navigator('/admin');
    };

    return (
        <nav className={styles['sidebar']}>
            <div className={styles['brand']}>
                <span className={styles['brandTitle']}>Админ-панель</span>
            </div>

            <div className={styles['navScroll']}>
                <button
                    type="button"
                    onClick={() => navigator('')}
                    aria-current={activeSlug === '' ? 'page' : undefined}
                    className={`${styles['navItem']} ${activeSlug === '' ? styles['navItemActive'] : ''}`}
                >
                    <span className={styles['navItemText']}>Главная</span>
                </button>

                {routeGroups.map((group) => (
                    <div key={group.name} className={styles['routeBlock']}>
                        <div className={styles['routeBlockTitle']}>{group.name}</div>
                        {group.items.map((item) => (
                            <button
                                type="button"
                                key={item.path}
                                onClick={() => navigator(item.path)}
                                aria-current={activeSlug === item.path ? 'page' : undefined}
                                className={`${styles['navItem']} ${activeSlug === item.path ? styles['navItemActive'] : ''}`}
                            >
                                <span className={styles['navItemText']}>{item.name}</span>
                            </button>
                        ))}
                    </div>
                ))}
            </div>

            <div className={styles['footer']}>
                <AdminDock theme={theme} onToggleTheme={onToggleTheme} onLogout={onLogout}/>
            </div>
        </nav>
    );
};

export default AdminSidebar;
