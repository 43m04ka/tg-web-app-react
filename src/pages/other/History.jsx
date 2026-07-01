import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTelegram } from '../../hooks/useTelegram';
import { useServerUser } from '../../hooks/useServerUser';
import Recommendations from '../../shared/ui/Recommendations/Recommendations';
import DesktopHistory from './DesktopHistory/DesktopHistory';
import style from './History.module.scss';
import basketStyle from '../Basket/Basket.module.scss';

const History = () => {
    const [isDesktop] = useState(() => window.innerWidth >= 768);

    if (isDesktop) return <DesktopHistory />;

    return <MobileHistory />;
};

/* ── Mobile version ──────────────────────────────────────── */
const MobileHistory = () => {
    const navigate = useNavigate();
    const { tg, user, safeAreaInset, contentSafeAreaInset } = useTelegram();
    const { getHistoryList } = useServerUser();
    const [historyData, setHistoryData] = useState(null);

    useEffect(() => {
        getHistoryList(setHistoryData, user.id).then();
        tg.BackButton.show();
        const onBack = () => navigate(-1);
        tg.onEvent('backButtonClicked', onBack);
        return () => { tg.offEvent('backButtonClicked', onBack); };
    }, [navigate, tg, user.id]);

    const paddingTop = contentSafeAreaInset.top + safeAreaInset.top;
    const paddingBottom = contentSafeAreaInset.bottom + safeAreaInset.bottom;

    if (historyData === null) {
        return (
            <div className="plup-loader" style={{
                marginTop: `${window.innerHeight / 2 - 50}px`,
                marginLeft: `${window.innerWidth / 2 - 50}px`,
            }} />
        );
    }

    if (historyData.length === 0) {
        return (
            <div style={{ display: 'flex', flexDirection: 'column', height: '100vh',
                paddingTop: `${paddingTop}px`, paddingBottom: `${paddingBottom}px`, overflowY: 'scroll' }}>
                <div className={basketStyle.emptyBasket}>
                    <div />
                    <div>В истории покупок ничего нет</div>
                    <button className={basketStyle.button} style={{ background: '#454545' }}
                            onClick={() => navigate('/')}>
                        Перейти к покупкам
                    </button>
                </div>
                <Recommendations />
            </div>
        );
    }

    return (
        <div className={style.page} style={{ paddingTop: `${paddingTop}px` }}>
            <p className={style.title}>История заказов</p>
            <div className={style.list} style={{ paddingBottom: `${paddingBottom + 20}px` }}>
                {historyData.map(order => (
                    <MobileOrderCard key={order.id} order={order} />
                ))}
            </div>
        </div>
    );
};

/* ── Mobile order card ───────────────────────────────────── */
const MobileOrderCard = ({ order }) => (
    <div className={style.orderCard}>
        <div className={style.orderHeader}>
            <div>
                <div className={style.orderNum}>Заказ №{order.id}</div>
                <div className={style.orderMeta}>
                    {String(order.date).replaceAll('/', '.')}
                </div>
            </div>
            <div className={style.orderTotal}>{order.summa} ₽</div>
        </div>
        <div className={style.orderItems}>
            {order.body.map((item, i) => (
                <React.Fragment key={i}>
                    {i > 0 && <div className={style.separator} />}
                    <div className={style.item}>
                        <img src={item.body.image} alt={item.body.name} className={style.itemImg} />
                        <div>
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
    </div>
);

export default History;
