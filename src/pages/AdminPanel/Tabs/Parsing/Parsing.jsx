import React, {useEffect, useState} from 'react';
import s from './parsing_styles.module.css';
import {API_BASE_URL} from '../../../../hooks/useServerRoutes/baseUrl';

const PriceGrid = ({ type, title, color }) => {
    const [rules, setRules] = useState([]);
    const [saving, setSaving] = useState(false);
    
    // Синхронизация параметров с ключами вашего бэкенда (ps, xbox, india)
    const platform = type === 'xb' ? 'xbox' : type;

    useEffect(() => {
        fetch(`${API_BASE_URL}/api/parsing/price-rules/${platform}`)
            .then(res => res.ok ? res.json() : [])
            .then(data => {
                if (data.length) {
                    // Присваиваем временные id для стабильного рендеринга строк в React
                    setRules(data.map((r, i) => ({ ...r, id: r.id || i })));
                } else {
                    // Дефолтная строка, если база пустая
                    setRules([{
                        id: Date.now(),
                        min: 0,
                        max: 100,
                        type: 'MULTIPLIER',
                        value: 1,
                        ...(type === 'xb' && { commission: 0 })
                    }]);
                }
            })
            .catch(() => console.error(`Ошибка загрузки цен для платформы: ${platform}`));
    }, [platform, type]);

    const addRow = () => {
        const lastMax = rules.length > 0 ? rules[rules.length - 1].max : 0;
        const newRow = {
            id: Date.now() + Math.random(),
            min: lastMax ? lastMax + 1 : 0, // Автоматический расчет следующего шага
            max: lastMax ? lastMax + 100 : 100,
            type: 'MULTIPLIER',
            value: 1,
            ...(type === 'xb' && { commission: 0 })
        };
        setRules([...rules, newRow]);
    };

    const updateRule = (idx, field, val) => {
        const updated = [...rules];
        updated[idx][field] = field === 'type' ? val : +val;
        setRules(updated);
    };

    const deleteRow = (idx) => setRules(rules.filter((_, i) => i !== idx));

    const handleSave = async () => {
        setSaving(true);
        try {
            // Очищаем id и принудительно проставляем комиссию 0, если её нет (для защиты от NOT NULL в бэке индии)
            const cleanRules = rules.map(({ id, ...rest }) => ({
                ...rest,
                commission: rest.commission !== undefined ? rest.commission : 0
            }));
            
            const res = await fetch(`${API_BASE_URL}/api/parsing/price-rules/${platform}`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ rules: cleanRules })
            });

            if (res.ok) alert(`Сетка "${title}" успешно сохранена!`);
            else alert('Ошибка при сохранении на сервере');
        } catch (e) {
            alert('Ошибка сети при отправке запроса');
        } finally {
            setSaving(false);
        }
    };

    return (
        <div className={s.card} style={{ marginBottom: '24px' }}>
            <h2 className={s['xb-title']} style={{ color: color || '#28a745' }}>{title}</h2>
            <table className={s['price-table']}>
                <thead>
                    <tr>
                        <th>Мин</th>
                        <th>Макс</th>
                        <th>Тип</th>
                        <th>Знач</th>
                        {type === 'xb' && <th>Комиссия</th>}
                        <th></th>
                    </tr>
                </thead>
                <tbody>
                    {rules.map((r, i) => (
                        <tr key={r.id || i}>
                            <td>
                                <input type="number" value={r.min} onChange={e => updateRule(i, 'min', e.target.value)} />
                            </td>
                            <td>
                                <input type="number" value={r.max} onChange={e => updateRule(i, 'max', e.target.value)} />
                            </td>
                            <td>
                                <select value={r.type} onChange={e => updateRule(i, 'type', e.target.value)}>
                                    <option value="MULTIPLIER">*</option>
                                    <option value="FIXED">Fix</option>
                                </select>
                            </td>
                            <td>
                                <input type="number" step="any" value={r.value} onChange={e => updateRule(i, 'value', e.target.value)} />
                            </td>
                            {type === 'xb' && (
                                <td>
                                    <input type="number" value={r.commission || 0} onChange={e => updateRule(i, 'commission', e.target.value)} />
                                </td>
                            )}
                            <td style={{ textAlign: 'center', cursor: 'pointer', color: '#ff4d4d' }} onClick={() => deleteRow(i)}>
                                ✕
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
            <button className={s['add-btn']} onClick={addRow}>+ Добавить интервал</button>
            <button className={`${s['xb-btn']} ${s.mainBtn}`} onClick={handleSave} disabled={saving}>
                {saving ? 'Сохранение...' : `Сохранить настройки цен`}
            </button>
        </div>
    );
};

export default function PriceManagement() {
    return (
        <div className={s.dashboard} style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))', gap: '20px', padding: '20px' }}>
            <PriceGrid type="ps" title="Сетка цен Playstation" color="#0070d1" />
            <PriceGrid type="xb" title="Сетка цен Xbox" color="#28a745" />
            <PriceGrid type="india" title="Сетка цен India (PS)" color="#ff9933" />
        </div>
    );
}