import React, {useEffect, useState} from 'react';
import style from './Product.module.scss';

const STARS = [0, 1, 2, 3, 4];

const formatCount = (count) => {
    const number = Number(count);
    if (!Number.isFinite(number) || number <= 0) return null;
    return number.toLocaleString('ru-RU');
};

export default function StarRating({rating}) {
    const average = Number(rating?.averageRating);
    const [isFilled, setIsFilled] = useState(false);

    useEffect(() => {
        const timerId = setTimeout(() => setIsFilled(true), 120);
        return () => clearTimeout(timerId);
    }, []);

    if (!Number.isFinite(average) || average <= 0) return null;

    const count = formatCount(rating?.totalRatingsCount);

    return (
        <div className={style.rating}>
            <span className={style.stars} aria-hidden="true">
                {STARS.map((index) => (
                    <span key={index} className={style.star}>
                        <span className={style.starBase}>★</span>
                        <span
                            className={style.starFill}
                            style={{
                                width: `${isFilled ? Math.min(Math.max(average - index, 0), 1) * 100 : 0}%`,
                                transitionDelay: `${index * 70}ms`
                            }}
                        >
                            ★
                        </span>
                    </span>
                ))}
            </span>

            <span className={style.ratingValue}>{average.toFixed(1)}</span>
            {count ? <span className={style.ratingCount}>· {count} оценок</span> : null}
        </div>
    );
}
