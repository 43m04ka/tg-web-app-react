import React from 'react';
import {NavLink} from 'react-router-dom';
import Icon from './Icon';
import {BASE, navigationGroups} from '../platform/registry';
import {IconButton} from '../ui/primitives/Button';
import style from './Navigation.module.scss';

export default function Navigation({theme, onToggleTheme, onSignOut}) {
    const groups = navigationGroups();

    return (
        <nav className={style.nav}>
            <div className={style.brand}>
                <span className={style.mark}>GW</span>
                <span className={style.brandText}>Админка</span>
            </div>

            <div className={style.groups}>
                {groups.map((group) => (
                    <div key={group.id} className={style.group}>
                        <span className={style.groupTitle}>{group.title}</span>
                        {group.items.map((item) => (
                            <NavLink
                                key={item.id}
                                to={`${BASE}${item.routes[0].path}`}
                                className={({isActive}) => `${style.link} ${isActive ? style.active : ''}`}
                            >
                                <Icon name={item.icon}/>
                                <span className={style.linkText}>{item.title}</span>
                            </NavLink>
                        ))}
                    </div>
                ))}
            </div>

            <div className={style.footer}>
                <IconButton
                    label={theme === 'dark' ? 'Светлая тема' : 'Тёмная тема'}
                    onClick={onToggleTheme}
                >
                    <Icon name={theme === 'dark' ? 'sun' : 'moon'}/>
                </IconButton>
                <IconButton label="Выйти" onClick={onSignOut}>
                    <Icon name="exit"/>
                </IconButton>
            </div>
        </nav>
    );
}
