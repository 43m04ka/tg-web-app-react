import React, {useCallback, useEffect, useRef, useState} from 'react';
import styles from './AdminDock.module.scss';
import DictionaryList from './ProcessBlock/DictionaryList';
import useDictionaryItems from './ProcessBlock/useDictionaryItems';
import NoticeList from './NoticeBlock/NoticeList';
import useNoticeItems from './NoticeBlock/useNoticeItems';

const sunIcon = (
    <svg viewBox="0 0 24 24" width="17" height="17" fill="none" stroke="currentColor" strokeWidth="2">
        <circle cx="12" cy="12" r="4" />
        <path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M4.93 19.07l1.41-1.41M17.66 6.34l1.41-1.41" strokeLinecap="round" />
    </svg>
);

const moonIcon = (
    <svg viewBox="0 0 24 24" width="17" height="17" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79Z" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
);

const bellIcon = (
    <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M18 8A6 6 0 1 0 6 8c0 7-3 7-3 14h18c0-7-3-7-3-14" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M13.73 21a2 2 0 0 1-3.46 0" strokeLinecap="round" />
    </svg>
);

// Плавающий островок поверх контента: переключение темы + фоновые процессы.
const AdminDock = ({theme, onToggleTheme}) => {
    const [notifOpen, setNotifOpen] = useState(false);
    const notifWrapRef = useRef(null);
    const notifAutoCloseRef = useRef(null);

    const clearNotifAutoClose = useCallback(() => {
        if (notifAutoCloseRef.current) {
            clearTimeout(notifAutoCloseRef.current);
            notifAutoCloseRef.current = null;
        }
    }, []);

    // Раскрываем островок и на запуск задачи, и на её итог: именно итог интересен
    // больше всего — процесс к этому моменту уже исчез из списка
    const flashPopover = useCallback(() => {
        clearNotifAutoClose();
        setNotifOpen(true);
        notifAutoCloseRef.current = setTimeout(() => {
            setNotifOpen(false);
            notifAutoCloseRef.current = null;
        }, 3000);
    }, [clearNotifAutoClose]);

    const {items, loading, error, updateNotificationStatus, cancelProcess} = useDictionaryItems({
        onNewProcess: flashPopover
    });
    const notices = useNoticeItems({onNewNotice: flashPopover});

    // Точка на колокольчике: есть текущие задачи либо непрочитанные итоги
    const hasBadge = items.length > 0 || notices.notices.length > 0;
    // Хотя бы один плохой итог — точка становится тревожной
    const hasProblem = notices.notices.some((notice) => notice.level === 'error' || notice.level === 'warning');

    const toggleNotifOpen = () => {
        clearNotifAutoClose();
        setNotifOpen((v) => !v);
    };

    useEffect(() => () => clearNotifAutoClose(), [clearNotifAutoClose]);

    useEffect(() => {
        if (!notifOpen) return;
        const close = (e) => {
            if (notifWrapRef.current && !notifWrapRef.current.contains(e.target)) {
                clearNotifAutoClose();
                setNotifOpen(false);
            }
        };
        document.addEventListener('mousedown', close);
        return () => document.removeEventListener('mousedown', close);
    }, [notifOpen, clearNotifAutoClose]);

    return (
        <div className={styles['dock']}>
            <button
                type="button"
                className={styles['iconBtn']}
                onClick={onToggleTheme}
                title={theme === 'dark' ? 'Светлая тема' : 'Тёмная тема'}
                aria-label="Переключить тему"
            >
                {theme === 'dark' ? sunIcon : moonIcon}
            </button>

            <span className={styles['separator']} aria-hidden />

            <div ref={notifWrapRef} className={styles['notifWrap']}>
                <button
                    type="button"
                    className={styles['iconBtn']}
                    aria-expanded={notifOpen}
                    aria-haspopup="true"
                    onClick={toggleNotifOpen}
                    title="Процессы и уведомления"
                >
                    {bellIcon}
                    {hasBadge ? (
                        <span className={`${styles['dot']} ${hasProblem ? styles['dotAlert'] : ''}`} aria-hidden />
                    ) : null}
                </button>
                {notifOpen ? (
                    <div className={styles['notifPopover']} role="dialog" aria-label="Задачи и итоги">
                        <p className={styles['notifPopoverTitle']}>Фоновые задачи</p>
                        <div className={styles['notifPopoverBody']}>
                            <DictionaryList
                                embedded
                                items={items}
                                loading={loading}
                                error={error}
                                updateNotificationStatus={updateNotificationStatus}
                                cancelProcess={cancelProcess}
                            />
                        </div>

                        <p className={`${styles['notifPopoverTitle']} ${styles['notifPopoverTitleNext']}`}>Итоги</p>
                        <div className={styles['notifPopoverBody']}>
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
                    </div>
                ) : null}
            </div>
        </div>
    );
};

export default AdminDock;
