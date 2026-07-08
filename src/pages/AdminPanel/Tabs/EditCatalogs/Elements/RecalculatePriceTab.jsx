import React, { useState, useEffect } from 'react';
import s from './RecalculatePriceTab.module.scss';
import useGlobalData from '../../../../../hooks/useGlobalData';

export default function RecalculateModalContent({ catalogId, catalogsList}) {
    const [rules, setRules] = useState([]);
    const [loading, setLoading] = useState(false);
    const [fetchingRules, setFetchingRules] = useState(true);
    const {pageList} = useGlobalData();

    // Ищем каталог в уже имеющемся массиве прямо на клиенте
    const currentCatalog = (catalogsList || []).find(c => c.id === catalogId);
    const catalogPath = currentCatalog ? currentCatalog.path : '';
    
    const platform = pageList.find(page => page.id === currentCatalog.structurePageId).type;

    useEffect(() => {
        setFetchingRules(true);
        fetch(`https://gwstorebot.ru/api/parsing/price-rules/${platform}`)
            .then(res => res.ok ? res.json() : [])
            .then(data => {
                setRules(data.length ? data : [{ min: 0, max: 100, type: 'MULTIPLIER', value: 1, ...(platform === 'xbox' && { commission: 0 }) }]);
            })
            .catch(() => console.error("Ошибка загрузки правил цен"))
            .finally(() => setFetchingRules(false));
    }, [platform, catalogId]);

    const addRow = () => {
        setRules([...rules, { min: 0, max: 100, type: 'MULTIPLIER', value: 1, ...(platform === 'xbox' && { commission: 0 }) }]);
    };

    const updateRule = (idx, field, val) => {
        const updated = [...rules];
        updated[idx][field] = field === 'type' ? val : +val;
        setRules(updated);
    };

    const deleteRow = (idx) => setRules(rules.filter((_, i) => i !== idx));

    const handleRecalculate = async () => {
        setLoading(true);
        try {
            const res = await fetch('https://gwstorebot.ru/api/catalog/recalculate', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ catalogId, rules })
            });
            const data = await res.json();
            if (res.ok) {
                alert(data.message || 'Цены каталога успешно пересчитаны!');
            } else {
                alert('Ошибка: ' + data.error);
            }
        } catch (e) {
            alert('Ошибка сети при пересчете цен');
        } finally {
            setLoading(false);
        }
    };

    return (
        <>
            {fetchingRules ? (
                <div className={s.loadingText}>Загрузка правил из БД...</div>
            ) : (
                <div>
                    <table className={s.priceTable}>
                        <thead>
                            <tr>
                                <th>Мин</th>
                                <th>Макс</th>
                                <th>Тип</th>
                                <th>Знач</th>
                                {platform === 'xbox' && <th>Комиссия</th>}
                                <th></th>
                            </tr>
                        </thead>
                        <tbody>
                            {rules.map((r, i) => (
                                <tr key={i}>
                                    <td><input type="number" value={r.min} onChange={e => updateRule(i, 'min', e.target.value)} /></td>
                                    <td><input type="number" value={r.max} onChange={e => updateRule(i, 'max', e.target.value)} /></td>
                                    <td>
                                        <select value={r.type} onChange={e => updateRule(i, 'type', e.target.value)}>
                                            <option value="MULTIPLIER">*</option>
                                            <option value="FIXED">Fix</option>
                                        </select>
                                    </td>
                                    <td><input type="number" value={r.value} onChange={e => updateRule(i, 'value', e.target.value)} /></td>
                                    {platform === 'xbox' && <td><input type="number" value={r.commission} onChange={e => updateRule(i, 'commission', e.target.value)} /></td>}
                                    <td className={s.deleteCell} onClick={() => deleteRow(i)}>✕</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>

                    <button className={s.addBtn} onClick={addRow}>
                        + Добавить интервал
                    </button>
                    
                    <div className={s.actionsRow}>
                        <button className={s.submitBtn} onClick={handleRecalculate} disabled={loading}>
                          {loading ? 'Пересчет...' : 'Запустить пересчет позиций'}
                        </button>
                    </div>
                </div>
            )}
        </>
    );
}