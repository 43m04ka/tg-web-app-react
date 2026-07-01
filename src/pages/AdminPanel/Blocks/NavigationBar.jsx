import React, {useCallback, useEffect, useRef, useState} from 'react';
import styles from './NavigationBar.module.scss';
import {useNavigate, useLocation} from 'react-router-dom';
import {useServer} from '../useServer';
import useData from '../useData';
import DictionaryList from './ProcessBlock/DictionaryList';
import useDictionaryItems from './ProcessBlock/useDictionaryItems';
import {hasAdminBearer} from '../adminAuth';

const refreshIconSvg = (
    <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M3 12a9 9 0 0 1 9-9 9.75 9.75 0 0 1 6.74 2.74L21 8" />
        <path d="M21 3v5h-5" />
        <path d="M21 12a9 9 0 0 1-9 9 9.75 9.75 0 0 1-6.74-2.74L3 16" />
        <path d="M8 16H3v5" />
    </svg>
);

const NavigationBar = ({routeData}) => {
    const navigator = useNavigate();
    const location = useLocation();
    const {updateAssociations, refreshStructureData} = useServer();
    const authenticationData = useData((s) => s.authenticationData);

    const [notifOpen, setNotifOpen] = useState(false);
    const [structureBusy, setStructureBusy] = useState(false);
    const [structureToast, setStructureToast] = useState(null);
    const notifWrapRef = useRef(null);
    const notifAutoCloseRef = useRef(null);

    const clearNotifAutoClose = useCallback(() => {
        if (notifAutoCloseRef.current) {
            clearTimeout(notifAutoCloseRef.current);
            notifAutoCloseRef.current = null;
        }
    }, []);

    const onNewProcess = useCallback(() => {
        clearNotifAutoClose();
        setNotifOpen(true);
        notifAutoCloseRef.current = setTimeout(() => {
            setNotifOpen(false);
            notifAutoCloseRef.current = null;
        }, 3000);
    }, [clearNotifAutoClose]);

    const {items, loading, error, updateNotificationStatus} = useDictionaryItems({onNewProcess});

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

    const canAct = () => authenticationData || hasAdminBearer();

    const onRefreshStructure = async () => {
        if (!canAct()) return;
        setStructureBusy(true);
        setStructureToast(null);
        try {
            const {ok, status, data} = await refreshStructureData(authenticationData);
            if (ok && data?.ok !== false) {
                setStructureToast({type: 'ok', text: data?.message || 'Структура обновлена'});
            } else if (status === 400) {
                setStructureToast({type: 'err', text: data?.error || 'Нет доступа'});
            } else {
                setStructureToast({type: 'err', text: data?.error || data?.message || `Ошибка ${status}`});
            }
        } catch (e) {
            setStructureToast({type: 'err', text: e.message || 'Сеть'});
        } finally {
            setStructureBusy(false);
            setTimeout(() => setStructureToast(null), 5000);
        }
    };

    const pathAfterAdmin = location.pathname.replace(/^\/admin-panel\/?/, '').replace(/\/$/, '');
    const activeSlug = (pathAfterAdmin.split('/')[0] || '').trim();

    return (
        <div className={styles['main-division']}>
            <div ref={notifWrapRef} className={styles['notifFloating']}>
                <button
                    type="button"
                    className={styles['notifBtn']}
                    aria-expanded={notifOpen}
                    aria-haspopup="true"
                    onClick={toggleNotifOpen}
                    title="Процессы и уведомления"
                >
                    <span className={styles['notifIcon']} aria-hidden>
                        <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2">
                            <path
                                d="M18 8A6 6 0 1 0 6 8c0 7-3 7-3 14h18c0-7-3-7-3-14"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                            />
                            <path d="M13.73 21a2 2 0 0 1-3.46 0" strokeLinecap="round" />
                        </svg>
                    </span>
                </button>
                {notifOpen ? (
                    <div className={styles['notifPopover']} role="dialog" aria-label="Процессы">
                        <div className={styles['notifPopoverCorner']} aria-hidden />
                        <p className={styles['notifPopoverTitle']}>Фоновые задачи</p>
                        <div className={styles['notifPopoverBody']}>
                            <DictionaryList
                                embedded
                                items={items}
                                loading={loading}
                                error={error}
                                updateNotificationStatus={updateNotificationStatus}
                            />
                        </div>
                    </div>
                ) : null}
            </div>

            <div className={styles['navScroll']}>
                {routeData.map((routeList, listIdx) => (
                    <div key={listIdx} className={styles['routeBlock']}>
                        {routeList.map((label) => (
                            <button
                                type="button"
                                key={label.path}
                                onClick={() => navigator(label.path)}
                                className={`${styles['navItem']} ${activeSlug === label.path ? styles['navItemActive'] : ''}`}
                            >
                                {label.name}
                            </button>
                        ))}
                    </div>
                ))}
            </div>

            <div className={styles['actionsColumn']}>
                <button
                    type="button"
                    className={styles['actionBtn']}
                    disabled={!canAct()}
                    onClick={() => {
                        updateAssociations(authenticationData).then();
                    }}
                >
                    <span className={styles['actionBtnIcon']} aria-hidden>
                        {refreshIconSvg}
                    </span>
                    <span className={styles['actionBtnText']}>Обновить ассоциации</span>
                </button>
                <button
                    type="button"
                    className={styles['actionBtn']}
                    disabled={!canAct() || structureBusy}
                    onClick={onRefreshStructure}
                >
                    <span className={styles['actionBtnIcon']} aria-hidden>
                        {refreshIconSvg}
                    </span>
                    <span className={styles['actionBtnText']}>
                        {structureBusy ? 'Обновление…' : 'Обновить структуру'}
                    </span>
                </button>
            </div>

            {structureToast ? (
                <div className={`${styles['structureToast']} ${styles[`structureToast_${structureToast.type}`]}`}>
                    {structureToast.text}
                </div>
            ) : null}
        </div>
    );
};

export default NavigationBar;
