import React from 'react';
import style from './SubscriptionEligibility.module.scss';

export default function SubscriptionEligibility({checked, disabled, error, onChange}) {
    return (
        <label className={style.choice}>
            <input type="checkbox" checked={checked} disabled={disabled} onChange={(event) => onChange(event.target.checked)}/>
            <span className={style.copy}>
                <span className={style.title}>У меня нет активной подписки</span>
                <span className={style.note}>Скидка доступна только без активной PS Plus. Если подписка есть — снимите галочку.</span>
                {error ? <span className={style.error} role="alert">{error}</span> : null}
            </span>
        </label>
    );
}
