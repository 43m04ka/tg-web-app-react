import React, {useCallback, useEffect, useState} from 'react';
import style from './Broadcast.module.scss';
import BroadcastMessageEditor from './BroadcastMessageEditor';
import BroadcastStatsBar from './BroadcastStatsBar';
import useData from '../../useData';
import {fetchBroadcastStats} from './useBroadcastServer';

const Broadcast = () => {
    const authenticationData = useData((s) => s.authenticationData);
    const adminAuthToken = useData((s) => s.adminAuthToken);
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
        } catch (e) {
            setStats(null);
            setStatsError(e.message || 'Не удалось загрузить статистику');
        } finally {
            setStatsLoading(false);
        }
    }, [authenticationData, adminAuthToken]);

    useEffect(() => {
        loadStats().then();
    }, [loadStats]);

    return (
        <div className={style['mainContainer']}>
            <div className={style['header']}>
                <div className={style['headerTitle']}>Рассылка</div>
            </div>
            <BroadcastStatsBar
                stats={stats}
                error={statsError}
                loading={statsLoading}
                onReload={loadStats}
            />
            <BroadcastMessageEditor
                authenticationData={authenticationData}
                limits={stats?.limits}
            />
        </div>
    );
};

export default Broadcast;
