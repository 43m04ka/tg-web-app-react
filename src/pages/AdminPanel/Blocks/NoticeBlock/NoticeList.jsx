import React, {useState} from 'react';
import s from './NoticeList.module.scss';

// Что означает вид проблемы в расширенной части — словами, а не кодом из ответа.
const PROBLEM_KINDS = {
    skipped: 'Нет цены',
    failed: 'Ошибка',
    page: 'Страница'
};

const closeIcon = (
    <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M18 6 6 18M6 6l12 12" strokeLinecap="round" />
    </svg>
);

const chevronIcon = (
    <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="m6 9 6 6 6-6" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
);

const formatDuration = (ms) => {
    if (!ms || !isFinite(ms) || ms < 1000) return null;

    const minutes = Math.round(ms / 60000);
    if (minutes < 1) return `${Math.round(ms / 1000)} с`;
    if (minutes < 60) return `${minutes} мин`;

    return `${Math.floor(minutes / 60)} ч ${minutes % 60} мин`;
};

const formatTime = (timestamp) => {
    if (!timestamp) return null;

    const date = new Date(timestamp);
    return `${date.getHours().toString().padStart(2, '0')}:${date.getMinutes().toString().padStart(2, '0')}`;
};

/**
 * Итоги завершённых задач: сводка одной строкой плюс раскрываемая расширенная часть
 * со списком позиций, не доехавших до базы.
 */
const NoticeList = ({embedded = false, notices, loading, error, details, detailsLoading, loadDetails, dismissNotice}) => {
    const [openIds, setOpenIds] = useState({});

    const toggleDetails = (notice) => {
        const isOpen = !openIds[notice.id];
        setOpenIds((prev) => ({...prev, [notice.id]: isOpen}));

        if (isOpen) loadDetails(notice.id);
    };

    const wrap = (inner) => (
        <div className={`${s.container} ${embedded ? s.embedded : ''}`}>{inner}</div>
    );

    if (loading) return wrap(<span className={s.emptyHint}>Загрузка итогов…</span>);
    if (error) return wrap(<span className={s.errorInline}>Ошибка: {error}</span>);
    if (!notices.length) return wrap(<p className={s.emptyHint}>Завершённых задач пока нет</p>);

    return (
        <div className={`${s.container} ${embedded ? s.embedded : ''}`}>
            {notices.map((notice) => {
                const isOpen = Boolean(openIds[notice.id]);
                const rows = details[notice.id];
                const duration = formatDuration(notice.stats?.durationMs);
                const time = formatTime(notice.createdAt);

                return (
                    <div key={notice.id} className={`${s.card} ${s[notice.level] || s.info}`}>
                        <div className={s.cardHeader}>
                            <span className={s.levelMark} aria-hidden />
                            <div className={s.headerText}>
                                <span className={s.name}>{notice.name}</span>
                                <span className={s.meta}>
                                    {[notice.stats?.catalogPath, time, duration].filter(Boolean).join(' · ')}
                                </span>
                            </div>
                            <button
                                type="button"
                                className={s.closeBtn}
                                onClick={() => dismissNotice(notice.id)}
                                title="Закрыть уведомление"
                                aria-label="Закрыть уведомление"
                            >
                                {closeIcon}
                            </button>
                        </div>

                        <p className={s.summary}>{notice.text}</p>

                        {notice.detailsCount > 0 ? (
                            <>
                                <button
                                    type="button"
                                    className={`${s.detailsToggle} ${isOpen ? s.open : ''}`}
                                    onClick={() => toggleDetails(notice)}
                                    aria-expanded={isOpen}
                                >
                                    <span className={s.chevron}>{chevronIcon}</span>
                                    {isOpen ? 'Скрыть подробности' : `Подробности · ${notice.detailsCount}`}
                                </button>

                                {isOpen ? (
                                    <div className={s.details}>
                                        {detailsLoading[notice.id] && !rows ? (
                                            <span className={s.emptyHint}>Загрузка…</span>
                                        ) : (
                                            <>
                                                {(rows || []).map((row, index) => (
                                                    <div key={`${row.serviceId || row.name}-${index}`} className={s.detailRow}>
                                                        <div className={s.detailHead}>
                                                            <span className={`${s.kindTag} ${s[`kind_${row.kind}`] || ''}`}>
                                                                {PROBLEM_KINDS[row.kind] || row.kind}
                                                            </span>
                                                            {row.link ? (
                                                                <a
                                                                    className={s.detailName}
                                                                    href={row.link}
                                                                    target="_blank"
                                                                    rel="noreferrer"
                                                                    title={row.link}
                                                                >
                                                                    {row.name || row.serviceId || 'Без названия'}
                                                                </a>
                                                            ) : (
                                                                <span className={s.detailName}>
                                                                    {row.name || row.serviceId || 'Без названия'}
                                                                </span>
                                                            )}
                                                        </div>
                                                        <span className={s.detailReason}>{row.reason}</span>
                                                        {row.serviceId ? (
                                                            <span className={s.detailId}>{row.serviceId}</span>
                                                        ) : null}
                                                    </div>
                                                ))}
                                                {notice.detailsTruncated > 0 ? (
                                                    <span className={s.emptyHint}>
                                                        Показаны первые {notice.detailsCount - notice.detailsTruncated} из{' '}
                                                        {notice.detailsCount}
                                                    </span>
                                                ) : null}
                                            </>
                                        )}
                                    </div>
                                ) : null}
                            </>
                        ) : null}
                    </div>
                );
            })}
        </div>
    );
};

export default NoticeList;
