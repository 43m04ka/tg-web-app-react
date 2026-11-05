import React, {useState} from 'react';
import {avatarColor, purchaseDate, reviewName} from './ReviewCard';
import ReviewSourceIcon from './ReviewSourceIcon';
import style from './Reviews.module.scss';

const platforms = {vk: 'ВКонтакте', tg: 'Telegram', avito: 'Авито', megamarket: 'Мегамаркет'};

export default function ExternalReviews({data}) {
    const [visible, setVisible] = useState(12);
    const [platform, setPlatform] = useState('all');
    const sources = new Map(data.sources.map((source) => [source.id, source]));
    const items = data.reviews.filter((review) => platform === 'all' || sources.get(review.sourceId)?.platform === platform);
    const available = Object.keys(platforms).filter((key) => data.reviews.some((review) => sources.get(review.sourceId)?.platform === key));

    return <section className={style.external} aria-labelledby="external-reviews-title">
        <div className={style.sectionHeading}><h2 id="external-reviews-title">Отзывы с других площадок</h2><span>{data.reviews.length.toLocaleString('ru-RU')}</span></div>
        {available.length > 1 ? <div className={style.filters} aria-label="Площадки отзывов">{['all', ...available].map((key) => <button type="button" key={key} aria-pressed={platform === key} onClick={() => {setPlatform(key); setVisible(12);}}>{key !== 'all' ? <ReviewSourceIcon platform={key}/> : null}{key === 'all' ? 'Все площадки' : platforms[key]}</button>)}</div> : null}
        <div className={style.grid}>{items.slice(0, visible).map((review) => {
            const source = sources.get(review.sourceId);
            if (!source) return null;
            const name = reviewName(review.displayName);
            const rating = review.rating || 5;
            return <a className={`${style.card} ${style.externalCard}`} key={review.id} href={review.url || source.url} target="_blank" rel="noopener noreferrer" aria-label={`Отзыв ${name} — ${platforms[source.platform]} ${source.title}`}>
                <header className={style.author}>
                    <span className={style.avatar} style={{backgroundColor: avatarColor(name)}} aria-hidden="true">{Array.from(name)[0].toUpperCase()}</span>
                    <div><div className={style.name}>{name}</div><div className={style.externalStars} aria-label={`${rating} из 5`}>{'★'.repeat(rating)}{'☆'.repeat(5 - rating)}</div></div>
                    <span className={style.externalArrow} aria-hidden="true">↗</span>
                </header>
                {review.text ? <p className={`${style.text} ${style.externalText}`}>{review.text}</p> : null}
                <span className={style.readOriginal}>Читать отзыв ↗</span>
                {review.productName ? <p className={style.notice}>{review.productName}</p> : null}
                <footer className={style.sourceFooter}><time dateTime={review.createdAt}>{purchaseDate(review.createdAt)}</time><span className={style.source}><ReviewSourceIcon platform={source.platform}/><span>{platforms[source.platform]}<strong>{source.title}</strong></span></span></footer>
            </a>;
        })}</div>
        {items.length > visible ? <button className={style.more} type="button" onClick={() => setVisible((value) => value + 12)}>Показать ещё</button> : null}
    </section>;
}
