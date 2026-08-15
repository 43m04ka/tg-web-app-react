import React from 'react';
import styles from './RefreshActions.module.scss';
import {useServer} from '../../useServer';
import useData from '../../useData';
import {hasAdminBearer} from '../../adminAuth';

const refreshIconSvg = (
    <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M3 12a9 9 0 0 1 9-9 9.75 9.75 0 0 1 6.74 2.74L21 8" />
        <path d="M21 3v5h-5" />
        <path d="M21 12a9 9 0 0 1-9 9 9.75 9.75 0 0 1-6.74-2.74L3 16" />
        <path d="M8 16H3v5" />
    </svg>
);

// Глобальные пересчёты каталога. Живут на главной, а не в навигации.
const RefreshActions = () => {
    const {updateAssociations, refreshStructureData} = useServer();
    const authenticationData = useData((s) => s.authenticationData);

    const [associationsBusy, setAssociationsBusy] = React.useState(false);
    const [structureBusy, setStructureBusy] = React.useState(false);
    const [toast, setToast] = React.useState(null);

    const canAct = () => authenticationData || hasAdminBearer();

    const showToast = (type, text) => {
        setToast({type, text});
        setTimeout(() => setToast(null), 5000);
    };

    const onRefreshAssociations = async () => {
        if (!canAct()) return;
        setAssociationsBusy(true);
        try {
            await updateAssociations(authenticationData);
            showToast('ok', 'Обновление ассоциаций запущено');
        } catch (e) {
            showToast('err', e.message || 'Сеть');
        } finally {
            setAssociationsBusy(false);
        }
    };

    const onRefreshStructure = async () => {
        if (!canAct()) return;
        setStructureBusy(true);
        try {
            const {ok, status, data} = await refreshStructureData(authenticationData);
            if (ok && data?.ok !== false) {
                showToast('ok', data?.message || 'Структура обновлена');
            } else if (status === 400) {
                showToast('err', data?.error || 'Нет доступа');
            } else {
                showToast('err', data?.error || data?.message || `Ошибка ${status}`);
            }
        } catch (e) {
            showToast('err', e.message || 'Сеть');
        } finally {
            setStructureBusy(false);
        }
    };

    const actions = [
        {
            key: 'associations',
            title: 'Обновить ассоциации',
            hint: 'Пересобрать связи товаров и каталогов',
            busy: associationsBusy,
            onClick: onRefreshAssociations,
        },
        {
            key: 'structure',
            title: 'Обновить структуру',
            hint: 'Перечитать дерево разделов витрины',
            busy: structureBusy,
            onClick: onRefreshStructure,
        },
    ];

    return (
        <div className={styles['list']}>
            {actions.map((action) => (
                <button
                    key={action.key}
                    type="button"
                    className={styles['actionRow']}
                    disabled={!canAct() || action.busy}
                    onClick={action.onClick}
                >
                    <span className={styles['actionBody']}>
                        <span className={styles['actionTitle']}>
                            {action.busy ? 'Обновление…' : action.title}
                        </span>
                        <span className={styles['actionHint']}>{action.hint}</span>
                    </span>
                    <span className={`${styles['actionIcon']} ${action.busy ? styles['actionIconBusy'] : ''}`} aria-hidden>
                        {refreshIconSvg}
                    </span>
                </button>
            ))}

            {toast ? (
                <div className={`${styles['toast']} ${styles[`toast_${toast.type}`]}`}>
                    {toast.text}
                </div>
            ) : null}
        </div>
    );
};

export default RefreshActions;
