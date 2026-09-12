import React, {useCallback, useEffect, useRef, useState} from 'react';
import {NavLink} from 'react-router-dom';
import Icon from './Icon';
import {BASE, navigationGroups} from '../platform/registry';
import {IconButton} from '../ui/primitives/Button';
import style from './Navigation.module.scss';

const OPEN_DELAY = 140;
const CLOSE_DELAY = 260;

export default function Navigation({docked, pinned, onTogglePin, theme, onToggleTheme, onSignOut}) {
    const groups = navigationGroups();
    const [open, setOpen] = useState(false);
    const navRef = useRef(null);
    const timer = useRef(null);
    const armed = useRef(true);
    const hovering = useRef(false);
    const picked = useRef(null);

    const schedule = useCallback((next, delay) => {
        clearTimeout(timer.current);
        timer.current = setTimeout(() => setOpen(next), delay);
    }, []);

    const collapse = useCallback(({keepArmed = false} = {}) => {
        clearTimeout(timer.current);
        picked.current = null;
        armed.current = keepArmed;
        setOpen(false);
    }, []);

    useEffect(() => () => clearTimeout(timer.current), []);

    useEffect(() => {
        clearTimeout(timer.current);

        if (!docked && picked.current && hovering.current) {
            setOpen(true);
            return;
        }

        picked.current = null;
        setOpen(false);
    }, [docked]);

    const expanded = docked || open;
    const floating = open && !docked;

    useEffect(() => {
        if (!floating) return undefined;

        const onKey = (event) => {
            if (event.key === 'Escape') collapse({keepArmed: !hovering.current});
        };

        const onMove = (event) => {
            if (picked.current && event.clientX > picked.current.limit) collapse({keepArmed: true});
        };

        const onPointerDown = (event) => {
            if (navRef.current && !navRef.current.contains(event.target)) collapse({keepArmed: true});
        };

        document.addEventListener('keydown', onKey);
        document.addEventListener('mousemove', onMove);
        document.addEventListener('pointerdown', onPointerDown);

        return () => {
            document.removeEventListener('keydown', onKey);
            document.removeEventListener('mousemove', onMove);
            document.removeEventListener('pointerdown', onPointerDown);
        };
    }, [floating, collapse]);

    const onMouseEnter = () => {
        hovering.current = true;
        if (!docked && armed.current) schedule(true, OPEN_DELAY);
    };

    const onMouseLeave = () => {
        hovering.current = false;
        armed.current = true;
        if (!picked.current) schedule(false, CLOSE_DELAY);
    };

    const onFocus = (event) => {
        if (docked || !event.target.matches(':focus-visible')) return;
        clearTimeout(timer.current);
        setOpen(true);
    };

    const onBlur = (event) => {
        if (hovering.current || picked.current || event.currentTarget.contains(event.relatedTarget)) return;
        schedule(false, 0);
    };

    const onPick = (event) => {
        clearTimeout(timer.current);

        if (event.detail === 0 || !navRef.current) {
            if (!docked) collapse();
            return;
        }

        const rect = navRef.current.getBoundingClientRect();
        picked.current = {limit: Math.max(rect.right, event.clientX + rect.width / 2)};
    };

    const classes = [
        style.nav,
        expanded ? style.expanded : style.collapsed,
        floating ? style.floating : '',
    ].join(' ');

    return (
        <div className={style.slot}>
            <nav
                ref={navRef}
                className={classes}
                aria-label="Разделы админки"
                onMouseEnter={onMouseEnter}
                onMouseLeave={onMouseLeave}
                onFocus={onFocus}
                onBlur={onBlur}
            >
                <div className={style.brand}>
                    <span className={style.mark}>GW</span>
                    <span className={style.brandText}>Админка</span>
                </div>

                <div className={style.groups}>
                    {groups.map((group) => (
                        <div key={group.id} className={style.group}>
                            <span className={style.groupTitle}>
                                <span className={style.groupText}>{group.title}</span>
                            </span>
                            {group.items.map((item) => (
                                <NavLink
                                    key={item.id}
                                    to={`${BASE}${item.routes[0].path}`}
                                    end={item.routes[0].path === '/'}
                                    onClick={onPick}
                                    aria-label={item.title}
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
                    <IconButton label="Выйти" className={style.footerExtra} onClick={onSignOut}>
                        <Icon name="exit"/>
                    </IconButton>
                    <IconButton
                        label={pinned ? 'Сворачивать меню на рабочих экранах' : 'Держать меню раскрытым везде'}
                        active={pinned}
                        className={`${style.footerExtra} ${style.pin}`}
                        onClick={onTogglePin}
                    >
                        <Icon name="pin"/>
                    </IconButton>
                </div>
            </nav>
        </div>
    );
}
