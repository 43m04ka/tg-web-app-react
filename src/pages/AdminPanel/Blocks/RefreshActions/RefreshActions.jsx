import React from 'react';
import styles from './RefreshActions.module.scss';
import {useServer} from '../../useServer';
import useData from '../../useData';
import {hasAdminBearer} from '../../adminAuth';
import {useFeedback} from '../../Elements/Feedback/Feedback';

const refreshIconSvg = (
    <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M3 12a9 9 0 0 1 9-9 9.75 9.75 0 0 1 6.74 2.74L21 8" />
        <path d="M21 3v5h-5" />
        <path d="M21 12a9 9 0 0 1-9 9 9.75 9.75 0 0 1-6.74-2.74L3 16" />
        <path d="M8 16H3v5" />
    </svg>
);

const clockIconSvg = (
    <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2">
        <circle cx="12" cy="12" r="9" />
        <path d="M12 7v5l3 2" strokeLinecap="round" />
    </svg>
);

/** Момент в мс -> значение для input[type=datetime-local] в местном времени браузера */
const toLocalInputValue = (ms) => {
    const date = new Date(ms);
    // toISOString() отдаёт UTC, а поле ждёт местное время: без поправки на часовой
    // пояс выбранное «21:00» уезжало бы на несколько часов
    const local = new Date(date.getTime() - date.getTimezoneOffset() * 60000);
    return local.toISOString().slice(0, 16);
};

const formatRunAt = (ms) => new Date(ms).toLocaleString('ru-RU', {
    day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit',
});

/** «через 3 ч 20 мин» — понятнее, чем голая дата, когда до запуска недалеко */
const formatLeft = (msLeft) => {
    if (msLeft === null || msLeft === undefined) return null;

    const minutes = Math.max(0, Math.round(msLeft / 60000));
    if (minutes < 1) return 'меньше минуты';
    if (minutes < 60) return `${minutes} мин`;

    const hours = Math.floor(minutes / 60);
    const rest = minutes % 60;
    if (hours < 24) return rest ? `${hours} ч ${rest} мин` : `${hours} ч`;

    const days = Math.floor(hours / 24);
    return `${days} дн ${hours % 24} ч`;
};

