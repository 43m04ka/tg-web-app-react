import React, {useCallback, useState} from 'react';
import {money} from '../../../pages/Basket/cartModel';
import {supportUrlForBot} from '../../../pages/More/moreMenu';
import Spinner from '../../ui/Spinner';
import OrderCodes from '../../../shared/ui/OrderCodes/OrderCodes';
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

export function CodeWaitingDesktop({order, onOpenAgain, onCancel, isPaymentOpen = true}) {
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
            lead={isPaymentOpen
                ? 'Окно оплаты открылось в отдельной вкладке — эту страницу закрывать не нужно'
                : 'Нажмите «Перейти к оплате» — страница банка откроется в отдельной вкладке'}
            note={order?.manual
                ? 'Как только оплата пройдёт, менеджер возьмёт заказ в работу'
                : 'Код зарезервирован за вами, пока счёт активен'}
        >
            <StatusRows rows={rowsOf(order, 'Ожидает оплаты', 'toneWaiting')}/>

            {error ? <StatusError>{error}</StatusError> : null}

            <StatusActions>
                {order?.paymentUrl ? (
                    <button type="button" className={statusStyle.primary} onClick={onOpenAgain}>
                        {isPaymentOpen ? 'Открыть оплату снова' : 'Перейти к оплате'}
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
    const codes = Array.isArray(order?.codes) ? order.codes : [];
    const many = codes.length > 1 || order?.quantity > 1;
    const issued = codes.length > 0;

    return (
        <StatusStage
            tone="success"
            icon="✓"
            title={order?.manual || !issued ? 'Заказ оплачен!' : `${many ? 'Коды выданы' : 'Код выдан'}!`}
            lead={order?.manual
                ? 'Менеджер уже получил заказ и напишет вам в этот же чат'
                : issued
                    ? `${many ? 'Коды также есть' : 'Код также есть'} в разделе «Мои заказы» и в письме на вашу почту`
                    : `${many ? 'Коды появятся' : 'Код появится'} здесь через несколько секунд`}
            note={order?.manual
                ? 'Подписку оформляют вручную — обычно это занимает до часа в рабочее время'
                : `${many ? 'Коды одноразовые' : 'Код одноразовый'} — сохраните ${many ? 'их' : 'его'}, повторно мы не выдадим`}
        >
            {!order?.manual ? <OrderCodes codes={codes}/> : null}

            <StatusRows
                rows={rowsOf(order, order?.manual ? 'Оплачено, оформляем' : issued ? 'Оплачено, код выдан' : 'Оплачено, выдаём код', 'toneDone')}
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
