import React, {useCallback, useState} from 'react';
import {hapticImpact} from '../../shared/lib/haptic';
import {getTelegramObject} from '../../shared/lib/telegram';
import {money} from '../Basket/cartModel';
import {supportUrlForBot} from '../More/moreMenu';
import style from './Services.module.scss';

function Rows({order, status, tone}) {
    return (
        <div className={style.stateRows}>
            <div className={style.stateRow}>
                <span>Заказ №</span>
                <span className={style.stateValue}>{order?.orderId}</span>
            </div>

            {order?.title ? (
                <div className={style.stateRow}>
                    <span>Товар</span>
                    <span className={style.stateValue}>{order.title}</span>
                </div>
            ) : null}

            {order?.quantity > 1 ? (
                <div className={style.stateRow}>
                    <span>Количество</span>
                    <span className={style.stateValue}>{order.quantity} шт.</span>
                </div>
            ) : null}

            <div className={style.stateRow}>
                <span>Статус</span>
                <span className={`${style.stateValue} ${style[tone]}`}>{status}</span>
            </div>

            <div className={style.stateRow}>
                <span>Сумма</span>
                <span className={style.stateValue}>{money(order?.total)}</span>
            </div>
        </div>
    );
}

function Shell({children}) {
    return (
        <div className={style.stateScreen}>
            <div className={style.stateCard}>{children}</div>
        </div>
    );
}

function ManagerButton({botType, label = 'Связаться с менеджером'}) {
    const url = supportUrlForBot(botType);

    const open = useCallback(() => {
        if (!url) return;

        hapticImpact('light');

        const tg = getTelegramObject();
        if (typeof tg.openLink === 'function') tg.openLink(url);
        else window.open(url, '_blank', 'noopener');
    }, [url]);

    if (!url) return null;

    return (
        <button type="button" className={style.stateSecondary} onClick={open}>
            {label}
        </button>
    );
}

export function CodeWaiting({order, onOpenAgain, onCancel}) {
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
        <Shell>
            <div className={style.spinner} aria-hidden="true"/>
            <h1 className={style.stateTitle}>Ждём оплату</h1>

            <Rows order={order} status="Ожидает оплаты" tone="toneWaiting"/>

            <div className={style.stateText}>
                <span className={style.stateLead}>
                    Окно оплаты открылось в отдельной вкладке — эту страницу закрывать не нужно
                </span>
                <span className={style.stateNote}>
                    {order?.manual
                        ? 'Как только оплата пройдёт, менеджер возьмёт заказ в работу'
                        : 'Код зарезервирован за вами, пока счёт активен'}
                </span>
            </div>

            {error ? <p className={style.stateError}>{error}</p> : null}

            <div className={style.stateActions}>
                {order?.paymentUrl ? (
                    <button type="button" className={style.statePrimary} onClick={onOpenAgain}>
                        Открыть оплату снова
                    </button>
                ) : null}

                <button type="button" className={style.stateSecondary} disabled={isCanceling} onClick={cancel}>
                    {isCanceling ? 'Отменяем…' : 'Отменить оплату'}
                </button>
            </div>
        </Shell>
    );
}

export function CodeDone({order, botType, onClose}) {
    return (
        <Shell>
            <div className={`${style.stateIcon} ${style.stateIconDone}`} aria-hidden="true">✓</div>
            <h1 className={style.stateTitle}>{order?.manual ? 'Заказ оплачен!' : 'Код отправлен!'}</h1>

            <Rows
                order={order}
                status={order?.manual ? 'Оплачено, оформляем' : 'Оплачено, код выдан'}
                tone="toneDone"
            />

            <div className={style.stateText}>
                {order?.manual ? (
                    <>
                        <span className={style.stateLead}>
                            Менеджер уже получил заказ и напишет вам в этот же чат
                        </span>
                        <span className={style.stateNote}>
                            Подписку оформляют вручную — обычно это занимает до часа в рабочее время
                        </span>
                    </>
                ) : (
                    <>
                        <span className={style.stateLead}>
                            {order?.quantity > 1 ? 'Коды пришли' : 'Код пришёл'} отдельным сообщением в этот же чат
                        </span>
                        <span className={style.stateNote}>
                            {order?.quantity > 1 ? 'Коды одноразовые' : 'Код одноразовый'} — сохраните
                            {order?.quantity > 1 ? ' их' : ' его'}, повторно мы не выдадим
                        </span>
                    </>
                )}
            </div>

            <div className={style.stateActions}>
                <button type="button" className={style.statePrimary} onClick={onClose}>
                    Купить ещё
                </button>
                <ManagerButton botType={botType}/>
            </div>
        </Shell>
    );
}

export function CodeFail({order, onRetry, onClose}) {
    return (
        <Shell>
            <div className={`${style.stateIcon} ${style.stateIconFail}`} aria-hidden="true">!</div>
            <h1 className={style.stateTitle}>Счёт не оплачен</h1>

            <Rows order={order} status="Оплата не прошла" tone="toneFail"/>

            <div className={style.stateText}>
                <span className={style.stateLead}>
                    Срок действия счёта истёк, деньги не списались
                </span>
                <span className={style.stateNote}>
                    Код вернулся в продажу — оформите заказ заново
                </span>
            </div>

            <div className={style.stateActions}>
                <button type="button" className={style.statePrimary} onClick={onRetry}>
                    Попробовать снова
                </button>
                <button type="button" className={style.stateSecondary} onClick={onClose}>
                    На главную
                </button>
            </div>
        </Shell>
    );
}

export function CodeStalled({order, botType, onClose}) {
    return (
        <Shell>
            <div className={`${style.stateIcon} ${style.stateIconFail}`} aria-hidden="true">!</div>
            <h1 className={style.stateTitle}>Статус пока не пришёл</h1>

            <Rows order={order} status="Требует проверки" tone="toneFail"/>

            <div className={style.stateText}>
                <span className={style.stateLead}>
                    Мы долго не получаем ответ от кассы по этому счёту
                </span>
                <span className={style.stateNote}>
                    Если деньги списались, напишите менеджеру — он оформит заказ вручную
                </span>
            </div>

            <div className={style.stateActions}>
                <ManagerButton botType={botType} label="Написать администратору"/>
                <button type="button" className={style.stateSecondary} onClick={onClose}>
                    Вернуться к покупке
                </button>
            </div>
        </Shell>
    );
}
