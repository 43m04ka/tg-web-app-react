import React from 'react';
import {NavLink} from 'react-router-dom';
import style from './StorefrontScreen.module.scss';

export const START_TABS = [
    {
        id: 'start',
        title: 'Стартовые страницы',
        hint: 'Кнопки и группы первого экрана',
        path: '/admin2/start',
        end: true
    },
    {
        id: 'popular',
        title: 'Популярное',
        hint: 'Карусель товаров на старте',
        path: '/admin2/start/popular'
    }
];

export default function SectionTabs({items}) {
    return (
        <nav className={style.sectionBar}>
            {items.map((item) => (
                <NavLink
                    key={item.id}
                    to={item.path}
                    end={Boolean(item.end)}
                    className={({isActive}) => (isActive ? style.sectionBarOn : style.sectionBarTab)}
                >
                    <span className={style.sectionBarTitle}>{item.title}</span>
                    {item.hint ? <span className={style.sectionBarHint}>{item.hint}</span> : null}
                </NavLink>
            ))}
        </nav>
    );
}
