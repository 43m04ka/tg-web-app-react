import React from 'react';
import { useLocation } from 'react-router-dom';
import style from './PaymentSuccess.module.scss';
import AnimatedGradientBackground from '../../components/AnimatedGradientBackground';

const PaymentSuccess = () => {
    const location = useLocation();
    const invoiceId = new URLSearchParams(location.search).get('invoice_id');

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
                <h1 className={style['title']}>Оплата прошла успешно</h1>
                {invoiceId && <p className={style['invoiceId']}>Номер платежа: {invoiceId}</p>}
                
                {/* Страница открывается платёжкой в отдельной вкладке/окне, а заказ
                    оформлялся в другом месте (вкладка браузера или мини-приложение в
                    Telegram). Переход внутрь приложения отсюда вёл на выбор платформы,
                    поэтому просто говорим нейтральными словами, подходящими обоим случаям. */}
                <p className={style['message']}>
                    Эту страницу можно закрыть и вернуться туда, где вы оформляли заказ.
                </p>
            </div>
        </div>
    );
};

export default PaymentSuccess;
