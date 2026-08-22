import React from 'react';
import styles from './Dashboard.module.scss';
import MaintenanceToggle from '../../Blocks/MaintenanceToggle/MaintenanceToggle';
import DictionaryList from '../../Blocks/ProcessBlock/DictionaryList';
import useDictionaryItems from '../../Blocks/ProcessBlock/useDictionaryItems';
import NoticeList from '../../Blocks/NoticeBlock/NoticeList';
import useNoticeItems from '../../Blocks/NoticeBlock/useNoticeItems';
import SteamSettings from '../../Blocks/SteamSettings/SteamSettings';
import RefreshActions from '../../Blocks/RefreshActions/RefreshActions';

// Места блоков заданы жёстко через grid-areas: раскладка не пересобирается,
// когда данные виджетов доезжают с сервера.
const Dashboard = () => {
    const {items, loading, error, updateNotificationStatus, cancelProcess} = useDictionaryItems();
    const notices = useNoticeItems();

    return (
        <div className={styles['container']}>
            <h1 className={styles['title']}>Главная</h1>
            <div className={styles['widgetGrid']}>
                <section className={`${styles['widgetCard']} ${styles['areaStatus']}`}>
                    <div className={styles['widgetHeader']}>
                        <span className={styles['widgetTitle']}>Статус сайта</span>
                    </div>
                    <div className={styles['widgetBody']}>
                        <MaintenanceToggle/>
                    </div>
                </section>

                <section className={`${styles['widgetCard']} ${styles['areaSteam']}`}>
                    <div className={styles['widgetHeader']}>
                        <span className={styles['widgetTitle']}>Steam</span>
                    </div>
                    <div className={styles['widgetBody']}>
                        <SteamSettings/>
                    </div>
                </section>

                <section className={`${styles['widgetCard']} ${styles['areaMaintenance']}`}>
                    <div className={styles['widgetHeader']}>
                        <span className={styles['widgetTitle']}>Обслуживание</span>
                    </div>
                    <div className={styles['widgetBody']}>
                        <RefreshActions/>
                    </div>
                </section>

                <section className={`${styles['widgetCard']} ${styles['areaProcesses']}`}>
                    <div className={styles['widgetHeader']}>
                        <span className={styles['widgetTitle']}>Фоновые процессы</span>
                        {items.length > 0 ? <span className={styles['widgetBadge']}>{items.length}</span> : null}
                    </div>
                    <div className={styles['widgetBody']}>
                        <DictionaryList
                            embedded
                            items={items}
                            loading={loading}
                            error={error}
                            updateNotificationStatus={updateNotificationStatus}
                            cancelProcess={cancelProcess}
                        />
                    </div>
                </section>

                <section className={`${styles['widgetCard']} ${styles['areaNotices']}`}>
                    <div className={styles['widgetHeader']}>
                        <span className={styles['widgetTitle']}>Итоги задач</span>
                        {notices.notices.length > 0 ? (
                            <span className={styles['widgetBadge']}>{notices.notices.length}</span>
                        ) : null}
                    </div>
                    <div className={styles['widgetBody']}>
                        <NoticeList
                            embedded
                            notices={notices.notices}
                            loading={notices.loading}
                            error={notices.error}
                            details={notices.details}
                            detailsLoading={notices.detailsLoading}
                            loadDetails={notices.loadDetails}
                            dismissNotice={notices.dismissNotice}
                        />
                    </div>
                </section>
            </div>
        </div>
    );
};

export default Dashboard;
