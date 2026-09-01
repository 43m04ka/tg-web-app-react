import React, {useEffect, useMemo, useState} from 'react';
import {loadNotice} from '../../platform/tasks';
import {toast, toastFail} from '../../platform/notify';
import {Modal} from '../../ui/primitives/Modal';
import {Button} from '../../ui/primitives/Button';
import {Badge, Chip} from '../../ui/primitives/Badge';
import {EmptyState, ErrorState, SkeletonRows} from '../../ui/primitives/Feedback';
import style from './NoticeDetails.module.scss';

const STAT_TITLES = {
    saved: 'сохранено',
    created: 'создано',
    updated: 'обновлено',
    skipped: 'пропущено',
    failed: 'не прошло',
    pageErrors: 'ошибок страниц',
    total: 'всего',
    checked: 'проверено',
    underpriced: 'дешевле нормы',
};

const statTone = (key) => {
    if (key === 'failed' || key === 'pageErrors' || key === 'underpriced') return 'danger';
    if (key === 'skipped') return 'warning';
    if (key === 'saved' || key === 'created' || key === 'updated') return 'positive';
    return 'neutral';
};

export default function NoticeDetails({noticeId, onClose}) {
    const [notice, setNotice] = useState(null);
    const [error, setError] = useState(null);
    const [reason, setReason] = useState('');

    useEffect(() => {
        let alive = true;

        setNotice(null);
        setError(null);

        loadNotice(noticeId)
            .then((payload) => {
                if (alive) setNotice(payload);
            })
            .catch((failure) => {
                if (alive) setError(failure);
            });

        return () => {
            alive = false;
        };
    }, [noticeId]);

    const details = notice?.details || [];

    const reasons = useMemo(() => {
        const counts = new Map();
        details.forEach((item) => {
            const key = item.reason || 'без причины';
            counts.set(key, (counts.get(key) || 0) + 1);
        });
        return [...counts.entries()].sort((left, right) => right[1] - left[1]);
    }, [details]);

    const rows = reason ? details.filter((item) => (item.reason || 'без причины') === reason) : details;

    const copyIds = async () => {
        const ids = rows.map((item) => item.serviceId || item.id).filter(Boolean).join('\n');

        if (!ids) {
            toastFail('Копировать нечего', 'В списке нет идентификаторов');
            return;
        }

        try {
            await navigator.clipboard.writeText(ids);
            toast({tone: 'positive', title: `Скопировано ${rows.length}`});
        } catch {
            toastFail('Буфер обмена недоступен');
        }
    };

    return (
        <Modal
            size="l"
            title={notice?.name || 'Итог задачи'}
            subtitle={notice?.text || ''}
            onClose={onClose}
            footer={(
                <>
                    <span className={style.footerNote}>
                        {notice?.detailsTruncated
                            ? `Показаны первые ${details.length}, ещё ${notice.detailsTruncated} не поместились`
                            : ''}
                    </span>
                    <Button variant="secondary" onClick={copyIds}>Скопировать идентификаторы</Button>
                    <Button variant="primary" onClick={onClose}>Закрыть</Button>
                </>
            )}
        >
            {error ? <ErrorState error={error}/> : null}
            {!error && !notice ? <SkeletonRows count={6}/> : null}

            {notice ? (
                <>
                    {notice.stats ? (
                        <div className={style.stats}>
                            {Object.entries(notice.stats)
                                .filter(([, value]) => typeof value === 'number')
                                .map(([key, value]) => (
                                    <Badge key={key} tone={statTone(key)}>
                                        {STAT_TITLES[key] || key}: {value}
                                    </Badge>
                                ))}
                        </div>
                    ) : null}

                    {reasons.length > 1 ? (
                        <div className={style.reasons}>
                            <Chip active={!reason} onClick={() => setReason('')}>все · {details.length}</Chip>
                            {reasons.map(([key, count]) => (
                                <Chip key={key} active={reason === key} onClick={() => setReason(key)}>
                                    {key} · {count}
                                </Chip>
                            ))}
                        </div>
                    ) : null}

                    {rows.length ? (
                        <div className={style.tableWrap}>
                            <table className={style.table}>
                                <thead>
                                    <tr>
                                        <th className={style.colId}>Идентификатор</th>
                                        <th>Позиция</th>
                                        <th className={style.colReason}>Причина</th>
                                        <th className={style.colLink}>Источник</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {rows.map((item, index) => (
                                        <tr key={`${item.serviceId || item.id || index}`}>
                                            <td className={style.mono}>{item.serviceId || item.id || '—'}</td>
                                            <td className={style.name}>{item.name || '—'}</td>
                                            <td className={style.reason}>{item.reason || '—'}</td>
                                            <td>
                                                {item.link ? (
                                                    <a
                                                        className={style.link}
                                                        href={item.link}
                                                        target="_blank"
                                                        rel="noreferrer"
                                                    >
                                                        открыть
                                                    </a>
                                                ) : '—'}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    ) : (
                        <EmptyState
                            title="Подробностей нет"
                            text="Задача завершилась без непрошедших позиций"
                        />
                    )}
                </>
            ) : null}
        </Modal>
    );
}
