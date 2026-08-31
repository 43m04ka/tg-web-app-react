import React, {useCallback, useState} from 'react';
import {hapticImpact} from '../../shared/lib/haptic';
import {shortPlatform} from '../Main/catalogSections';
import {money, rupees} from './cartModel';
import style from './Basket.module.scss';

function PurchasedItems({snapshot}) {
    const items = snapshot?.items || [];
    if (!items.length) return null;

    const topup = (snapshot.positions || []).find((position) => position.priceRs);

    return (
        <div className={style.bought}>
            <span className={style.boughtTitle}>Что вы купили</span>

            <div className={style.boughtList}>
                {items.map((item) => {
                    const meta = [
                        shortPlatform(item.platform),
                        item.typeLabel,
                        item.count > 1 ? `${item.count} шт.` : null
                    ].filter(Boolean).join(' · ');

                    return (
                        <div key={item.id} className={style.boughtRow}>
                            <span
                                className={style.boughtCover}
                                style={item.image ? {backgroundImage: `url(${item.image})`} : undefined}
                                aria-hidden="true"
                            />

                            <span className={style.boughtBody}>
                                <span className={style.boughtName}>{item.name}</span>
                                {meta ? <span className={style.boughtMeta}>{meta}</span> : null}
                            </span>

                            {item.sum > 0 ? <span className={style.boughtSum}>{money(item.sum)}</span> : null}
                        </div>
                    );
                })}
            </div>

            {topup ? (
                <span className={style.boughtNote}>
                    Оплачено пополнением баланса PSN на {rupees(topup.priceRs)} — менеджер зачислит его
                    на аккаунт и оформит покупки из списка.
                </span>
            ) : null}

            {snapshot.discount > 0 ? (
                <div className={style.boughtTotals}>
                    <div className={style.boughtTotalRow}>
                        <span>Товары</span>
                        <span>{money(snapshot.itemsTotal)}</span>
                    </div>

                    <div className={style.boughtTotalRow}>
                        <span>{snapshot.promo?.name ? `Промокод ${snapshot.promo.name}` : 'Скидка'}</span>
                        <span className={style.boughtDiscount}>−{money(snapshot.discount)}</span>
                    </div>
                </div>
            ) : null}
        </div>
    );
}

function Shell({tone, icon, title, text, children}) {
    return (
        <div className={style.stateScreen}>
            <div className={`${style.stateIcon} ${style[tone]}`} aria-hidden="true">{icon}</div>
            <h1 className={style.stateTitle}>{title}</h1>
            <p className={style.stateText}>{text}</p>
            {children}
        </div>
    );
}

export function PaymentWaiting({order, onOpenAgain, onCancel}) {
    const [error, setError] = useState('');
    const [isCanceling, setCanceling] = useState(false);

    const cancel = useCallback(async () => {
        if (isCanceling) return;

        hapticImpact('light');
        setCanceling(true);

        const message = await onCancel();
        if (message) setError(message);

        setCanceling(false);
    }, [isCanceling, onCancel]);

    return (
        <Shell
            tone="stateWaiting"
            icon={<span className={style.spinner}/>}
            title="Ждём оплату"
            text="Окно оплаты открылось в отдельной вкладке. Как только банк подтвердит перевод, статус обновится сам — эту страницу закрывать не нужно."
        >
            <div className={style.stateRows}>
                <div className={style.stateRow}>
                    <span>Заказ</span>
                    <span className={style.stateValue}>№{order?.orderId}</span>
                </div>
                <div className={style.stateRow}>
                    <span>К оплате</span>
                    <span className={style.stateValue}>{money(order?.total)}</span>
                </div>
            </div>

            {error ? <p className={style.stateError}>{error}</p> : null}

            <div className={style.stateActions}>
                {order?.paymentUrl ? (
                    <button type="button" className={style.primary} onClick={onOpenAgain}>
                        Открыть оплату снова
                    </button>
                ) : null}

                <button type="button" className={style.secondary} disabled={isCanceling} onClick={cancel}>
                    {isCanceling ? 'Отменяем…' : 'Отменить оплату'}
                </button>
            </div>
        </Shell>
    );
}

export function PaymentSuccess({order, snapshot, onClose}) {
    return (
        <Shell
            tone="stateSuccess"
            icon="✓"
            title="Оплачено"
            text="Спасибо! Заказ передан менеджеру — он свяжется с вами и выдаст покупку."
        >
            <div className={style.stateRows}>
                <div className={style.stateRow}>
                    <span>Заказ</span>
                    <span className={style.stateValue}>№{snapshot?.orderId ?? order?.orderId}</span>
                </div>
                <div className={style.stateRow}>
                    <span>Сумма</span>
                    <span className={style.stateValue}>{money(snapshot?.total ?? order?.total)}</span>
                </div>
            </div>

            <PurchasedItems snapshot={snapshot}/>

            <div className={style.stateActions}>
                <button type="button" className={style.primary} onClick={onClose}>Вернуться в каталог</button>
            </div>
        </Shell>
    );
}

export function PaymentFail({order, onRetry, onClose}) {
    return (
        <Shell
            tone="stateFail"
            icon="!"
            title="Счёт не оплачен"
            text="Срок действия счёта истёк, деньги не списались. Можно собрать заказ заново или выбрать другой способ оплаты."
        >
            <div className={style.stateRows}>
                <div className={style.stateRow}>
                    <span>Заказ</span>
                    <span className={style.stateValue}>№{order?.orderId}</span>
                </div>
            </div>

            <div className={style.stateActions}>
                <button type="button" className={style.primary} onClick={onRetry}>Оформить заново</button>
                <button type="button" className={style.secondary} onClick={onClose}>В каталог</button>
            </div>
        </Shell>
    );
}

export function OrderAccepted({order, snapshot, onClose}) {
    return (
        <Shell
            tone="stateAccepted"
            icon="✓"
            title="Заказ принят"
            text="Менеджер свяжется с вами и пришлёт реквизиты для оплаты. Платить прямо сейчас не нужно."
        >
            <div className={style.stateRows}>
                <div className={style.stateRow}>
                    <span>Заказ</span>
                    <span className={style.stateValue}>№{order?.orderId}</span>
                </div>
                <div className={style.stateRow}>
                    <span>Сумма</span>
                    <span className={style.stateValue}>{money(snapshot?.total ?? order?.total)}</span>
                </div>
            </div>

            <PurchasedItems snapshot={snapshot}/>

            <div className={style.stateActions}>
                <button type="button" className={style.primary} onClick={onClose}>Вернуться в каталог</button>
            </div>
        </Shell>
    );
}
