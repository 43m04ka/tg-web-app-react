import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTelegram } from '../../../hooks/useTelegram';
import { useServerUser } from '../../../hooks/useServerUser';
import useGlobalData from '../../../hooks/useGlobalData';
import Recommendations from '../../../shared/ui/Recommendations/Recommendations';
import DesktopHistoryOrder from './DesktopHistoryOrder';
import style from './DesktopHistory.module.scss';

function countWord(n) {
    if (n % 10 === 1 && n % 100 !== 11) return '';
    if (n % 10 >= 2 && n % 10 <= 4 && (n % 100 < 10 || n % 100 >= 20)) return 'а';
    return 'ов';
}

const DesktopHistory = () => {
    const { tg, user } = useTelegram();
    const navigate = useNavigate();
    const { getHistoryList } = useServerUser();
    const { bufferCardsRecommendations } = useGlobalData();
    const [historyData, setHistoryData] = useState(null);

    useEffect(() => {
        getHistoryList(setHistoryData, user.id).then();
        tg.BackButton.show();
        const onBack = () => navigate(-1);
        tg.onEvent('backButtonClicked', onBack);
        return () => { tg.offEvent('backButtonClicked', onBack); };
    }, []);

    if (historyData === null) {
        return (
            <div className={style.page}>
                <div className={style.loaderWrap}>
                    <div className="plup-loader" />
                </div>
            </div>
        );
    }

    if (historyData.length === 0) {
        return (
            <div className={style.page}>
                <div className={style.empty}>
                    <p className={style.emptyTitle}>История заказов пуста</p>
                    <button className={style.emptyBtn} onClick={() => navigate('/')}>
                        Перейти к покупкам
                    </button>
                </div>
                <Recommendations from="history" desktop data={bufferCardsRecommendations} />
            </div>
        );
    }

    return (
        <div className={style.page}>
            <div className={style.inner}>
                <div className={style.header}>
                    <h1 className={style.title}>История заказов</h1>
                    <span className={style.count}>
                        {historyData.length} заказ{countWord(historyData.length)}
                    </span>
                </div>
                <div className={style.list}>
                    {historyData.map(order => (
                        <DesktopHistoryOrder key={order.id} order={order} />
                    ))}
                </div>
            </div>
            <Recommendations from="history" desktop data={bufferCardsRecommendations} />
        </div>
    );
};

export default DesktopHistory;
