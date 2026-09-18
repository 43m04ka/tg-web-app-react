import React, {useCallback, useState} from 'react';
import {shortPlatform} from '../../../pages/Main/catalogSections';
import {money, rupees} from '../../../pages/Basket/cartModel';
import Cover from '../../ui/Cover';
import Spinner from '../../ui/Spinner';
import style from './CheckoutStates.module.scss';

function PurchasedItems({snapshot}) {
    const items = snapshot?.items || [];
    if (!items.length) return null;

    const topup = (snapshot.positions || []).find((position) => position.priceRs);

    return (
        <div className={style.bought}>
            <span className={style.boughtTitle}>Что вы купили</span>

            <div className={style.boughtList}>
                {items.map((item, index) => {
                    const meta = [
                        shortPlatform(item.platform),
                        item.typeLabel,
                        item.count > 1 ? `${item.count} шт.` : null
                    ].filter(Boolean).join(' · ');

                    return (
                        <div key={item.id} className={style.boughtRow} style={{'--i': index}}>
                            <Cover src={item.image} className={style.boughtCover}/>

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

function Stage({tone, icon, title, text, children}) {
    return (
        <div className={style.stage}>
            <div className={`${style.icon} ${style[tone]}`} aria-hidden="true">{icon}</div>
            <h1 className={style.title}>{title}</h1>
            <p className={style.text}>{text}</p>
            {children}
        </div>
    );
}

function Rows({rows}) {
    return (
        <div className={style.rows}>
            {rows.filter(Boolean).map((row, index) => (
                <div key={row.label} className={style.row} style={{'--i': index}}>
                    <span className={style.rowLabel}>{row.label}</span>
                    <span className={style.rowValue}>{row.value}</span>
                </div>
            ))}
        </div>
    );
}

export function DesktopWaiting({order, onOpenAgain, onCancel}) {
    const [error, setError] = useState('');
    const [isCanceling, setCanceling] = useState(false);

    const cancel = useCallback(async () => {
        if (isCanceling) return;

        setCanceling(true);
        const message = await onCancel();
        if (message) setError(message);
        setCanceling(false);
    }, [isCanceling, onCancel]);

    return (
        <Stage
            tone="waiting"
            icon={<Spinner className={style.iconSpinner}/>}
            title="Ждём оплату"
            text="Окно оплаты открылось в отдельной вкладке. Как только банк подтвердит перевод, статус обновится сам — эту страницу закрывать не нужно."
        >
            <Rows rows={[
                {label: 'Заказ', value: `№${order?.orderId}`},
                {label: 'К оплате', value: money(order?.total)}
            ]}/>

            {error ? <p className={style.error}>{error}</p> : null}

            <div className={style.actions}>
                {order?.paymentUrl ? (
                    <button type="button" className={style.primary} onClick={onOpenAgain}>
                        Открыть оплату снова
                    </button>
                ) : null}

                <button type="button" className={style.secondary} disabled={isCanceling} onClick={cancel}>
                    {isCanceling ? <Spinner/> : null}
                    {isCanceling ? 'Отменяем…' : 'Отменить оплату'}
                </button>
            </div>
        </Stage>
    );
}

export function DesktopSuccess({order, snapshot, onClose}) {
    return (
        <Stage
            tone="success"
            icon="✓"
            title="Оплачено"
            text="Спасибо! Заказ передан менеджеру — он свяжется с вами и выдаст покупку."
        >
            <Rows rows={[
                {label: 'Заказ', value: `№${snapshot?.orderId ?? order?.orderId}`},
                {label: 'Сумма', value: money(snapshot?.total ?? order?.total)}
            ]}/>

            <PurchasedItems snapshot={snapshot}/>

            <div className={style.actions}>
                <button type="button" className={style.primary} onClick={onClose}>Вернуться в каталог</button>
            </div>
        </Stage>
    );
}

export function DesktopFail({order, onRetry, onClose}) {
    return (
        <Stage
            tone="fail"
            icon="!"
            title="Счёт не оплачен"
            text="Срок действия счёта истёк, деньги не списались. Можно собрать заказ заново или выбрать другой способ оплаты."
        >
            <Rows rows={[{label: 'Заказ', value: `№${order?.orderId}`}]}/>

            <div className={style.actions}>
                <button type="button" className={style.primary} onClick={onRetry}>Оформить заново</button>
                <button type="button" className={style.secondary} onClick={onClose}>В каталог</button>
            </div>
        </Stage>
    );
}

export function DesktopAccepted({order, snapshot, onClose}) {
    return (
        <Stage
            tone="accepted"
            icon="✓"
            title="Заказ принят"
            text="Менеджер свяжется с вами и пришлёт реквизиты для оплаты. Платить прямо сейчас не нужно."
        >
            <Rows rows={[
                {label: 'Заказ', value: `№${order?.orderId}`},
                {label: 'Сумма', value: money(snapshot?.total ?? order?.total)}
            ]}/>

            <PurchasedItems snapshot={snapshot}/>

            <div className={style.actions}>
                <button type="button" className={style.primary} onClick={onClose}>Вернуться в каталог</button>
            </div>
        </Stage>
    );
}
