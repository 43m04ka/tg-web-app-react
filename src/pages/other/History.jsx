import React, {useEffect, useState} from 'react';
import {useNavigate} from 'react-router-dom';
import {useTelegram} from '../../hooks/useTelegram';
import {useServerUser} from '../../hooks/useServerUser';
import Recommendations from '../../shared/ui/Recommendations/Recommendations';
import DesktopHistory from './DesktopHistory/DesktopHistory';
import style from './History.module.scss';
import basketStyle from '../Basket/Basket.module.scss';
import {usePlatformUser} from "../../hooks/usePlatformUser";
import {useAppInsets} from "../../hooks/useAppInsets";
import {getOrderStatusInfo} from "../../utils/orderStatus";

const History = () => {
    const [isDesktop] = useState(() => window.innerWidth >= 768);

    if (isDesktop) return <DesktopHistory />;

    return <MobileHistory />;
};

/* ── Mobile version ──────────────────────────────────────── */
const MobileHistory = () => {
    const navigate = useNavigate();
    const { tg } = useTelegram();
const { safeAreaInset, contentSafeAreaInset, isKeyboardOpen } = useAppInsets();
    const { user } = usePlatformUser();
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
const MobileOrderCard = ({ order }) => {
    const statusInfo = getOrderStatusInfo(order.status);
    const positions = order.positions || [];

    return (
        <div className={style.orderCard}>
            <div className={style.orderHeader}>
                <div>
                    <div className={style.orderNum}>
                        Заказ №{order.id}{order.pageTitle ? ` · ${order.pageTitle}` : ''}
                    </div>
                    <div className={style.orderMeta}>
                        {order.createdAt ? new Date(order.createdAt).toLocaleDateString('ru-RU') : ''}
                    </div>
                </div>
                <div style={{ textAlign: 'right' }}>
                    <div className={style.orderTotal}>{order.total} ₽</div>
                    <div className={`${style.statusBadge} ${style[`status_${statusInfo.group}`]}`}>
                        {statusInfo.label}
                    </div>
                </div>
            </div>
            <div className={style.orderItems}>
                {positions.map((item, i) => (
                    <React.Fragment key={item.id ?? i}>
                        {i > 0 && <div className={style.separator} />}
                        <div className={style.item}>
                            <div>
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
        </div>
    );
};

export default History;
