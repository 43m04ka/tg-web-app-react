import React, {useCallback, useState} from 'react';
import {isEmailValid} from '../../../pages/Basket/cartModel';
import {amountError, cleanAmount, formatMoney, isAmountValid, parseAmount} from '../../../pages/Pay/payModel';
import {SCREEN, usePayFlow} from '../../../pages/Pay/usePayFlow';
import Spinner from '../../ui/Spinner';
import StatusStage, {StatusActions, StatusRows, statusStyle} from '../../ui/StatusStage';
import LegalNote from '../../../shared/ui/LegalNote/LegalNote';
import VpnGate, {usePaymentNetwork} from '../../../shared/ui/VpnGate/VpnGate';
import steam from '../Steam/DesktopSteam.module.scss';
import style from './DesktopPay.module.scss';

const PAY_INFO = [
    'Это официальная оплата на расчетный счет ИП в Альфа Банк, а не перевод. Вы получите чек на электронную почту, которую укажете в форме оплаты.',
    'Если вписать сумму меньше и оплатить, заказ не будет считаться оплаченным.',
    'Оплачивая данный заказ Вы принимаете Пользовательское соглашение нашего сервиса.',
    'Обращаем внимание, что прием платежей в магазине Геймворд.рф осуществляется круглосуточно. Активация заказа происходит в рабочее время — с 10:00 до 22:00 по МСК ежедневно.'
];

const rowsOf = (payment, status, tone) => [
    {label: 'Платёж №', value: payment?.id},
    {label: 'Сумма', value: formatMoney(payment?.amount)},
    payment?.email ? {label: 'Чек на почту', value: payment.email} : null,
    {label: 'Статус', value: status, tone}
];

