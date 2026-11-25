import React from 'react';
import {discountPercent} from '../Main/catalogSections';
import style from './SubscriptionDiscount.module.scss';

export default function SubscriptionDiscount({period}) {
    const percent = discountPercent(period?.price, period?.oldPrice);

    return percent > 0 ? <span className={style.badge} aria-label={`Скидка ${percent}%`}>−{percent}%</span> : null;
}
