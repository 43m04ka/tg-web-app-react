import React, {useCallback, useState} from 'react';
import {money} from '../../../pages/Basket/cartModel';
import {supportUrlForBot} from '../../../pages/More/moreMenu';
import Spinner from '../../ui/Spinner';
import StatusStage, {StatusActions, StatusError, StatusRows, statusStyle} from '../../ui/StatusStage';

const rowsOf = (order, status, tone) => [
    {label: 'Заказ №', value: order?.orderId},
    {label: 'Сумма', value: money(order?.total)},
    order?.steamLogin ? {label: 'Steam аккаунт', value: order.steamLogin} : null,
    {label: 'Статус', value: status, tone}
];

function ManagerButton({botType, label = 'Связаться с менеджером', variant = 'secondary'}) {
    const url = supportUrlForBot(botType);

    const open = useCallback(() => {
        if (url) window.open(url, '_blank', 'noopener');
    }, [url]);

    if (!url) return null;

    return (
        <button
            type="button"
            className={variant === 'primary' ? statusStyle.danger : statusStyle.secondary}
            onClick={open}
        >
            {label}
        </button>
    );
}

export function SteamWaitingDesktop({order, onOpenAgain, onCancel}) {
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
            note="Статус обновится сам, как только банк подтвердит перевод"
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

export function SteamCreditingDesktop({order, botType}) {
    return (
        <StatusStage
            tone="waiting"
            icon={<Spinner className={statusStyle.iconSpinner}/>}
            title="Пополняем баланс…"
            lead="Оплата получена, зачисляем средства на баланс Steam"
            note="Обычно занимает 5–15 минут"
        >
            <StatusRows rows={rowsOf(order, 'Оплачено, зачисляем', 'toneWaiting')}/>

            <StatusActions>
                <ManagerButton botType={botType}/>
            </StatusActions>
        </StatusStage>
    );
}

export function SteamDoneDesktop({order, botType, onClose}) {
    return (
        <StatusStage
            tone="success"
            icon="✓"
            title="Готово!"
            lead="Баланс Steam пополнен. Спасибо за заказ!"
        >
            <StatusRows rows={rowsOf(order, 'Зачислено на баланс', 'toneDone')}/>

            <StatusActions>
                <button type="button" className={statusStyle.primary} onClick={onClose}>
                    Пополнить ещё раз
                </button>
                <ManagerButton botType={botType}/>
            </StatusActions>
        </StatusStage>
    );
}

export function SteamFailDesktop({order, onRetry, onClose}) {
    return (
        <StatusStage
            tone="fail"
            icon="!"
            title="Счёт не оплачен"
            lead="Срок действия счёта истёк, деньги не списались"
            note="Можно создать заказ заново — данные сохранились"
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

export function SteamStalledDesktop({order, botType, onClose}) {
    return (
        <StatusStage
            tone="fail"
            icon="!"
            title="Не удалось зачислить автоматически"
            lead="Деньги не потеряны — заказ уже у администратора, зачислим вручную"
            note="Обычно до 30 минут, 10:00–22:00 МСК"
        >
            <StatusRows rows={rowsOf(order, 'Требует проверки', 'toneFail')}/>

            <StatusActions>
                <ManagerButton botType={botType} label="Написать администратору" variant="primary"/>
                <button type="button" className={statusStyle.secondary} onClick={onClose}>
                    Вернуться к пополнению
                </button>
            </StatusActions>
        </StatusStage>
    );
}