export default function DesktopPay() {
    const flow = usePayFlow();

    const [email, setEmail] = useState('');
    const [amountText, setAmountText] = useState('');
    const [isAgreed, setAgreed] = useState(false);
    const [isTouched, setTouched] = useState(false);

    const isEmailReady = isEmailValid(email);
    const isAmountReady = isAmountValid(amountText);
    const isReady = isEmailReady && isAmountReady && isAgreed;

    const blockReason = !isTouched || isReady
        ? null
        : !isEmailReady
            ? 'Укажите почту для чека'
            : !isAmountReady
                ? amountError(amountText)
                : 'Подтвердите согласие с условиями покупки';

    const network = usePaymentNetwork();

    const submit = useCallback(() => {
        setTouched(true);

        if (!isReady || flow.isSending || !network.isReady) return;

        flow.submit({email: email.trim(), amount: parseAmount(amountText)});
    }, [isReady, network.isReady, flow, email, amountText]);

    if (flow.screen === SCREEN.WAITING) {
        return (
            <StatusStage
                tone="waiting"
                icon={<Spinner className={statusStyle.iconSpinner}/>}
                title="Ждём оплату"
                lead="Статус обновится сам, как только банк подтвердит перевод"
                note="Если окно оплаты закрылось, откройте его снова"
            >
                <StatusRows rows={rowsOf(flow.payment, 'Ожидает оплаты', 'toneWaiting')}/>

                <StatusActions>
                    {flow.payment?.paymentUrl ? (
                        <button type="button" className={statusStyle.primary} onClick={flow.openAgain}>
                            Открыть оплату снова
                        </button>
                    ) : null}

                    <button type="button" className={statusStyle.secondary} onClick={flow.close}>
                        Новый платёж
                    </button>
                </StatusActions>
            </StatusStage>
        );
    }

    if (flow.screen === SCREEN.DONE) {
        return (
            <StatusStage tone="done" icon="✓" title="Оплата прошла!" lead="Спасибо! Чек придёт на указанную почту">
                <StatusRows rows={rowsOf(flow.payment, 'Оплачено', 'toneDone')}/>

                <StatusActions>
                    <button type="button" className={statusStyle.primary} onClick={flow.close}>
                        Готово
                    </button>
                </StatusActions>
            </StatusStage>
        );
    }

    if (flow.screen === SCREEN.FAIL) {
        return (
            <StatusStage tone="fail" icon="!" title="Счёт не оплачен" lead="Срок действия счёта истёк, деньги не списались">
                <StatusRows rows={rowsOf(flow.payment, 'Оплата не прошла', 'toneFail')}/>

                <StatusActions>
                    <button type="button" className={statusStyle.primary} onClick={flow.close}>
                        Попробовать снова
                    </button>
                </StatusActions>
            </StatusStage>
        );
    }

    return (
        <div className={steam.screen}>
            <header className={steam.head}>
                <h1 className={steam.title}>
                    Оплата <span className={style.brand}>Геймворд</span>
                </h1>
            </header>

            <div className={steam.body}>
                <div className={steam.main}>
                    <section className={steam.block}>
                        <h2 className={steam.blockTitle}>E-mail для чека</h2>

                        <input
                            className={isTouched && !isEmailReady ? `${steam.input} ${steam.inputBad}` : steam.input}
                            type="email"
                            value={email}
                            placeholder="mail@gwstore.ru"
                            autoComplete="email"
                            autoCapitalize="none"
                            onChange={(event) => setEmail(event.target.value)}
                        />

                        {isTouched && !isEmailReady ? (
                            <span className={`${steam.blockNote} ${steam.blockNoteBad}`}>Проверьте адрес почты</span>
                        ) : null}
                    </section>

                    <section className={steam.block}>
                        <h2 className={steam.blockTitle}>Сумма из заказа для оплаты</h2>

                        <input
                            className={isTouched && !isAmountReady ? `${steam.input} ${steam.inputBad}` : steam.input}
                            value={amountText}
                            inputMode="decimal"
                            placeholder="Впишите сумму из заказа"
                            autoComplete="off"
                            onChange={(event) => setAmountText(cleanAmount(event.target.value))}
                        />

                        {isTouched && !isAmountReady ? (
                            <span className={`${steam.blockNote} ${steam.blockNoteBad}`}>{amountError(amountText)}</span>
                        ) : null}
                    </section>

                    <button
                        type="button"
                        role="checkbox"
                        aria-checked={isAgreed}
                        className={isTouched && !isAgreed ? `${style.agree} ${style.agreeBad}` : style.agree}
                        onClick={() => setAgreed((value) => !value)}
                    >
                        <span className={isAgreed ? `${style.agreeBox} ${style.agreeBoxOn}` : style.agreeBox} aria-hidden="true">
                            <svg viewBox="0 0 16 16" fill="none">
                                <path d="M3.5 8.5L6.5 11.5L12.5 4.5" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"/>
                            </svg>
                        </span>
                        <span className={style.agreeText}>
                            Подтверждаю, что ознакомлен и согласен с условиями покупки в сервисе Геймворд
                        </span>
                    </button>

                    <section className={steam.block}>
                        <h2 className={steam.blockTitle}>Важная информация</h2>

                        <div className={steam.faq}>
                            {PAY_INFO.map((text, index) => (
                                <p key={text} className={`${steam.faqItem} ${style.info}`} style={{'--i': index}}>
                                    {text}
                                </p>
                            ))}
                        </div>
                    </section>
                </div>

                <aside className={steam.panel}>
                    <div className={steam.summaryRow}>
                        <span className={steam.finalLabel}>К оплате</span>
                        <span key={amountText} className={steam.finalValue}>
                            {isAmountReady ? formatMoney(parseAmount(amountText)) : '—'}
                        </span>
                    </div>

                    {blockReason ? <p className={steam.error}>{blockReason}</p> : null}
                    {flow.error ? <p className={steam.error}>{flow.error}</p> : null}

                    <VpnGate network={network}/>

                    <button
                        type="button"
                        className={steam.primary}
                        disabled={flow.isSending || !network.isReady}
                        onClick={submit}
                    >
                        {flow.isSending ? <Spinner/> : null}
                        {flow.isSending ? 'Создаём счёт…' : 'Перейти к оплате'}
                    </button>

                    <LegalNote className={steam.legal} action="Перейти к оплате"/>
                </aside>
            </div>
        </div>
    );
}
