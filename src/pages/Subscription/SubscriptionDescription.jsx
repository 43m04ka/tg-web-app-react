import React from 'react';
import {descriptionLines} from '../Product/productView';
import style from './Subscription.module.scss';

export default function SubscriptionDescription({product}) {
    const lines = descriptionLines(product?.description);

    if (!lines.length) return null;

    return (
        <section className={style.block}>
            <div className={style.blockHead}>
                <h2 className={style.blockTitle}>Описание</h2>
            </div>
            <div className={style.perksCard}>
                {lines.map((line, index) => <p key={index} className={style.perksText}>{line}</p>)}
            </div>
        </section>
    );
}
