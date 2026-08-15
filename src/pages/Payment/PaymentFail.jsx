import React from 'react';
import { useLocation } from 'react-router-dom';
import style from './PaymentFail.module.scss';
import AnimatedGradientBackground from '../../components/AnimatedGradientBackground';

const PaymentFail = () => {
    const location = useLocation();
    const invoiceId = new URLSearchParams(location.search).get('invoice_id');

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
                <h1 className={style['title']}>Оплата не удалась</h1>
                {invoiceId && <p className={style['invoiceId']}>Номер платежа: {invoiceId}</p>}
                
                {/* см. PaymentSuccess: возврат внутрь приложения отсюда вёл на выбор
                    платформы, поэтому даём нейтральную формулировку — она одинаково
                    подходит и для браузера, и для мини-приложения в Telegram */}
                <p className={style['message']}>
                    Эту страницу можно закрыть и вернуться туда, где вы оформляли заказ,
                    чтобы попробовать оплатить ещё раз.
                </p>
            </div>
        </div>
    );
};

export default PaymentFail;
