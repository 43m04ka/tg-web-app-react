import React, {useState} from 'react';
import {Button, InspectorSection, Note} from '../../ui';
import {createReviewLink} from './api';
import {askConfirm, toast, toastFail} from '../../platform/notify';
import style from './OrderInspector.module.scss';

export default function ReviewInviteActions({order}) {
    const [busy, setBusy] = useState(false);
    const [link, setLink] = useState('');
    if (!order || !['paid', 'completed'].includes(order.status)) return null;

    const prepare = async (send) => {
        if (busy) return;
        if (send && !await askConfirm({title: 'Отправить ссылку на отзыв?', text: `Покупатель заказа №${order.id} получит сообщение в Telegram.`, confirmText: 'Отправить'})) return;
        setBusy(true);
        try {
            const result = await createReviewLink({orderId: order.id, send});
            setLink(result.url);
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
        <Button disabled={busy} onClick={() => prepare(true)}>Отправить ссылку на отзыв</Button>
        <Button variant="ghost" disabled={busy} onClick={() => prepare(false)}>Скопировать ссылку на отзыв</Button>
        {link ? <label>Персональная ссылка<input aria-label="Персональная ссылка на отзыв" value={link} readOnly onFocus={(event) => event.target.select()}/></label> : null}
        <Note>Ссылка действует 30 дней. Один отзыв на заказ. Автоматической отправки нет.</Note>
    </div></InspectorSection>;
}
