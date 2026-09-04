import React, {useCallback, useEffect, useRef, useState} from 'react';
import styles from './AdminDock.module.scss';
import DictionaryList from './ProcessBlock/DictionaryList';
import useDictionaryItems from './ProcessBlock/useDictionaryItems';
import NoticeList from './NoticeBlock/NoticeList';
import useNoticeItems from './NoticeBlock/useNoticeItems';

const sunIcon = (
    <svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor">
        <circle cx="12" cy="12" r="4.7"/>
        <g stroke="currentColor" strokeWidth="2.4" strokeLinecap="round">
            <path d="M12 2.7v1.8M12 19.5v1.8M5.1 5.1l1.3 1.3M17.6 17.6l1.3 1.3M2.7 12h1.8M19.5 12h1.8M5.1 18.9l1.3-1.3M17.6 6.4l1.3-1.3"/>
        </g>
    </svg>
);

const moonIcon = (
    <svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor">
        <path d="M20.7 14.2A8.6 8.6 0 0 1 9.8 3.3a.9.9 0 0 0-1.2-1.1 9.8 9.8 0 1 0 13.2 13.2.9.9 0 0 0-1.1-1.2Z"/>
    </svg>
);

const bellIcon = (
    <svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor">
        <path d="M12 2.2a5.9 5.9 0 0 0-5.9 5.9c0 3.4-.6 5.2-1.5 6.5a1.2 1.2 0 0 0 1 1.9h12.8a1.2 1.2 0 0 0 1-1.9c-.9-1.3-1.5-3.1-1.5-6.5A5.9 5.9 0 0 0 12 2.2Z"/>
        <path d="M9.8 18.4a2.4 2.4 0 0 0 4.4 0Z"/>
    </svg>
);

const logoutIcon = (
    <svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor">
        <path d="M11.3 3H6.7A3.7 3.7 0 0 0 3 6.7v10.6A3.7 3.7 0 0 0 6.7 21h4.6a1.15 1.15 0 0 0 0-2.3H6.7a1.4 1.4 0 0 1-1.4-1.4V6.7a1.4 1.4 0 0 1 1.4-1.4h4.6a1.15 1.15 0 1 0 0-2.3Z"/>
        <path d="M16.4 7.6a1.15 1.15 0 0 0-1.6 1.6L16.6 11H10a1.15 1.15 0 1 0 0 2.3h6.6l-1.8 1.8a1.15 1.15 0 0 0 1.6 1.6l3.8-3.8a1.15 1.15 0 0 0 0-1.6Z"/>
    </svg>
);

const AdminDock = ({theme, onToggleTheme, onLogout}) => {
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

            {onLogout ? (
                <>
                    <span className={styles['separator']} aria-hidden/>
                    <button
                        type="button"
                        className={`${styles['iconBtn']} ${styles['iconBtnDanger']}`}
                        onClick={onLogout}
                        title="Выйти"
                        aria-label="Выйти"
                    >
                        {logoutIcon}
                    </button>
                </>
            ) : null}
        </div>
    );
};

export default AdminDock;
