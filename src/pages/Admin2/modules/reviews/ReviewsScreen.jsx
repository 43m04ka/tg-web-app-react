import React, {useCallback, useEffect, useState} from 'react';
import {httpGet, httpPost} from '../../platform/http';
import {usePageHeader} from '../../shell/pageHeader';
import {Button, Field, Input, Textarea, Note} from '../../ui';
import {formatMoscow} from '../../platform/moscowTime';
import style from './ReviewsScreen.module.scss';

export default function ReviewsScreen() {
    usePageHeader('Отзывы по ссылке');
    const [data, setData] = useState(null);
    const [name, setName] = useState('');
    const [date, setDate] = useState('');
    const [items, setItems] = useState('');
    const [orderId, setOrderId] = useState('');
    const [result, setResult] = useState(null);
    const [busy, setBusy] = useState(false);
    const [error, setError] = useState('');
    const [editing, setEditing] = useState(null);
    const [quantities, setQuantities] = useState([]);
    const [onlyUnfilled, setOnlyUnfilled] = useState(false);
    const load = useCallback(() => httpGet('/reviews').then(setData).catch((failure) => setError(failure.message)), []);
    useEffect(() => { load(); }, [load]);
    const create = async (event) => {
        event.preventDefault();
        if (busy) return;
        setBusy(true); setError(''); setResult(null);
        try {
            const purchase = {purchasedAt: `${date}T00:00:00+03:00`, items: items.split('\n').map((value) => value.trim()).filter(Boolean).map((value, index) => ({name: value, quantity: editing ? quantities[index] || 1 : 1}))};
            if (editing) {
                await httpPost('/reviews/purchase', {id: editing, ...(orderId.trim() ? {orderId: Number(orderId)} : purchase)});
                setEditing(null); setDate(''); setItems(''); setOrderId('');
                await load();
                return;
            }
            const created = orderId.trim()
                ? await httpPost('/order/review-link', {orderId: Number(orderId), send: false})
                : await httpPost('/reviews/invitation', {displayName: name, ...purchase});
            setResult(created);
            await load();
        } catch (failure) { setError(failure.message); }
        finally { setBusy(false); }
    };
    return <div className={style.screen}>
        <section className={style.panel}>
            <h2>Общая ссылка на отзыв</h2>
            <Note>Постоянная ссылка для всех регионов. Покупатель оставляет отзыв; состав покупки указывает администратор.</Note>
            <Input readOnly value="https://gwstore.ru/reviews/write" onFocus={(event) => event.target.select()}/>
            <Button type="button" variant="ghost" onClick={async () => {try {await navigator.clipboard.writeText('https://gwstore.ru/reviews/write');} catch {setError('Скопируйте ссылку из поля вручную');}}}>Скопировать общую ссылку</Button>
        </section>
        <form id="review-purchase-form" onSubmit={create} className={style.panel}>
            <h2>{editing ? 'Данные покупки в отзыве' : 'Создать персональную ссылку'}</h2>
            <Note>{editing ? 'Выберите заказ, чтобы перенести его состав и дату, или заполните покупку вручную.' : 'Укажите номер заказа магазина или внесите покупку вручную. Покупатель сам напишет отзыв и выберет оценку.'}</Note>
            <Field label="Номер заказа магазина" hint="Если покупка оформлена в другом месте, оставьте пустым"><Input type="number" min="1" list="review-order-options" value={orderId} onChange={(event) => setOrderId(event.target.value)} disabled={busy}/></Field>
            <datalist id="review-order-options">{data?.orders?.filter((order) => !order.hasReview).map((order) => <option key={order.id} value={order.id}>№{order.id} · {order.items.map((item) => item.name).join(' · ')}</option>)}</datalist>
            {!orderId.trim() ? <>
                {!editing ? <Field label="Имя покупателя"><Input value={name} maxLength={64} onChange={(event) => setName(event.target.value)} disabled={busy}/></Field> : null}
                <Field label="Дата покупки" required><Input type="date" required value={date} onChange={(event) => setDate(event.target.value)} disabled={busy}/></Field>
                <Field label="Что купили" hint="Каждый товар с новой строки, например: Apple · 10 TRY · Турция" required><Textarea required value={items} onChange={(event) => setItems(event.target.value)} disabled={busy}/></Field>
            </> : null}
            {error ? <p role="alert">{error}</p> : null}
            <Button type="submit" disabled={busy}>{busy ? 'Сохраняем…' : editing ? 'Сохранить покупку' : 'Создать ссылку'}</Button>
            {editing ? <Button type="button" variant="ghost" onClick={() => {setEditing(null);setDate('');setItems('');}}>Отмена</Button> : null}
            {result ? <div className={style.result}><Field label="Ссылка для покупателя"><Input readOnly value={result.url} onFocus={(event) => event.target.select()}/></Field><Button type="button" variant="ghost" onClick={async () => {try {await navigator.clipboard.writeText(result.url);} catch {setError('Скопируйте ссылку из поля вручную');}}}>Скопировать ссылку</Button><Note>Создана {formatMoscow(result.createdAt)}. Действует до {formatMoscow(result.expiresAt)}.</Note></div> : null}
        </form>
        <section className={style.panel}><h2>Выданные ссылки</h2><Button variant="ghost" onClick={load}>Обновить</Button>
            {data ? data.invitations.length ? data.invitations.map((invitation) => <article className={style.row} key={invitation.id}>
                <strong>{invitation.orderId ? `Заказ №${invitation.orderId}` : invitation.items?.map((item) => item.name).join(' · ')}</strong>
                <span>Создана {formatMoscow(invitation.createdAt)}</span>
                <span>{invitation.consumedAt ? `Отзыв оставлен ${formatMoscow(invitation.consumedAt)}` : new Date(invitation.expiresAt) <= new Date() ? 'Срок истёк' : 'Ожидаем отзыв'}</span>
                {invitation.sentAt ? <span>Отправлена в Telegram {formatMoscow(invitation.sentAt)}</span> : <span>Автоматически не отправлялась</span>}
            </article>) : <Note>Ссылок пока нет.</Note> : <Note>Загружаем…</Note>}
        </section>
        <section className={style.panel}>
            <h2>Оставленные отзывы</h2>
            <label><input type="checkbox" checked={onlyUnfilled} onChange={(event) => setOnlyUnfilled(event.target.checked)}/> Без состава покупки</label>
            {data?.reviews.filter((review) => !onlyUnfilled || !review.items?.length).map((review) => <article className={style.row} key={review.id}>
                <strong>{review.displayName} · {review.rating} из 5</strong>
                <span>{review.purchasedAt ? `Покупка ${formatMoscow(review.purchasedAt)}` : 'Дата покупки не указана'}</span>
                <span>{review.items?.length ? review.items.map((item) => item.name).join(' · ') : 'Состав покупки не заполнен'}</span>
                {review.orderId ? <span>Заказ №{review.orderId}</span> : null}
                <p>{review.text}</p><span>Опубликован {formatMoscow(review.createdAt)}</span>
                {!review.orderId ? <Button variant="ghost" onClick={() => {
                    setEditing(review.id);setOrderId('');setDate(review.purchasedAt ? new Date(new Date(review.purchasedAt).getTime() + 10800000).toISOString().slice(0, 10) : '');
                    setItems((review.items || []).map((item) => item.name).join('\n'));setQuantities((review.items || []).map((item) => item.quantity || 1));setResult(null);
                    document.getElementById('review-purchase-form')?.scrollIntoView({behavior: 'smooth'});
                }}>Указать данные покупки</Button> : null}
            </article>)}
        </section>
        <section className={style.panel}><h2>Последние заказы</h2>{data?.orders?.map((order) => <article className={style.row} key={order.id}>
            <strong>Заказ №{order.id}</strong><span>{formatMoscow(order.purchasedAt)}</span>
            <span>{order.items.map((item) => item.name).join(' · ')}</span><span>{order.hasReview ? 'Есть отзыв' : 'Без отзыва'}</span>
            {editing && !order.hasReview ? <Button variant="ghost" onClick={() => {setOrderId(String(order.id));document.getElementById('review-purchase-form')?.scrollIntoView({behavior: 'smooth'});}}>Связать с редактируемым отзывом</Button> : null}
        </article>)}</section>
    </div>;
}
