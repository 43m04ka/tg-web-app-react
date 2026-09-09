import React from 'react';
import {NavLink} from 'react-router-dom';
import style from './StorefrontScreen.module.scss';

const SECTIONS = [
    {id: 'pages', title: 'Страницы', path: '/admin2/storefront'},
    {id: 'banners', title: 'Баннеры', path: '/admin2/storefront/banners'},
    {id: 'start', title: 'Стартовый экран', path: '/admin2/storefront/start'},
    {id: 'texts', title: 'Тексты', path: '/admin2/storefront/texts'},
];

export default function StorefrontTabs() {
    return (
        <span className={style.tabs}>
            {SECTIONS.map((section) => (
                <NavLink
                    key={section.id}
                    to={section.path}
                    end={section.id === 'pages'}
                    className={({isActive}) => `${style.tab} ${isActive ? style.tabOn : ''}`}
                >
                    {section.title}
                </NavLink>
            ))}
        </span>
    );
}
