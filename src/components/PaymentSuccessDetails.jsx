import React from 'react';
import style from './PaymentSuccessDetails.module.scss';
import AnimatedGradientBackground from './AnimatedGradientBackground';
import { openSupport } from './supportLink';

const PaymentSuccessDetails = ({
    orderData,
    extraRows = [],
    onClose,
    title = 'Оплата успешна!',
    statusText = 'Оплачено',
    message = 'Спасибо за ваш заказ. Менеджер скоро свяжется с вами.',
    showSupport = true,
}) => {
    return (
        <div className={style['container']}>
            <AnimatedGradientBackground />
            <div className={style['card']}>
                <div className={style['icon']}>
                    <svg width="80" height="80" viewBox="0 0 80 80" fill="none">
                        <circle cx="40" cy="40" r="40" fill="#4CAF50"/>
                        <path d="M25 40L35 50L55 30" stroke="white" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
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
                            <span className={style['orderDetailValue']}>{statusText}</span>
                        </div>
                    </div>
                )}

                <p className={style['message']}>{message}</p>
                <button
                    className={style['button']}
                    onClick={onClose}
                >
                    Вернуться в каталог
                </button>
                {showSupport && (
                    <button
                        className={style['buttonSecondary']}
                        onClick={openSupport}
                    >
                        Связаться с менеджером
                    </button>
                )}
            </div>
        </div>
    );
};

export default PaymentSuccessDetails;
