import React, {useEffect, useState} from 'react';
import {Link, useSearchParams} from 'react-router-dom';
import {fetchReviewOrders, fetchReviews} from '../../shared/api/reviews';
import {useSessionStore} from '../../store/useSessionStore';
import ReviewCard, {purchaseDate} from './ReviewCard';
import style from './Reviews.module.scss';

export default function Reviews() {
    const account = useSessionStore((state) => state.account);
    const openLogin = useSessionStore((state) => state.openLogin);
    const [query] = useSearchParams();
    const [mine, setMine] = useState(query.get('mine') === '1');
    const [data, setData] = useState(null);
    const [orders, setOrders] = useState(null);
    const [error, setError] = useState('');
    const [page, setPage] = useState(1);
    const [busy, setBusy] = useState(false);
    const [attempt, setAttempt] = useState(0);

    useEffect(() => {
        const controller = new AbortController();
        setError('');
        setBusy(true);
        fetchReviews(page, controller.signal).then((result) => {
            setData((old) => ({...result, items: page === 1 ? result.items : [...(old?.items || []), ...result.items]}));
        }).catch((failure) => { if (!controller.signal.aborted) setError(failure.message); })
            .finally(() => { if (!controller.signal.aborted) setBusy(false); });
        return () => controller.abort();
    }, [page, attempt]);

    useEffect(() => {
        if (!mine || account?.kind !== 'user') return undefined;
        const controller = new AbortController();
        setError('');
        fetchReviewOrders(controller.signal).then((result) => setOrders(result.items))
            .catch((failure) => { if (!controller.signal.aborted) setError(failure.message); });
        return () => controller.abort();
    }, [mine, account?.id, account?.kind, attempt]);

    return (
        <section className={style.screen}>
            <header className={style.heading}><span className={style.eyebrow}>Опыт наших покупателей</span><h1>Отзывы</h1>
                <div className={style.score}>{data?.count ? <><strong>{data.average}</strong><span>из 5</span><span className={style.scoreStars}>★★★★★</span></> : <strong className={style.noScore}>Пока без оценок</strong>}</div>
                <p>{data ? `${data.count} отзывов о подтверждённых покупках` : 'Загружаем отзывы…'}</p>
                <button type="button" className={style.button} onClick={() => {setMine(true); if (account?.kind !== 'user') openLogin('review');}}>Оставить отзыв</button>
            </header>
            <nav className={style.tabs} aria-label="Раздел отзывов"><button type="button" aria-pressed={!mine} onClick={() => {setMine(false); setError('');}}>Все отзывы</button><button type="button" aria-pressed={mine} onClick={() => {setMine(true); setError('');}}>Мои покупки</button></nav>
            {error ? <div className={style.error} role="alert">{error} <button type="button" onClick={() => setAttempt((value) => value + 1)}>Повторить</button></div> : null}
            {mine ? account?.kind !== 'user' ? <div className={style.empty}><h2>Отзыв о вашей покупке</h2><p>Войдите, чтобы выбрать заказ, или откройте персональную ссылку от менеджера.</p><button type="button" className={style.button} onClick={() => openLogin('review')}>Войти</button></div>
                : orders === null ? <p className={style.empty}>Загружаем ваши покупки…</p>
                    : orders.length ? <div className={style.orders}>{orders.map((order) => <article key={order.id} className={style.order}><strong>Заказ №{order.id}</strong><span>{purchaseDate(order.purchasedAt)}</span>{order.items.map((item, index) => <span key={index}>{item.name}{item.quantity > 1 ? ` × ${item.quantity}` : ''}</span>)}{order.review ? <span className={style.verified}>✓ Отзыв оставлен · {order.review.rating} из 5</span> : <Link className={style.button} to={`/reviews/write/${order.id}`}>Оставить отзыв</Link>}</article>)}</div>
                        : <div className={style.empty}><h2>Покупок для отзыва пока нет</h2><p>Здесь появятся ваши оплаченные и выполненные заказы.</p></div>
                : <>{data?.items.length ? <div className={style.grid}>{data.items.map((review) => <ReviewCard key={review.id} review={review}/>)}</div> : !busy && !error ? <div className={style.empty}><h2>Первый отзыв может быть вашим</h2><p>Поделитесь впечатлениями после покупки.</p></div> : null}{data?.hasMore ? <button className={style.more} type="button" disabled={busy} onClick={() => setPage((value) => value + 1)}>{busy ? 'Загружаем…' : 'Показать ещё'}</button> : null}</>}
        </section>
    );
}
