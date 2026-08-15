import React, {useState} from 'react';
import s from './DictionaryList.module.css';

const DictionaryList = ({embedded = false, items, loading, error, updateNotificationStatus, cancelProcess}) => {
    const [cancellingIds, setCancellingIds] = useState({});

    const handleToggleChange = (id, event) => {
        const isChecked = event.target.checked;
        updateNotificationStatus(id, isChecked);
    };

    const handleCancel = async (id) => {
        setCancellingIds((prev) => ({...prev, [id]: true}));
        await cancelProcess(id);
    };

    // Момент окончания сервер отдаёт своими часами — переводим в местное время браузера
    const formatTime = (etaAt) => {
        if (!etaAt) return null;

        const completionTime = new Date(etaAt);
        const hours = completionTime.getHours().toString().padStart(2, '0');
        const minutes = completionTime.getMinutes().toString().padStart(2, '0');

        return `${hours}:${minutes}`;
    };

    const wrap = (inner) => (
        <div className={`${s.container} ${embedded ? s.embedded : ''} ${s['custom-scrollbar']}`}>{inner}</div>
    );

    if (loading) return wrap(<span className={s.emptyHint}>Загрузка данных…</span>);
    if (error) return wrap(<span className={s.errorInline}>Ошибка: {error}</span>);

    return (
        <div className={`${s.container} ${embedded ? s.embedded : ''} ${s['custom-scrollbar']}`}>
            <div>
                {items.map((item) => {
                    const waiting = item.state === 'waiting';

                    return (
                    <div key={item.id} className={`${s.card} ${waiting ? s.waiting : ''}`}>
                        <div className={s['card-header']}>
                            <div className={s['card-header-left']}>
                                <span className={s.badge}>{item.name}</span>
                                <span className={s['card-text']}>{item.text}</span>
                            </div>
                            <label className={s['notify-control']} title="Уведомить о завершении">
                                <span className={s['notify-label']}>Уведомление Tg</span>
                                <span className={s.switch}>
                                    <input
                                        type="checkbox"
                                        defaultChecked={item.notification}
                                        onChange={(e) => handleToggleChange(item.id, e)}
                                    />
                                    <span className={`${s.slider} ${s.round}`}></span>
                                </span>
                            </label>
                        </div>
                        <div className={s['progress-bar-container']}>
                            <div
                                className={`${s['progress-bar']} ${s['progress-bar-animation']}`}
                                style={{width: `${item.progress}%`}}
                            />
                        </div>
                        <div className={s['card-footer']}>
                            <span className={s['progress-text']}>
                                {waiting ? 'Ожидание' : `${item.progress.toFixed(1)}%`}
                                {item.etaText ? (
                                    <span className={s['estimated-time']}>
                                        {waiting ? ' · старт через ' : ' · осталось '}{item.etaText}
                                        {item.etaAt ? ` (до ${formatTime(item.etaAt)})` : ''}
                                    </span>
                                ) : (
                                    <span className={s['estimated-time']}>{' · подсчёт…'}</span>
                                )}
                            </span>
                            {cancelProcess ? (
                                <button
                                    type="button"
                                    className={s['cancel-button']}
                                    disabled={item.cancelled || cancellingIds[item.id]}
                                    onClick={() => handleCancel(item.id)}
                                >
                                    {item.cancelled || cancellingIds[item.id]
                                        ? 'Отменяется…'
                                        : waiting ? 'Убрать из очереди' : 'Отменить'}
                                </button>
                            ) : null}
                        </div>
                    </div>
                    );
                })}
            </div>
            {items.length === 0 ? <p className={s.emptyHint}>Нет активных задач</p> : null}
        </div>
    );
};

export default DictionaryList;
