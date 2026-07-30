import React from 'react';
import style from './PaymentSuccessDetails.module.scss';
import AnimatedGradientBackground from './AnimatedGradientBackground';

const PaymentSuccessDetails = ({ orderData, extraRows = [], onClose }) => {
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
                <h1 className={style['title']}>Оплата успешна!</h1>

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
                            <span className={style['orderDetailValue']}>Оплачено</span>
                        </div>
                    </div>
                )}

                <p className={style['message']}>
                    Спасибо за ваш заказ. Менеджер скоро свяжется с вами.
                </p>
                <button
                    className={style['button']}
                    onClick={onClose}
                >
                    Вернуться в каталог
                </button>
            </div>
        </div>
    );
};

export default PaymentSuccessDetails;
