import React from 'react';
import {API_BASE_URL} from '../../shared/config/env';
import style from './Reviews.module.scss';

export const purchaseDate = (value) => new Date(value).toLocaleDateString('ru-RU', {day: 'numeric', month: 'long', year: 'numeric'});

export default function ReviewCard({review}) {
    return (
        <article className={style.card}>
            <header className={style.author}>
                <span className={style.avatar} aria-hidden="true">{Array.from(review.displayName || 'П')[0].toUpperCase()}</span>
                <div>
                    <div className={style.name}>{review.displayName}<span className={style.verified}>✓ Покупка подтверждена</span></div>
                    <span className={style.date}>Покупка {purchaseDate(review.purchasedAt)}</span>
                </div>
            </header>
            <div className={style.stars} aria-label={`${review.rating} из 5`}>{'★'.repeat(review.rating)}<span>{'★'.repeat(5 - review.rating)}</span></div>
            <p className={style.text}>{review.text}</p>
            {review.photos?.length ? <div className={style.photos}>{review.photos.map((url) => (
                <a key={url} href={`${API_BASE_URL}${url}`} target="_blank" rel="noreferrer" aria-label="Открыть фотографию отзыва">
                    <img src={`${API_BASE_URL}${url}`} alt="Фотография покупателя" loading="lazy"/>
                </a>
            ))}</div> : null}
            <div className={style.items}>{review.items.map((item, index) => <span key={index}>{item.name}{item.quantity > 1 ? ` × ${item.quantity}` : ''}</span>)}</div>
        </article>
    );
}
