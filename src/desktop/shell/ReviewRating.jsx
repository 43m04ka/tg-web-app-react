import React, {useEffect, useState} from 'react';
import {fetchReviews} from '../../shared/api/reviews';
import external from '../../pages/Reviews/externalReviewSummary.json';
import RouteLink from '../ui/RouteLink';
import style from './TopBar.module.scss';

export default function ReviewRating({withLabel = false}) {
    const [summary, setSummary] = useState({...external, complete: false});

    useEffect(() => {
        const controller = new AbortController();
        fetchReviews(1, controller.signal).then((data) => {
            if (controller.signal.aborted || data.count === undefined) return;
            const localCount = Math.max(0, Number(data.count) || 0);
            const count = external.count + localCount;
            const average = count ? (external.count * external.average + localCount * (Number(data.average) || 0)) / count : 0;
            setSummary({count, average, complete: true});
        }).catch(() => {});
        return () => controller.abort();
    }, []);

    const count = summary.count.toLocaleString('ru-RU');
    const noun = {one: 'отзыв', few: 'отзыва', many: 'отзывов', other: 'отзыва'}[new Intl.PluralRules('ru-RU').select(summary.count)];
    const label = `Рейтинг ${summary.average.toFixed(1)} из 5, ${count}${summary.complete ? '' : '+'} ${noun}`;
    const stars = Array.from({length: 5}, (_, index) => <svg key={index} viewBox="0 0 24 24" aria-hidden="true">
        <path d="m12 2.5 2.9 6 6.6.9-4.8 4.6 1.2 6.5L12 17.4l-5.9 3.1 1.2-6.5-4.8-4.6 6.6-.9z" fill="currentColor"/>
    </svg>);

    return <RouteLink to="/reviews" className={withLabel ? style.reviewsGroup : style.rating} aria-label={withLabel ? `Отзывы. ${label}` : label}>
        {withLabel ? <span>Отзывы</span> : null}
        <span className={withLabel ? style.rating : undefined}>
        <span className={style.ratingStars} aria-hidden="true">
            <span className={style.starTrack}>{stars}</span>
            <span className={style.starFill} style={{width: `${Math.min(100, Math.max(0, summary.average * 20))}%`}}><span className={style.starTrack}>{stars}</span></span>
        </span>
        <strong aria-hidden="true">{summary.average.toFixed(1)}</strong>
        <span className={style.reviewCount} aria-hidden="true">{count}{summary.complete ? '' : '+'} {noun}</span>
        </span>
    </RouteLink>;
}
