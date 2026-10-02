import React, {useCallback, useRef, useState} from 'react';
import {isEmailValid} from '../../../pages/Basket/cartModel';
import {
    amountError,
    canPasteAmount,
    cleanAmount,
    formatMoney,
    isAmountValid,
    PAY_INFO,
    parseAmount,
    payBlockReason,
    readClipboardAmount
} from '../../../pages/Pay/payModel';
import {SCREEN, usePayFlow} from '../../../pages/Pay/usePayFlow';
import Spinner from '../../ui/Spinner';
import StatusStage, {StatusActions, StatusRows, statusStyle} from '../../ui/StatusStage';
import LegalNote from '../../../shared/ui/LegalNote/LegalNote';
import VpnGate, {usePaymentNetwork} from '../../../shared/ui/VpnGate/VpnGate';
import steam from '../Steam/DesktopSteam.module.scss';
import style from './DesktopPay.module.scss';

const rowsOf = (payment, status, tone) => [
    {label: '№ платежа', value: payment?.id},
    {label: 'Сумма заказа', value: formatMoney(payment?.amount)},
    payment?.email ? {label: 'Почта для чека', value: payment.email} : null,
    {label: 'Статус платежа', value: status, tone}
];

function PasteIcon() {
    return (
        <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
            <rect x="5" y="4.5" width="14" height="16.5" rx="3" stroke="currentColor" strokeWidth="1.8"/>
            <path d="M9 4.5V4a1.5 1.5 0 0 1 1.5-1.5h3A1.5 1.5 0 0 1 15 4v.5" stroke="currentColor" strokeWidth="1.8"/>
            <path d="M9 11h6M9 15h4" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/>
        </svg>
    );
}

export default function DesktopPay() {
    const flow = usePayFlow();

    const [email, setEmail] = useState('');
    const [amountText, setAmountText] = useState('');
    const [isTouched, setTouched] = useState(false);

    const isEmailReady = isEmailValid(email);
    const isAmountReady = isAmountValid(amountText);
    const isReady = isEmailReady && isAmountReady;

    const blockReason = !isTouched || isReady ? null : payBlockReason(isEmailReady, amountText);

    const network = usePaymentNetwork();

    const amountRef = useRef(null);

    const pasteAmount = useCallback(async () => {
        const value = await readClipboardAmount();

        if (!value) {
            amountRef.current?.focus();
            return;
        }

        setAmountText(value);
    }, []);

    const submit = useCallback(() => {
        setTouched(true);

        if (!isReady || flow.isSending) return;

        flow.submit({email: email.trim(), amount: parseAmount(amountText)});
    }, [isReady, flow, email, amountText]);

    if (flow.screen === SCREEN.WAITING) {
        return (
            <StatusStage
                tone="waiting"
                icon={<Spinner className={statusStyle.iconSpinner}/>}
                title="Ожидаем оплату"
                lead="Статус платежа изменится автоматически после подтверждения оплаты банком"
                note="Если случайно закрыли окно оплаты, его можно открыть по кнопке ниже"
            >
                <StatusRows rows={rowsOf(flow.payment, 'Ожидает оплаты', 'toneWaiting')}/>

                <StatusActions>
                    {flow.payment?.paymentUrl ? (
                        <button type="button" className={statusStyle.primary} onClick={flow.openAgain}>
                            Открыть окно оплаты
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
            <StatusStage tone="done" icon="✓" title="Оплата прошла!" lead="Благодарим за платеж! Менеджер уже оформляет Ваш заказ.">
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
                    Оплата заказа в магазине <span className={style.brand}>Геймворд.рф</span>
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

                        <div className={style.field}>
                            <input
                                ref={amountRef}
                                className={`${steam.input} ${style.fieldInput} ${isTouched && !isAmountReady ? steam.inputBad : ''}`}
                                value={amountText}
                                inputMode="decimal"
                                placeholder="Впишите сумму из заказа"
                                autoComplete="off"
                                onChange={(event) => setAmountText(cleanAmount(event.target.value))}
                            />

                            {canPasteAmount() ? (
                                <button type="button" className={style.paste} onClick={pasteAmount}>
                                    <PasteIcon/>
                                    Вставить
                                </button>
                            ) : null}
                        </div>

                        {isTouched && !isAmountReady ? (
                            <span className={`${steam.blockNote} ${steam.blockNoteBad}`}>{amountError(amountText)}</span>
                        ) : null}
                    </section>

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
                        disabled={flow.isSending}
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
