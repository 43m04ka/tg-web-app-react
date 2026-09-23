import React, {useCallback, useState} from 'react';
import {useAppInsets} from '../../shared/hooks/useAppInsets';
import {hapticImpact, hapticSelection} from '../../shared/lib/haptic';
import {isEmailValid} from '../Basket/cartModel';
import {amountError, cleanAmount, formatMoney, isAmountValid, MIN_AMOUNT, parseAmount} from './payModel';
import {SCREEN, usePayFlow} from './usePayFlow';
import steam from '../Steam/Steam.module.scss';
import style from './Pay.module.scss';

function Rows({payment, status, tone}) {
    return (
        <div className={steam.stateRows}>
            <div className={steam.stateRow}>
                <span>Платёж №</span>
                <span className={steam.stateValue}>{payment?.id}</span>
            </div>

            <div className={steam.stateRow}>
                <span>Сумма</span>
                <span className={steam.stateValue}>{formatMoney(payment?.amount)}</span>
            </div>

            {payment?.email ? (
                <div className={steam.stateRow}>
                    <span>Чек на почту</span>
                    <span className={steam.stateValue}>{payment.email}</span>
                </div>
            ) : null}

            <div className={steam.stateRow}>
                <span>Статус</span>
                <span className={`${steam.stateValue} ${steam[tone]}`}>{status}</span>
            </div>
        </div>
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
                <h1 className={steam.stateTitle}>Ждём оплату</h1>

                <Rows payment={flow.payment} status="Ожидает оплаты" tone="toneWaiting"/>

                <div className={steam.stateText}>
                    <span className={steam.stateLead}>Статус обновится сам, как только банк подтвердит перевод</span>
                    <span className={steam.stateNote}>Если окно оплаты закрылось, откройте его снова</span>
                </div>

                <div className={steam.stateActions}>
                    {flow.payment?.paymentUrl ? (
                        <button type="button" className={steam.statePrimary} onClick={flow.openAgain}>
                            Открыть оплату снова
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
                    <span className={steam.stateLead}>Спасибо! Чек придёт на указанную почту</span>
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
                <h1 className={steam.title}>Оплата <span className={style.brand}>Геймворд</span></h1>
            </div>

            <div
                className={steam.content}
                style={{paddingBottom: `calc(${safeAreaInset.bottom}px + 20 * var(--u))`}}
            >
                <p className={style.lead}>Игровой дискаунтер</p>

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

                <section className={`${steam.block} ${steam.amountBlock}`}>
                    <h2 className={steam.blockTitle}>Сумма из заказа</h2>

                    <div className={`${steam.amountField} ${isTouched && !isAmountReady ? steam.amountFieldBad : ''}`}>
                        <input
                            className={steam.amountInput}
                            value={amountText}
                            inputMode="decimal"
                            placeholder={`от ${MIN_AMOUNT} ₽`}
                            onChange={(event) => setAmountText(cleanAmount(event.target.value))}
                        />
                        <span className={steam.amountCurrency} aria-hidden="true">₽</span>
                    </div>

                    <span className={steam.blockNote}>Впишите сумму точно как в заказе</span>
                </section>

                <div className={steam.summary}>
                    <div className={steam.summaryRow}>
                        <span className={steam.summaryTotalLabel}>К оплате</span>
                        <span key={amountText} className={steam.summaryTotal}>
                            {isAmountReady ? formatMoney(parseAmount(amountText)) : '—'}
                        </span>
                    </div>
                </div>

                {isEmailReady ? (
                    <div className={steam.receipt}>
                        <span className={steam.receiptIcon} aria-hidden="true">✉</span>

                        <span className={steam.receiptBody}>
                            <span className={steam.receiptTitle}>Чек придёт на почту</span>
                            <span className={steam.receiptValue}>{email.trim()}</span>
                        </span>
                    </div>
                ) : null}

                <label className={`${style.agree} ${isTouched && !isAgreed ? style.agreeBad : ''}`}>
                    <input
                        type="checkbox"
                        className={style.agreeInput}
                        checked={isAgreed}
                        onChange={(event) => {
                            hapticSelection();
                            setAgreed(event.target.checked);
                        }}
                    />
                    <span className={style.agreeBox} aria-hidden="true">✓</span>
                    <span className={style.agreeText}>
                        Подтверждаю, что ознакомлен и согласен с условиями покупки в сервисе Геймворд
                    </span>
                </label>
            </div>

            <div className={steam.actionBar}>
                {blockReason ? <p className={steam.actionError}>{blockReason}</p> : null}
                {flow.error ? <p className={steam.actionError}>{flow.error}</p> : null}

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
            </div>
        </div>
    );
}
