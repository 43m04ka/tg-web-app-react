import React from 'react';
import style from './CatalogSection.module.scss';

const SECTIONS = ['a', 'b'];
const CARDS = ['a', 'b', 'c'];

// Пока блоки не пришли — держим место теми же прямоугольниками, что и баннеры.
export default function CatalogSkeleton() {
    return (
        <>
            {SECTIONS.map((section) => (
                <div key={section} className={style.section} aria-hidden="true">
                    <div className={`${style.skeletonHead} ${style.shimmer}`}/>
                    <div className={style.row}>
                        {CARDS.map((card) => (
                            <div key={card} className={`${style.skeletonCard} ${style.shimmer}`}/>
                        ))}
                    </div>
                    <div className={`${style.skeletonOpen} ${style.shimmer}`}/>
                </div>
            ))}
        </>
    );
}
