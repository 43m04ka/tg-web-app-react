import React from 'react';
import useDictionaryItems from './useDictionaryItems';
import s from './DictionaryList.module.css';

const DictionaryList = () => {
    const { items, loading, error, updateNotificationStatus } = useDictionaryItems();

    const handleToggleChange = (id, event) => {
        const isChecked = event.target.checked;
        updateNotificationStatus(id, isChecked);
    };

    if (loading) return <div className={`${s.container} ${s['custom-scrollbar']}`}>Загрузка данных...</div>;
    if (error) return <div className={`${s.container} ${s.error} ${s['custom-scrollbar']}`}>Ошибка: {error}</div>;

    return (
        <div className={`${s.container} ${s['custom-scrollbar']}`}>
            <div>
                {items.map(item => (
                    <div key={item.id} className={`${s.card} ${s['card-hover-effect']}`}>
                        <div className={s['card-header']}>
                            <div className={s['card-header-left']}>
                                <span className={s['notify-label']}>Уведомить о завершении</span>
                                <span className={s.badge}>{item.name}</span>
                            </div>
                            <label className={s.switch} title="Отметить как обработанное">
                                <input
                                    type="checkbox"
                                    defaultChecked={item.notification} // Заменил defaultValue на defaultChecked для чекбокса
                                    onChange={(e) => handleToggleChange(item.id, e)}
                                />
                                <span className={`${s.slider} ${s.round}`}></span>
                            </label>
                        </div>
                        <p className={s['card-text']}>{item.text}</p>
                        <div className={s['progress-bar-container']}>
                            <div
                                className={`${s['progress-bar']} ${s['progress-bar-animation']}`}
                                style={{ width: `${item.progress}%` }}
                            />
                        </div>
                        <span className={s['progress-text']}>
                            Прогресс: **{item.progress.toFixed(4)}%**
                        </span>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default DictionaryList;
