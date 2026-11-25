import React, {useEffect, useState} from 'react';
import {Link, useSearchParams} from 'react-router-dom';
import {fetchReviewOrders, fetchReviews} from '../../shared/api/reviews';
import {useSessionStore} from '../../store/useSessionStore';
import ReviewCard, {purchaseDate} from './ReviewCard';
import ExternalReviews from './ExternalReviews.jsx';
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
    const [external, setExternal] = useState(null);
    const [externalError, setExternalError] = useState(false);

    useEffect(() => {
        let active = true;
        import('./externalReviews.json').then((result) => { if (active) setExternal(result.default); })
            .catch(() => { if (active) setExternalError(true); });
        return () => { active = false; };
    }, []);

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

    const count = (data?.count || 0) + (external?.reviews.length || 0);
    const average = count ? (((data?.average || 0) * (data?.count || 0) + (external?.reviews.reduce((sum, review) => sum + (review.rating || 5), 0) || 0)) / count).toFixed(1) : null;
    const countLabel = {one: 'отзыв', few: 'отзыва', many: 'отзывов', other: 'отзыва'}[new Intl.PluralRules('ru-RU').select(count)];

    return (
        <section className={style.screen}>
            <header className={`${style.heading} ${style.pageHeading}`}><h1>Отзывы клиентов</h1>
                <div className={style.score}>{count ? <><span className={style.scoreStars} aria-hidden="true">★★★★★</span><strong>{average}</strong><span className={style.scoreScale}>из 5</span><span className={style.scoreCount}>{count.toLocaleString('ru-RU')} {countLabel}</span></> : <strong className={style.noScore}>{busy || !external ? 'Загружаем…' : 'Пока без оценок'}</strong>}</div>
                <p>{data || external ? `${count.toLocaleString('ru-RU')} ${countLabel} покупателей` : 'Загружаем отзывы…'}</p>
                <button type="button" className={style.button} onClick={() => {setMine(true); if (account?.kind !== 'user') openLogin('review');}}>Оставить отзыв</button>
            </header>
            <nav className={style.tabs} aria-label="Раздел отзывов"><button type="button" aria-pressed={!mine} onClick={() => {setMine(false); setError('');}}>Все отзывы</button><button type="button" aria-pressed={mine} onClick={() => {setMine(true); setError('');}}>Мои отзывы</button></nav>
            {error ? <div className={style.error} role="alert">{error} <button type="button" onClick={() => setAttempt((value) => value + 1)}>Повторить</button></div> : null}
            {mine ? account?.kind !== 'user' ? <div className={style.empty}><h2>Отзыв о вашей покупке</h2><p>Войдите, чтобы выбрать заказ, или откройте персональную ссылку от менеджера.</p><button type="button" className={style.button} onClick={() => openLogin('review')}>Войти</button></div>
                : orders === null ? <p className={style.empty}>Загружаем ваши покупки…</p>
                    : orders.length ? <>
                        {orders.some((order) => order.review) ? <><h2 className={style.sectionTitle}>Мои отзывы</h2><div className={style.grid}>{orders.filter((order) => order.review).map((order) => <ReviewCard key={order.id} review={order.review}/>)}</div></> : <p className={style.empty}>Вы ещё не оставляли отзывов.</p>}
                        {orders.some((order) => !order.review) ? <><h2 className={style.sectionTitle}>Покупки без отзыва</h2><div className={style.orders}>{orders.filter((order) => !order.review).map((order) => <article key={order.id} className={style.order}><strong>Заказ №{order.id}</strong><span>{purchaseDate(order.purchasedAt)}</span>{order.items.map((item, index) => <span key={index}>{item.name}{item.quantity > 1 ? ` × ${item.quantity}` : ''}</span>)}<Link className={style.button} to={`/reviews/write/${order.id}`}>Оставить отзыв</Link></article>)}</div></> : null}
                    </>
                        : <div className={style.empty}><h2>Покупок для отзыва пока нет</h2><p>Здесь появятся ваши оплаченные и выполненные заказы.</p></div>
                : <><h2 className={style.sectionTitle}>Отзывы на сайте</h2>{data?.items.length ? <div className={style.grid}>{data.items.map((review) => <ReviewCard key={review.id} review={review}/>)}</div> : !busy && !error ? <div className={style.empty}><h2>Первый отзыв на сайте может быть вашим</h2><p>Поделитесь впечатлениями после покупки.</p></div> : null}{data?.hasMore ? <button className={style.more} type="button" disabled={busy} onClick={() => setPage((value) => value + 1)}>{busy ? 'Загружаем…' : 'Показать ещё'}</button> : null}{external?.reviews.length ? <ExternalReviews data={external}/> : !externalError ? <p className={style.notice} role="status">Загружаем отзывы с других площадок…</p> : <p className={style.notice} role="status">Не удалось загрузить отзывы с других площадок. Обновите страницу.</p>}</>}
        </section>
    );
}
