import React from 'react';
import useDictionaryItems from './useDictionaryItems'; // Используем новый хук
import './DictionaryList.css';

const DictionaryList = () => {
    const { items, loading, error, updateNotificationStatus } = useDictionaryItems();

    const handleToggleChange = (id, event) => {
        const isChecked = event.target.checked;
        updateNotificationStatus(id, isChecked);
    };

    if (loading) return <div className="container custom-scrollbar">Загрузка данных...</div>;
    if (error) return <div className="container error custom-scrollbar">Ошибка: {error}</div>;

    return (
        <div className="container custom-scrollbar">
            <div>
                {items.map(item => (
                    <div key={item.id} className="card card-hover-effect">
                        <div className="card-header">
                            <div className="card-header-left">
                                <span className="notify-label">Уведомить о завершении</span>
                                <span className="badge">{item.name}</span>
                            </div>
                            <label className="switch" title="Отметить как обработанное">
                                <input
                                    type="checkbox"
                                    defaultValue={item.notification}
                                    onChange={(e) => handleToggleChange(item.id, e)}
                                />
                                <span className="slider round"></span>
                            </label>
                        </div>
                        <p className="card-text">{item.text}</p>
                        <div className="progress-bar-container">
                            <div
                                className="progress-bar progress-bar-animation"
                                style={{ width: `${item.progress}%` }}
                            />
                        </div>
                        <span className="progress-text">Прогресс: **{item.progress.toFixed(4)}%**</span>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default DictionaryList;