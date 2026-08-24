import React from 'react';
import style from './Product.module.scss';

const CHIPS = ['a', 'b', 'c'];
const ROWS = ['a', 'b'];

export default function ProductSkeleton() {
    return (
        <div className={style.skeleton} aria-hidden="true">
            <div className={`${style.skeletonHero} ${style.shimmer}`}/>

            <div className={style.body}>
                <div className={style.section}>
                    <span className={`${style.skeletonLine} ${style.skeletonEyebrow} ${style.shimmer}`}/>
                    <span className={`${style.skeletonLine} ${style.skeletonTitle} ${style.shimmer}`}/>
                    <span className={`${style.skeletonLine} ${style.skeletonRating} ${style.shimmer}`}/>
                </div>

                <div className={style.chips}>
                    {CHIPS.map((key) => (
                        <span key={key} className={`${style.skeletonChip} ${style.shimmer}`}/>
                    ))}
                </div>

                {ROWS.map((key) => (
                    <div key={key} className={`${style.skeletonCard} ${style.shimmer}`}/>
                ))}
            </div>
        </div>
    );
}
