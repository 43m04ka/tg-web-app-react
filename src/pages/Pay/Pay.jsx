import React, {useCallback, useRef, useState} from 'react';
import {useAppInsets} from '../../shared/hooks/useAppInsets';
import {hapticImpact, hapticSelection} from '../../shared/lib/haptic';
import {isEmailValid} from '../Basket/cartModel';
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
} from './payModel';
import {SCREEN, usePayFlow} from './usePayFlow';
import LegalNote from '../../shared/ui/LegalNote/LegalNote';
import VpnGate, {usePaymentNetwork} from '../../shared/ui/VpnGate/VpnGate';
import steam from '../Steam/Steam.module.scss';
import style from './Pay.module.scss';

function Rows({payment, status, tone}) {
    return (
        <div className={steam.stateRows}>
            <div className={steam.stateRow}>
                <span>№ платежа</span>
                <span className={steam.stateValue}>{payment?.id}</span>
            </div>

            <div className={steam.stateRow}>
                <span>Сумма заказа</span>
                <span className={steam.stateValue}>{formatMoney(payment?.amount)}</span>
            </div>

            {payment?.email ? (
                <div className={steam.stateRow}>
                    <span>Почта для чека</span>
                    <span className={steam.stateValue}>{payment.email}</span>
                </div>
            ) : null}

            <div className={steam.stateRow}>
                <span>Статус платежа</span>
                <span className={`${steam.stateValue} ${steam[tone]}`}>{status}</span>
            </div>
        </div>
    );
}

function PasteIcon() {
    return (
        <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
            <rect x="5" y="4.5" width="14" height="16.5" rx="3" stroke="currentColor" strokeWidth="1.8"/>
            <path d="M9 4.5V4a1.5 1.5 0 0 1 1.5-1.5h3A1.5 1.5 0 0 1 15 4v.5" stroke="currentColor" strokeWidth="1.8"/>
            <path d="M9 11h6M9 15h4" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/>
        </svg>
    );
}

function Shell({children}) {
    return (
        <div className={steam.stateScreen}>
            <div className={steam.stateCard}>{children}</div>
        </div>
    );
}

export default function Pay() {
    const {contentSafeAreaInset, safeAreaInset} = useAppInsets();
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

        hapticSelection();
        setAmountText(value);
    }, []);

    const submit = useCallback(() => {
        setTouched(true);

        if (!isReady || flow.isSending) return;

        hapticImpact('medium');
        flow.submit({email: email.trim(), amount: parseAmount(amountText)});
    }, [isReady, flow, email, amountText]);

    if (flow.screen === SCREEN.WAITING) {
        return (
            <Shell>
                <div className={steam.spinner} aria-hidden="true"/>
                <h1 className={steam.stateTitle}>Ожидаем оплату</h1>

                <Rows payment={flow.payment} status="Ожидает оплаты" tone="toneWaiting"/>

                <div className={steam.stateText}>
                    <span className={steam.stateLead}>Статус платежа изменится автоматически после подтверждения оплаты банком</span>
                    <span className={steam.stateNote}>Если случайно закрыли окно оплаты, его можно открыть по кнопке ниже</span>
                </div>

                <div className={steam.stateActions}>
                    {flow.payment?.paymentUrl ? (
                        <button type="button" className={steam.statePrimary} onClick={flow.openAgain}>
                            Открыть окно оплаты
                        </button>
                    ) : null}

                    <button type="button" className={steam.stateSecondary} onClick={flow.close}>
                        Новый платёж
                    </button>
                </div>
            </Shell>
        );
    }

    if (flow.screen === SCREEN.DONE) {
        return (
            <Shell>
                <div className={`${steam.stateIcon} ${steam.stateIconDone}`} aria-hidden="true">✓</div>
                <h1 className={steam.stateTitle}>Оплата прошла!</h1>

                <Rows payment={flow.payment} status="Оплачено" tone="toneDone"/>

                <div className={steam.stateText}>
                    <span className={steam.stateLead}>Благодарим за платеж! Менеджер уже оформляет Ваш заказ.</span>
                </div>

                <div className={steam.stateActions}>
                    <button type="button" className={steam.statePrimary} onClick={flow.close}>
                        Готово
                    </button>
                </div>
            </Shell>
        );
    }

    if (flow.screen === SCREEN.FAIL) {
        return (
            <Shell>
                <div className={`${steam.stateIcon} ${steam.stateIconFail}`} aria-hidden="true">!</div>
                <h1 className={steam.stateTitle}>Счёт не оплачен</h1>

                <Rows payment={flow.payment} status="Оплата не прошла" tone="toneFail"/>

                <div className={steam.stateText}>
                    <span className={steam.stateLead}>Срок действия счёта истёк, деньги не списались</span>
                </div>

                <div className={steam.stateActions}>
                    <button type="button" className={steam.statePrimary} onClick={flow.close}>
                        Попробовать снова
                    </button>
                </div>
            </Shell>
        );
    }

    return (
        <div className={steam.screen}>
            <div
                className={steam.header}
                style={{paddingTop: `calc(${contentSafeAreaInset.top}px + 14 * var(--u))`}}
            >
                <h1 className={steam.title}>Оплата заказа в магазине <span className={style.brand}>Геймворд.рф</span></h1>
            </div>

            <div
                className={steam.content}
                style={{paddingBottom: `calc(${safeAreaInset.bottom}px + 20 * var(--u))`}}
            >
                <section className={steam.block}>
                    <h2 className={steam.blockTitle}>E-mail для чека</h2>

                    <input
                        className={`${steam.input} ${isTouched && !isEmailReady ? steam.inputBad : ''}`}
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
                        {PAY_INFO.map((text) => (
                            <p key={text} className={`${steam.faqItem} ${style.info}`}>{text}</p>
                        ))}
                    </div>
                </section>
            </div>

            <div className={steam.actionBar}>
                {blockReason ? <p className={steam.actionError}>{blockReason}</p> : null}
                {flow.error ? <p className={steam.actionError}>{flow.error}</p> : null}

                <VpnGate network={network}/>

                <button
                    type="button"
                    className={steam.primary}
                    disabled={flow.isSending}
                    onClick={submit}
                >
                    {flow.isSending
                        ? 'Создаём счёт…'
                        : isAmountReady ? `Оплатить ${formatMoney(parseAmount(amountText))}` : 'Перейти к оплате'}
                </button>

                <LegalNote className={steam.legal} action={isAmountReady ? 'Оплатить' : 'Перейти к оплате'}/>
            </div>
        </div>
    );
}
