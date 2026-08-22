import React, {useCallback, useEffect, useState} from 'react';
import style from './Broadcast.module.scss';
import BroadcastMessageEditor from './BroadcastMessageEditor';
import BroadcastStatsBar from './BroadcastStatsBar';
import useData from '../../useData';
import WorkTabs from '../../Elements/WorkTabs/WorkTabs';
import {useFeedback} from '../../Elements/Feedback/Feedback';
import {fetchBroadcastStats} from './useBroadcastServer';

// РАССЫЛКА
// --------
// Редактор сообщения и отправка. Экран одноэкранный, вкладок внутри не заводим —
// WorkTabs здесь только ради общей шапки: заголовок и подпись со статусом рассылки
// живут в строке вкладок, как в остальных разделах.

const BroadcastScreen = ({onStatusChange}) => {
    const authenticationData = useData((s) => s.authenticationData);
    const adminAuthToken = useData((s) => s.adminAuthToken);
    const {showToast} = useFeedback();

    const [stats, setStats] = useState(null);
    const [statsLoading, setStatsLoading] = useState(false);
    const [statsError, setStatsError] = useState('');

    const loadStats = useCallback(async () => {
        if (!authenticationData && !adminAuthToken) return;

        setStatsLoading(true);
        setStatsError('');
        try {
            const data = await fetchBroadcastStats(authenticationData || null);
            setStats(data);
        } catch (error) {
            setStats(null);
            const message = error.message || 'Не удалось загрузить статистику';
            setStatsError(message);
            showToast(message, 'error');
        } finally {
            setStatsLoading(false);
        }
    }, [authenticationData, adminAuthToken, showToast]);

    useEffect(() => {
        loadStats().then();
    }, [loadStats]);

    useEffect(() => {
        if (statsLoading) {
            onStatusChange('Загрузка…');
            return;
        }
        if (!stats) {
            onStatusChange('нет данных');
            return;
        }

        // Те же статусы, что показывает BroadcastStatsBar: running / scheduled / всё остальное
        const status = stats.state?.status;
        const recipients = stats.productionUniqueRecipients;

        if (status === 'running') {
            onStatusChange('идёт сейчас');
        } else if (status === 'scheduled') {
            onStatusChange('запланирована');
        } else {
            onStatusChange(recipients != null ? `получателей: ${recipients}` : 'готова к отправке');
        }
    }, [statsLoading, stats, onStatusChange]);

    return (
        <div className={style['screen']}>
            <header className={style['header']}>
                <div className={style['headerTop']}>
                    <h1 className={style['title']}>Рассылка</h1>
                </div>
            </header>

            <BroadcastStatsBar
                stats={stats}
                error={statsError}
                loading={statsLoading}
                onReload={loadStats}
            />
            <BroadcastMessageEditor
                authenticationData={authenticationData}
                limits={stats?.limits}
                broadcastState={stats?.state}
                onSendComplete={loadStats}
            />
        </div>
    );
};

const Broadcast = () => {
    const [subtitle, setSubtitle] = useState('');

    return (
        <WorkTabs rootTitle="Рассылка" rootSubtitle={subtitle}>
            <BroadcastScreen onStatusChange={setSubtitle}/>
        </WorkTabs>
    );
};

export default Broadcast;
