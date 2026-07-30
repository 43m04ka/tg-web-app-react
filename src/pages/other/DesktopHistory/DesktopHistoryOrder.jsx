import React, {useState} from 'react';
import style from './DesktopHistoryOrder.module.scss';
import {getOrderStatusInfo} from "../../../utils/orderStatus";

function countWord(n) {
    if (n % 10 === 1 && n % 100 !== 11) return '';
    if (n % 10 >= 2 && n % 10 <= 4 && (n % 100 < 10 || n % 100 >= 20)) return 'а';
    return 'ов';
}

const DesktopHistoryOrder = ({ order }) => {
    const [expanded, setExpanded] = useState(false);
    const dateStr = order.createdAt ? new Date(order.createdAt).toLocaleDateString('ru-RU') : '';
    const statusInfo = getOrderStatusInfo(order.status);
    const positions = order.positions || [];

    return (
        <div className={style.card}>
            <div className={style.header} onClick={() => setExpanded(v => !v)}>
                <div className={style.headerLeft}>
                    <span className={style.orderNum}>
                        Заказ №{order.id}{order.pageTitle ? ` · ${order.pageTitle}` : ''}
                    </span>
                    <span className={style.date}>{dateStr}</span>
                    <span className={`${style.statusBadge} ${style[`status_${statusInfo.group}`]}`}>
                        {statusInfo.label}
                    </span>
                </div>
                <div className={style.headerRight}>
                    <span className={style.total}>{order.total} ₽</span>
                    <span className={style.itemCount}>
                        {positions.length} товар{countWord(positions.length)}
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
                    {positions.map((item, i) => (
                        <React.Fragment key={item.id ?? i}>
                            {i > 0 && <div className={style.separator} />}
                            <div className={style.item}>
                                <div className={style.itemInfo}>
                                    <p className={style.itemName}>
                                        {item.name}
                                        {item.meta?.choiceRow ? ` — ${item.meta.choiceRow}` : ''}
                                        {item.quantity > 1 ? ` × ${item.quantity}` : ''}
                                    </p>
                                    <p className={style.itemPrice}>{item.sum} ₽</p>
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