// Глобальные пересчёты каталога. Живут на главной, а не в навигации.
const RefreshActions = () => {
    const {
        updateAssociations, refreshStructureData,
        getAssociationsSchedule, scheduleAssociations, cancelAssociationsSchedule,
    } = useServer();
    const authenticationData = useData((s) => s.authenticationData);
    const {showToast, confirm} = useFeedback();

    const [associationsBusy, setAssociationsBusy] = React.useState(false);
    const [structureBusy, setStructureBusy] = React.useState(false);

    // Пересборка ассоциаций тяжёлая, поэтому её удобно ставить на ночь.
    const [schedule, setSchedule] = React.useState(null);
    const [planOpen, setPlanOpen] = React.useState(false);
    const [planValue, setPlanValue] = React.useState('');
    const [planBusy, setPlanBusy] = React.useState(false);

    const serverRef = React.useRef(null);
    serverRef.current = {getAssociationsSchedule, scheduleAssociations, cancelAssociationsSchedule};

    const canAct = () => authenticationData || hasAdminBearer();

    const loadSchedule = React.useCallback(async () => {
        try {
            setSchedule(await serverRef.current.getAssociationsSchedule());
        } catch {
            // Расписание — дополнение к кнопке, а не сам блок: не получилось узнать —
            // просто не показываем строку, вручную запустить по-прежнему можно
            setSchedule(null);
        }
    }, []);

    React.useEffect(() => {
        loadSchedule();
    }, [loadSchedule]);

    const onRefreshAssociations = async () => {
        if (!canAct()) return;
        setAssociationsBusy(true);
        try {
            await updateAssociations(authenticationData);
            showToast('Обновление ассоциаций запущено', 'success');
        } catch (e) {
            showToast(e.message || 'Ошибка сети', 'error');
        } finally {
            setAssociationsBusy(false);
        }
    };

    const onOpenPlan = () => {
        // По умолчанию предлагаем ближайшую ночь: именно ради неё режим и заведён
        const base = new Date();
        base.setHours(base.getHours() >= 3 ? 27 : 3, 0, 0, 0);
        setPlanValue(toLocalInputValue(schedule?.runAt || base.getTime()));
        setPlanOpen(true);
    };

    const onSubmitPlan = async () => {
        if (!canAct() || !planValue) return;

        const runAt = new Date(planValue).getTime();
        if (!Number.isFinite(runAt)) {
            showToast('Не удалось разобрать дату', 'error');
            return;
        }

        setPlanBusy(true);
        try {
            const next = await serverRef.current.scheduleAssociations(authenticationData, runAt);
            setSchedule(next);
            setPlanOpen(false);
            showToast(`Обновление ассоциаций запланировано на ${formatRunAt(runAt)}`, 'success');
        } catch (e) {
            showToast(e.message || 'Ошибка сети', 'error');
        } finally {
            setPlanBusy(false);
        }
    };

    const onCancelPlan = async () => {
        if (!canAct()) return;

        const agreed = await confirm({
            title: 'Снять запланированное обновление?',
            text: `Задача на ${formatRunAt(schedule.runAt)} не будет выполнена.`,
            confirmLabel: 'Снять',
            danger: true,
        });
        if (!agreed) return;

        setPlanBusy(true);
        try {
            setSchedule(await serverRef.current.cancelAssociationsSchedule(authenticationData));
            showToast('Запланированное обновление снято', 'success');
        } catch (e) {
            showToast(e.message || 'Ошибка сети', 'error');
        } finally {
            setPlanBusy(false);
        }
    };

    const onRefreshStructure = async () => {
        if (!canAct()) return;
        setStructureBusy(true);
        try {
            const {ok, status, data} = await refreshStructureData(authenticationData);
            if (ok && data?.ok !== false) {
                showToast(data?.message || 'Структура обновлена', 'success');
            } else if (status === 400) {
                showToast(data?.error || 'Нет доступа', 'error');
            } else {
                showToast(data?.error || data?.message || `Ошибка ${status}`, 'error');
            }
        } catch (e) {
            showToast(e.message || 'Ошибка сети', 'error');
        } finally {
            setStructureBusy(false);
        }
    };

    return (
        <div className={styles['list']}>
            <button
                type="button"
                className={styles['actionRow']}
                disabled={!canAct() || associationsBusy}
                onClick={onRefreshAssociations}
            >
                <span className={styles['actionBody']}>
                    <span className={styles['actionTitle']}>
                        {associationsBusy ? 'Обновление…' : 'Обновить ассоциации'}
                    </span>
                    <span className={styles['actionHint']}>Пересобрать связи товаров и каталогов</span>
                </span>
                <span className={`${styles['actionIcon']} ${associationsBusy ? styles['actionIconBusy'] : ''}`} aria-hidden>
                    {refreshIconSvg}
                </span>
            </button>

            {/* Отложенный запуск — подстрока к тому же действию, а не отдельный пункт:
                это то же обновление, только не сейчас */}
            <div className={styles['planRow']}>
                {schedule?.scheduled ? (
                    <span className={styles['planState']}>
                        <span className={styles['planIcon']} aria-hidden>{clockIconSvg}</span>
                        Запланировано на {formatRunAt(schedule.runAt)}
                        {schedule.msLeft !== null ? ` · через ${formatLeft(schedule.msLeft)}` : ''}
                    </span>
                ) : (
                    <span className={styles['planState']}>Отложенный запуск не задан</span>
                )}

                <span className={styles['planActions']}>
                    <button type="button" className={styles['planBtn']}
                            disabled={!canAct() || planBusy}
                            onClick={onOpenPlan}>
                        {schedule?.scheduled ? 'Изменить' : 'Запланировать'}
                    </button>
                    {schedule?.scheduled ? (
                        <button type="button" className={styles['planBtn']}
                                disabled={!canAct() || planBusy}
                                onClick={onCancelPlan}>
                            Снять
                        </button>
                    ) : null}
                </span>
            </div>

            {planOpen ? (
                <div className={styles['planForm']}>
                    <input
                        type="datetime-local"
                        className={styles['planInput']}
                        value={planValue}
                        onChange={(event) => setPlanValue(event.target.value)}
                    />
                    <button type="button" className={`${styles['planBtn']} ${styles['planBtnPrimary']}`}
                            disabled={planBusy || !planValue}
                            onClick={onSubmitPlan}>
                        {planBusy ? 'Сохранение…' : 'Сохранить'}
                    </button>
                    <button type="button" className={styles['planBtn']}
                            disabled={planBusy}
                            onClick={() => setPlanOpen(false)}>
                        Отмена
                    </button>
                </div>
            ) : null}

            <button
                type="button"
                className={styles['actionRow']}
                disabled={!canAct() || structureBusy}
                onClick={onRefreshStructure}
            >
                <span className={styles['actionBody']}>
                    <span className={styles['actionTitle']}>
                        {structureBusy ? 'Обновление…' : 'Обновить структуру'}
                    </span>
                    <span className={styles['actionHint']}>Перечитать дерево разделов витрины</span>
                </span>
                <span className={`${styles['actionIcon']} ${structureBusy ? styles['actionIconBusy'] : ''}`} aria-hidden>
                    {refreshIconSvg}
                </span>
            </button>
        </div>
    );
};

export default RefreshActions;
