import React from 'react';
import {NavLink} from 'react-router-dom';
import style from './StorefrontScreen.module.scss';

export const START_TABS = [
    {id: 'start', title: 'Стартовые страницы', path: '/admin2/start', end: true},
    {id: 'popular', title: 'Популярное', path: '/admin2/start/popular'}
];

export default function SectionTabs({items}) {
    return (
        <nav className={style.sectionTabs}>
            {items.map((item) => (
                <NavLink
                    key={item.id}
                    to={item.path}
                    end={Boolean(item.end)}
                    className={({isActive}) => (isActive ? style.sectionTabOn : style.sectionTab)}
                >
                    {item.title}
                </NavLink>
            ))}
        </nav>
    );
}
