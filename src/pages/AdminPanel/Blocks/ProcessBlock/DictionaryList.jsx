import React from 'react';
import s from './DictionaryList.module.css';

const DictionaryList = ({embedded = false, items, loading, error, updateNotificationStatus}) => {
    const handleToggleChange = (id, event) => {
        const isChecked = event.target.checked;
        updateNotificationStatus(id, isChecked);
    };

    const wrap = (inner) => (
        <div className={`${s.container} ${embedded ? s.embedded : ''} ${s['custom-scrollbar']}`}>{inner}</div>
    );

    if (loading) return wrap('Загрузка данных…');
    if (error) return wrap(<span className={s.errorInline}>Ошибка: {error}</span>);

    return (
        <div className={`${s.container} ${embedded ? s.embedded : ''} ${s['custom-scrollbar']}`}>
            <div>
                {items.map((item) => (
                    <div key={item.id} className={`${s.card} ${s['card-hover-effect']}`}>
                        <div className={s['card-header']}>
                            <div className={s['card-header-left']}>
                                <span className={s['notify-label']}>Уведомить о завершении</span>
                                <span className={s.badge}>{item.name}</span>
                            </div>
                            <label className={s.switch} title="Отметить как обработанное">
                                <input
                                    type="checkbox"
                                    defaultChecked={item.notification}
                                    onChange={(e) => handleToggleChange(item.id, e)}
                                />
                                <span className={`${s.slider} ${s.round}`}></span>
                            </label>
                        </div>
                        <p className={s['card-text']}>{item.text}</p>
                        <div className={s['progress-bar-container']}>
                            <div
                                className={`${s['progress-bar']} ${s['progress-bar-animation']}`}
                                style={{width: `${item.progress}%`}}
                            />
                        </div>
                        <span className={s['progress-text']}>Прогресс: {item.progress.toFixed(2)}%</span>
                    </div>
                ))}
            </div>
            {items.length === 0 ? <p className={s.emptyHint}>Нет активных задач</p> : null}
        </div>
    );
};

export default DictionaryList;
