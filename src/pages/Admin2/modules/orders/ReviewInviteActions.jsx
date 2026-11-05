import React, {useCallback, useEffect, useState} from 'react';
import {Button, InspectorSection, Note} from '../../ui';
import {createReviewLink} from './api';
import {askConfirm, toast, toastFail} from '../../platform/notify';
import style from './OrderInspector.module.scss';
import {httpGet} from '../../platform/http';
import {formatMoscow} from '../../platform/moscowTime';

export default function ReviewInviteActions({order}) {
    const [busy, setBusy] = useState(false);
    const [link, setLink] = useState('');
    const [history, setHistory] = useState(null);
    const [expiresAt, setExpiresAt] = useState(null);
    const [historyError, setHistoryError] = useState('');
    const load = useCallback(() => httpGet('/reviews', {query: {orderId: order?.id}}).then(setHistory).catch((failure) => setHistoryError(failure.message)), [order?.id]);
    useEffect(() => {if (order?.id) load();}, [load, order?.id]);
    if (!order || !['paid', 'completed'].includes(order.status)) return null;

    const prepare = async (send) => {
        if (busy) return;
        if (send && !await askConfirm({title: 'Отправить ссылку на отзыв?', text: `Покупатель заказа №${order.id} получит сообщение в Telegram.`, confirmText: 'Отправить'})) return;
        setBusy(true);
        try {
            const result = await createReviewLink({orderId: order.id, send});
            setLink(result.url);
            setExpiresAt(result.expiresAt);
            await load();
            if (send) toast({tone: 'positive', title: 'Ссылка отправлена покупателю'});
            else {
                try {
                    await navigator.clipboard.writeText(result.url);
                    toast({tone: 'positive', title: 'Ссылка на отзыв скопирована'});
                } catch {
                    toastFail('Буфер обмена недоступен', 'Скопируйте ссылку из поля ниже');
                }
            }
        } catch (error) {
            toastFail('Не удалось подготовить ссылку', error.message);
        } finally {
            setBusy(false);
        }
    };

    return <InspectorSection title="Отзыв покупателя"><div className={style.reviewActions}>
        <Button disabled={busy || Boolean(history?.reviews.length)} onClick={() => prepare(true)}>Отправить ссылку на отзыв</Button>
        <Button variant="ghost" disabled={busy || Boolean(history?.reviews.length)} onClick={() => prepare(false)}>Скопировать ссылку на отзыв</Button>
        {link ? <label>Персональная ссылка<input aria-label="Персональная ссылка на отзыв" value={link} readOnly onFocus={(event) => event.target.select()}/></label> : null}
        {expiresAt ? <Note>Действует до {formatMoscow(expiresAt)}</Note> : null}
        {historyError ? <Note>{historyError}</Note> : null}
        {history?.reviews.map((review) => <Note key={review.id}>Отзыв оставлен {formatMoscow(review.createdAt)} · {review.rating} из 5</Note>)}
        {history?.invitations.slice(0, 3).map((invitation) => <Note key={invitation.id}>Создана {formatMoscow(invitation.createdAt)}{invitation.sentAt ? ` · отправлена в Telegram ${formatMoscow(invitation.sentAt)}` : ' · автоматически не отправлялась'}</Note>)}
        <Note>Ссылка действует 30 дней. Один отзыв на заказ. Автоматической отправки нет.</Note>
    </div></InspectorSection>;
}
