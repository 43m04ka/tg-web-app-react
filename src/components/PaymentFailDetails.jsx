import React from 'react';
import style from './PaymentFailDetails.module.scss';
import AnimatedGradientBackground from './AnimatedGradientBackground';

const PaymentFailDetails = ({ orderData, extraRows = [], onClose, onRetry }) => {
    return (
        <div className={style['container']}>
            <AnimatedGradientBackground />
            <div className={style['card']}>
                <div className={style['icon']}>
                    <svg width="80" height="80" viewBox="0 0 80 80" fill="none">
                        <circle cx="40" cy="40" r="40" fill="#F44336"/>
                        <path d="M28 28L52 52M52 28L28 52" stroke="white" strokeWidth="4" strokeLinecap="round"/>
                    </svg>
                </div>
                <h1 className={style['title']}>Оплата не прошла</h1>

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
                            <span className={style['orderDetailValue']} style={{color: '#F44336'}}>Ссылка на оплату истекла</span>
                        </div>
                    </div>
                )}

                <p className={style['message']}>
                    Ссылка на оплату действует 15 минут и истекла без оплаты.
                </p>
                <p className={style['subMessage']}>
                    С вами свяжется менеджер, либо вы можете оформить заказ заново.
                </p>
                <button
                    className={style['button']}
                    onClick={onRetry}
                >
                    Попробовать снова
                </button>
                <button
                    className={style['buttonSecondary']}
                    onClick={() => window.open('https://t.me/gwstore_admin')}
                >
                    Связаться с поддержкой
                </button>
            </div>
        </div>
    );
};

export default PaymentFailDetails;
