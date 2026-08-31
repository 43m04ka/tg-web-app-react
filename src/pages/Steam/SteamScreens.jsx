import React, {useCallback, useState} from 'react';
import {hapticImpact} from '../../shared/lib/haptic';
import {getTelegramObject} from '../../shared/lib/telegram';
import {money} from '../Basket/cartModel';
import {supportUrlForBot} from '../More/moreMenu';
import style from './Steam.module.scss';

function Rows({order, status, tone}) {
    return (
        <div className={style.stateRows}>
            <div className={style.stateRow}>
                <span>Заказ №</span>
                <span className={style.stateValue}>{order?.orderId}</span>
            </div>

            <div className={style.stateRow}>
                <span>Сумма</span>
                <span className={style.stateValue}>{money(order?.total)}</span>
            </div>

            {order?.steamLogin ? (
                <div className={style.stateRow}>
                    <span>Steam аккаунт</span>
                    <span className={style.stateValue}>{order.steamLogin}</span>
                </div>
            ) : null}

            <div className={style.stateRow}>
                <span>Статус</span>
                <span className={`${style.stateValue} ${style[tone]}`}>{status}</span>
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

function ManagerButton({botType, label = 'Связаться с менеджером', variant = 'secondary'}) {
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
        <button
            type="button"
            className={variant === 'primary' ? style.stateDanger : style.stateSecondary}
            onClick={open}
        >
            {label}
        </button>
    );
}

export function SteamWaiting({order, onOpenAgain, onCancel}) {
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
                <span className={style.stateNote}>Статус обновится сам, как только банк подтвердит перевод</span>
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

export function SteamCrediting({order, botType}) {
    return (
        <Shell>
            <div className={style.spinner} aria-hidden="true"/>
            <h1 className={style.stateTitle}>Пополняем баланс…</h1>

            <Rows order={order} status="Оплачено, зачисляем" tone="toneWaiting"/>

            <div className={style.stateText}>
                <span className={style.stateLead}>Оплата получена, зачисляем средства на баланс Steam</span>
                <span className={style.stateNote}>Обычно занимает 5–15 минут</span>
            </div>

            <div className={style.stateActions}>
                <ManagerButton botType={botType}/>
            </div>
        </Shell>
    );
}

export function SteamDone({order, botType, onClose}) {
    return (
        <Shell>
            <div className={`${style.stateIcon} ${style.stateIconDone}`} aria-hidden="true">✓</div>
            <h1 className={style.stateTitle}>Готово!</h1>

            <Rows order={order} status="Зачислено на баланс" tone="toneDone"/>

            <div className={style.stateText}>
                <span className={style.stateLead}>Баланс Steam пополнен. Спасибо за заказ!</span>
            </div>

            <div className={style.stateActions}>
                <button type="button" className={style.statePrimary} onClick={onClose}>
                    Пополнить ещё раз
                </button>
                <ManagerButton botType={botType}/>
            </div>
        </Shell>
    );
}

export function SteamFail({order, onRetry, onClose}) {
    return (
        <Shell>
            <div className={`${style.stateIcon} ${style.stateIconFail}`} aria-hidden="true">!</div>
            <h1 className={style.stateTitle}>Счёт не оплачен</h1>

            <Rows order={order} status="Оплата не прошла" tone="toneFail"/>

            <div className={style.stateText}>
                <span className={style.stateLead}>
                    Срок действия счёта истёк, деньги не списались
                </span>
                <span className={style.stateNote}>Можно создать заказ заново — данные сохранились</span>
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

export function SteamStalled({order, botType, onClose}) {
    return (
        <Shell>
            <div className={`${style.stateIcon} ${style.stateIconFail}`} aria-hidden="true">!</div>
            <h1 className={style.stateTitle}>Не удалось зачислить автоматически</h1>

            <Rows order={order} status="Требует проверки" tone="toneFail"/>

            <div className={style.stateText}>
                <span className={style.stateLead}>
                    Деньги не потеряны — заказ уже у администратора, зачислим вручную
                </span>
                <span className={style.stateNote}>Обычно до 30 минут, 10:00–22:00 МСК</span>
            </div>

            <div className={style.stateActions}>
                <ManagerButton botType={botType} label="Написать администратору" variant="primary"/>
                <button type="button" className={style.stateSecondary} onClick={onClose}>
                    Вернуться к пополнению
                </button>
            </div>
        </Shell>
    );
}
