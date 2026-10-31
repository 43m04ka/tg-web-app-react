import React, {useEffect, useState} from 'react';
import {Link, useLocation, useParams} from 'react-router-dom';
import {fetchReviewForm, submitReview} from '../../shared/api/reviews';
import {PRIVACY_URL, OFFER_URL} from '../../shared/ui/LegalNote/LegalNote';
import {purchaseDate} from './ReviewCard';
import style from './Reviews.module.scss';

export default function ReviewForm() {
    const {orderId} = useParams();
    const location = useLocation();
    const token = new URLSearchParams(location.hash.slice(1)).get('token');
    const [data, setData] = useState(null);
    const [error, setError] = useState('');
    const [rating, setRating] = useState(0);
    const [text, setText] = useState('');
    const [name, setName] = useState('');
    const [files, setFiles] = useState([]);
    const [consent, setConsent] = useState(false);
    const [publicationConsent, setPublicationConsent] = useState(false);
    const [busy, setBusy] = useState(false);
    const [sent, setSent] = useState(false);

    useEffect(() => {
        const controller = new AbortController();
        if (!token && !orderId) {
            setError('Откройте персональную ссылку или выберите ваш заказ в разделе отзывов');
            return () => controller.abort();
        }
        fetchReviewForm({orderId, token, signal: controller.signal}).then((result) => {
            setData(result);
            setName(result.displayName);
        }).catch((failure) => { if (!controller.signal.aborted) setError(failure.message); });
        return () => controller.abort();
    }, [orderId, token]);

    const send = async (event) => {
        event.preventDefault();
        if (busy || !rating || !consent || !publicationConsent) return;
        setBusy(true);
        setError('');
        const form = new FormData();
        form.set('rating', String(rating));
        form.set('text', text);
        form.set('displayName', name);
        form.set('consent', String(consent));
        form.set('publicationConsent', String(publicationConsent));
        if (token) form.set('token', token);
        else form.set('orderId', orderId);
        files.forEach((file) => form.append('photos', file));
        try {
            await submitReview(form, Boolean(token));
            setSent(true);
        } catch (failure) {
            setError(failure.message);
        } finally {
            setBusy(false);
        }
    };

    return (
        <section className={style.screen}>
            <Link className={style.back} to="/reviews">← Все отзывы</Link>
            {sent ? <div className={style.success} role="status"><span>✓</span><h1>Спасибо за ваш отзыв!</h1><p>Он уже появился в разделе отзывов.</p><Link className={style.button} to="/reviews">Посмотреть отзывы</Link></div> : <>
                <header className={style.heading}><span className={style.eyebrow}>Ваш опыт важен</span><h1>Как прошла покупка?</h1><p>Поделитесь впечатлениями о заказе</p></header>
                {error ? <p className={style.error} role="alert">{error}</p> : null}
                {!data && !error ? <p className={style.empty} role="status">Загружаем ваш заказ…</p> : null}
                {data ? <form className={style.form} onSubmit={send}>
                    <div className={style.order}><strong>Заказ №{data.order.id}</strong><span>Покупка {purchaseDate(data.order.purchasedAt)}</span>{data.order.items.map((item, index) => <span key={index}>{item.name}{item.quantity > 1 ? ` × ${item.quantity}` : ''}</span>)}</div>
                    <fieldset className={style.rating}><legend>Ваша оценка</legend><div role="radiogroup" aria-label="Оценка покупки">{[1, 2, 3, 4, 5].map((value) => <button type="button" key={value} role="radio" aria-checked={rating === value} aria-label={`${value} из 5`} className={value <= rating ? style.selected : ''} onClick={() => setRating(value)} disabled={busy}>★</button>)}</div><span>{rating ? `${rating} из 5` : 'Выберите от 1 до 5 звёзд'}</span></fieldset>
                    <label className={style.field}>Имя или ник<input value={name} onChange={(event) => setName(event.target.value)} maxLength={64} required disabled={busy}/></label>
                    <label className={style.field}>Ваш отзыв<textarea value={text} onChange={(event) => setText(event.target.value)} minLength={1} maxLength={3000} required disabled={busy} rows={5} placeholder="Что вам понравилось?"/><span>{text.length} / 3000</span></label>
                    <label className={style.upload}>Добавить фотографии<input type="file" multiple accept="image/jpeg,image/png,image/webp" disabled={busy} onChange={(event) => {
                        const selected = Array.from(event.target.files || []);
                        if (selected.length > 4 || selected.some((file) => file.size > 5 * 1024 * 1024)) {
                            setError('Можно прикрепить до четырёх фото, каждое не больше 5 МБ');
                            setFiles([]);
                            event.target.value = '';
                            return;
                        }
                        setFiles(selected);
                        setError('');
                    }}/><span>До 4 фото · JPG, PNG, WebP · до 5 МБ каждое</span></label>
                    {files.length ? <ul className={style.filenames}>{files.map((file, index) => <li key={index}>{file.name}</li>)}</ul> : null}
                    <p className={style.notice}>Имя, отзыв и фотографии будут видны всем. Не добавляйте контакты, данные аккаунтов и оплаты.</p>
                    <label className={style.consent}><input type="checkbox" checked={consent} onChange={(event) => setConsent(event.target.checked)} required disabled={busy}/><span>Даю согласие на обработку данных в соответствии с <a href={PRIVACY_URL} target="_blank" rel="noreferrer">Политикой конфиденциальности</a> и принимаю <a href={OFFER_URL} target="_blank" rel="noreferrer">Пользовательское соглашение</a>.</span></label>
                    <label className={style.consent}><input type="checkbox" checked={publicationConsent} onChange={(event) => setPublicationConsent(event.target.checked)} required disabled={busy}/><span>Разрешаю публикацию указанного имени, текста и фотографий отзыва в открытом доступе.</span></label>
                    <button className={style.button} type="submit" disabled={busy || !rating || !consent || !publicationConsent || !text.trim()}>{busy ? 'Отправляем…' : 'Опубликовать отзыв'}</button>
                </form> : null}
            </>}
        </section>
    );
}
