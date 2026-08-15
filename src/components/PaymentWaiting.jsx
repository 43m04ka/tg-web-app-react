import React, { useState } from 'react';
import style from './PaymentWaiting.module.scss';
import AnimatedGradientBackground from './AnimatedGradientBackground';
import { openSupport } from './supportLink';

const PaymentWaiting = ({ paymentUrl, status, payoutStatus, stalled, orderData, extraRows = [], onCancel }) => {
    const [canceling, setCanceling] = useState(false);
    const [cancelError, setCancelError] = useState('');

    const handleOpenPayment = () => {
        if (paymentUrl) {
            window.open(paymentUrl, '_blank');
        }
    };

    // Выдача сорвалась (payoutStatus: error) или опрос статуса затянулся без изменений —
    // дальше крутить спиннер бессмысленно, показываем контакт поддержки
    const isPayoutStuck = payoutStatus === 'error' || stalled;
    const isPayingOut = status === 'paid' && !isPayoutStuck;

    const handleCancel = async () => {
        if (canceling) return;
        setCanceling(true);
        setCancelError('');
        try {
            const message = await onCancel?.();
            // Отмену мог опередить вебхук кассы — тогда обработчик возвращает текст
            // про фактический статус заказа, его и показываем вместо ошибки
            if (message) setCancelError(message);
        } finally {
            setCanceling(false);
        }
    };

    let title = 'Ожидание оплаты';
    let statusText = 'Ожидает оплаты';
    let statusColor = '#ffffff';
    let message = 'Пожалуйста, завершите оплату в открывшемся окне';
    let subMessage = 'Статус будет обновлен автоматически';

    if (isPayingOut) {
        title = 'Пополняем баланс…';
        statusText = 'Оплачено, зачисляем';
        message = 'Оплата получена, зачисляем средства на баланс Steam';
    } else if (isPayoutStuck) {
        title = 'Оплата получена';
        statusText = 'Зачисление задерживается';
        statusColor = '#FFA726';
        message = 'С пополнением возникла небольшая заминка, менеджер уже разбирается.';
        subMessage = 'Если баланс не изменится в ближайшее время, напишите менеджеру.';
    }

    return (
        <div className={style['container']}>
            <AnimatedGradientBackground />
            <div className={style['card']}>
                <div className={style['icon']}>
                    {isPayoutStuck ? (
                        <svg width="80" height="80" viewBox="0 0 80 80" fill="none">
                            <circle cx="40" cy="40" r="40" fill="#FFA726"/>
                            <path d="M40 22V44M40 54V56" stroke="white" strokeWidth="4" strokeLinecap="round"/>
                        </svg>
                    ) : (
                        <div className={style['spinner']}></div>
                    )}
                </div>
                <h1 className={style['title']}>{title}</h1>

                {orderData && (
                    <div className={style['orderDetails']}>
                        <div className={style['orderDetailRow']}>
                            <span className={style['orderDetailLabel']}>Заказ №:</span>
                            <span className={style['orderDetailValue']}>{orderData.orderId ?? 'N/A'}</span>
                        </div>
                        <div className={style['orderDetailRow']}>
                            <span className={style['orderDetailLabel']}>Сумма:</span>
                            <span className={style['orderDetailValue']}>{orderData.total ?? orderData.topupAmount ?? 'N/A'} ₽</span>
                        </div>
                        {extraRows.map((row, i) => (
                            <div className={style['orderDetailRow']} key={i}>
                                <span className={style['orderDetailLabel']}>{row.label}:</span>
                                <span className={style['orderDetailValue']}>{row.value}</span>
                            </div>
                        ))}
                        <div className={style['orderDetailRow']}>
                            <span className={style['orderDetailLabel']}>Статус:</span>
                            <span className={style['orderDetailValue']} style={{color: statusColor}}>{statusText}</span>
                        </div>
                    </div>
                )}

                <p className={style['message']}>{message}</p>
                <p className={style['subMessage']}>{subMessage}</p>

                {isPayoutStuck && (
                    <button
                        className={style['button']}
                        onClick={openSupport}
                    >
                        Связаться с менеджером
                    </button>
                )}
                {!isPayingOut && !isPayoutStuck && paymentUrl && (
                    <button
                        className={style['button']}
                        onClick={handleOpenPayment}
                        disabled={canceling}
                    >
                        Перейти к оплате
                    </button>
                )}
                {!isPayingOut && !isPayoutStuck && onCancel && (
                    <button
                        className={style['buttonSecondary']}
                        onClick={handleCancel}
                        disabled={canceling}
                    >
                        {canceling ? 'Отменяем…' : 'Отменить оплату'}
                    </button>
                )}
                {isPayingOut && (
                    <button
                        className={style['buttonSecondary']}
                        onClick={openSupport}
                    >
                        Связаться с менеджером
                    </button>
                )}
                {cancelError ? <p className={style['cancelError']}>{cancelError}</p> : null}
            </div>
        </div>
    );
};

export default PaymentWaiting;
