import React, { useState } from 'react';
import style from './DesktopHistoryOrder.module.scss';

function countWord(n) {
    if (n % 10 === 1 && n % 100 !== 11) return '';
    if (n % 10 >= 2 && n % 10 <= 4 && (n % 100 < 10 || n % 100 >= 20)) return 'а';
    return 'ов';
}

const DesktopHistoryOrder = ({ order }) => {
    const [expanded, setExpanded] = useState(false);
    const dateStr = String(order.date).replaceAll('/', '.');

    return (
        <div className={style.card}>
            <div className={style.header} onClick={() => setExpanded(v => !v)}>
                <div className={style.headerLeft}>
                    <span className={style.orderNum}>Заказ №{order.id}</span>
                    <span className={style.date}>{dateStr}</span>
                </div>
                <div className={style.headerRight}>
                    <span className={style.total}>{order.summa} ₽</span>
                    <span className={style.itemCount}>
                        {order.body.length} товар{countWord(order.body.length)}
                    </span>
                    <svg
                        className={`${style.chevron} ${expanded ? style.chevronOpen : ''}`}
                        viewBox="0 0 24 24" fill="none"
                    >
                        <path d="M6 9l6 6 6-6" stroke="currentColor" strokeWidth="2"
                              strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                </div>
            </div>

            {expanded && (
                <div className={style.items}>
                    {order.body.map((item, i) => (
                        <React.Fragment key={i}>
                            {i > 0 && <div className={style.separator} />}
                            <div className={style.item}>
                                <img
                                    src={item.body.image}
                                    alt={item.body.name}
                                    className={style.itemImg}
                                />
                                <div className={style.itemInfo}>
                                    <p className={style.itemName}>
                                        {item.body.name}
                                        {item.body.choiceColumn
                                            ? ` — ${item.body.choiceColumn} ${item.body.choiceRow}`
                                            : ''}
                                    </p>
                                    <p className={style.itemPrice}>{item.body.price} ₽</p>
                                </div>
                            </div>
                        </React.Fragment>
                    ))}
                </div>
            )}
        </div>
    );
};

export default DesktopHistoryOrder;
