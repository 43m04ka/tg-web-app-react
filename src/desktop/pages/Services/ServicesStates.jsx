import React, {useCallback, useState} from 'react';
import {money} from '../../../pages/Basket/cartModel';
import {supportUrlForBot} from '../../../pages/More/moreMenu';
import Spinner from '../../ui/Spinner';
import StatusStage, {StatusActions, StatusError, StatusRows, statusStyle} from '../../ui/StatusStage';

const rowsOf = (order, status, tone) => [
    {label: 'Заказ №', value: order?.orderId},
    order?.title ? {label: 'Товар', value: order.title} : null,
    order?.quantity > 1 ? {label: 'Количество', value: `${order.quantity} шт.`} : null,
    {label: 'Сумма', value: money(order?.total)},
    {label: 'Статус', value: status, tone}
];

function ManagerButton({botType, label = 'Связаться с менеджером'}) {
    const url = supportUrlForBot(botType);

    const open = useCallback(() => {
        if (url) window.open(url, '_blank', 'noopener');
    }, [url]);

    if (!url) return null;

    return (
        <button type="button" className={statusStyle.secondary} onClick={open}>
            {label}
        </button>
    );
}

export function CodeWaitingDesktop({order, onOpenAgain, onCancel}) {
    const [error, setError] = useState('');
    const [isCanceling, setCanceling] = useState(false);

    const cancel = useCallback(async () => {
        if (isCanceling) return;

        setCanceling(true);
        const message = await onCancel();
        if (message) setError(message);
        setCanceling(false);
    }, [isCanceling, onCancel]);

    return (
        <StatusStage
            tone="waiting"
            icon={<Spinner className={statusStyle.iconSpinner}/>}
            title="Ждём оплату"
            lead="Окно оплаты открылось в отдельной вкладке — эту страницу закрывать не нужно"
            note={order?.manual
                ? 'Как только оплата пройдёт, менеджер возьмёт заказ в работу'
                : 'Код зарезервирован за вами, пока счёт активен'}
        >
            <StatusRows rows={rowsOf(order, 'Ожидает оплаты', 'toneWaiting')}/>

            {error ? <StatusError>{error}</StatusError> : null}

            <StatusActions>
                {order?.paymentUrl ? (
                    <button type="button" className={statusStyle.primary} onClick={onOpenAgain}>
                        Открыть оплату снова
                    </button>
                ) : null}

                <button
                    type="button"
                    className={statusStyle.secondary}
                    disabled={isCanceling}
                    onClick={cancel}
                >
                    {isCanceling ? <Spinner/> : null}
                    {isCanceling ? 'Отменяем…' : 'Отменить оплату'}
                </button>
            </StatusActions>
        </StatusStage>
    );
}

export function CodeDoneDesktop({order, botType, onClose}) {
    const many = order?.quantity > 1;

    return (
        <StatusStage
            tone="success"
            icon="✓"
            title={order?.manual ? 'Заказ оплачен!' : 'Код отправлен!'}
            lead={order?.manual
                ? 'Менеджер уже получил заказ и напишет вам в этот же чат'
                : `${many ? 'Коды пришли' : 'Код пришёл'} отдельным сообщением в этот же чат`}
            note={order?.manual
                ? 'Подписку оформляют вручную — обычно это занимает до часа в рабочее время'
                : `${many ? 'Коды одноразовые' : 'Код одноразовый'} — сохраните ${many ? 'их' : 'его'}, повторно мы не выдадим`}
        >
            <StatusRows
                rows={rowsOf(order, order?.manual ? 'Оплачено, оформляем' : 'Оплачено, код выдан', 'toneDone')}
            />

            <StatusActions>
                <button type="button" className={statusStyle.primary} onClick={onClose}>
                    Купить ещё
                </button>
                <ManagerButton botType={botType}/>
            </StatusActions>
        </StatusStage>
    );
}

export function CodeFailDesktop({order, onRetry, onClose}) {
    return (
        <StatusStage
            tone="fail"
            icon="!"
            title="Счёт не оплачен"
            lead="Срок действия счёта истёк, деньги не списались"
            note="Код вернулся в продажу — оформите заказ заново"
        >
            <StatusRows rows={rowsOf(order, 'Оплата не прошла', 'toneFail')}/>

            <StatusActions>
                <button type="button" className={statusStyle.primary} onClick={onRetry}>
                    Попробовать снова
                </button>
                <button type="button" className={statusStyle.secondary} onClick={onClose}>
                    На главную
                </button>
            </StatusActions>
        </StatusStage>
    );
}

export function CodeStalledDesktop({order, botType, onClose}) {
    return (
        <StatusStage
            tone="fail"
            icon="!"
            title="Статус пока не пришёл"
            lead="Мы долго не получаем ответ от кассы по этому счёту"
            note="Если деньги списались, напишите менеджеру — он оформит заказ вручную"
        >
            <StatusRows rows={rowsOf(order, 'Требует проверки', 'toneFail')}/>

            <StatusActions>
                <ManagerButton botType={botType} label="Написать администратору"/>
                <button type="button" className={statusStyle.secondary} onClick={onClose}>
                    Вернуться к покупке
                </button>
            </StatusActions>
        </StatusStage>
    );
}
