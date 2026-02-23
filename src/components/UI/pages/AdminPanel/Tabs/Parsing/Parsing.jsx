import React, {useEffect, useState} from 'react';
import s from './parsing_styles.module.css';

const ParserCard = ({title, type, apiEndpoint, placeholder}) => {
    const [formData, setFormData] = useState({
        catalogId: '', bdPath: '', countPages: 1, promoDate: '', isShallow: false
    });
    const [loading, setLoading] = useState(false);
    const [status, setStatus] = useState({text: '', type: ''});

    const handleChange = (field, value) => {
        setFormData(prev => ({...prev, [field]: value}));
    };

    const handleStart = async () => {
        setLoading(true);
        setStatus({text: '', type: ''});

        try {
            const payload = {
                ...formData, endDataPromotion: formData.promoDate ? new Date(formData.promoDate).getTime() : null
            };

            const response = await fetch(apiEndpoint, {
                method: 'POST', headers: {'Content-Type': 'application/json'}, body: JSON.stringify(payload)
            });

            const result = await response.json();
            if (response.ok) {
                setStatus({text: `✅ ${result.message || 'Готово'}`, type: 'success'});
            } else {
                setStatus({text: `❌ Ошибка: ${result.error || 'Сервер отклонил запрос'}`, type: 'error'});
            }
        } catch (err) {
            setStatus({text: '❌ Ошибка сети', type: 'error'});
        } finally {
            setLoading(false);
        }
    };

    return (<div className={s.card}>
        <h2 className={s[`${type}-title`]}>{title}</h2>
        <div className={s.field}>
            <label>URL каталога(без указателя страницы)</label>
            <input
                type="text"
                placeholder={placeholder}
                value={formData.catalogId}
                onChange={(e) => handleChange('catalogId', e.target.value)}
            />
        </div>
        <div className={s.field}>
            <label>Путь к базе (bdPath)</label>
            <input
                type="text"
                placeholder="Напр: ps_games"
                value={formData.bdPath}
                onChange={(e) => handleChange('bdPath', e.target.value)}
            />
        </div>
        <div className={s.field}>
            <label>Кол-во страниц</label>
            <input
                type="number"
                min="1"
                value={formData.countPages}
                onChange={(e) => handleChange('countPages', e.target.value)}
            />
        </div>
        <div className={s.field}>
            <label>Дата окончания акции</label>
            <input
                type="date"
                value={formData.promoDate}
                onChange={(e) => handleChange('promoDate', e.target.value)}
            />
        </div>
        <div className={s['checkbox-field']}>
            <input
                type="checkbox"
                id={`shallow-${type}`}
                checked={formData.isShallow}
                onChange={(e) => handleChange('isShallow', e.target.checked)}
            />
            <label htmlFor={`shallow-${type}`}>Поверхностный парсинг</label>
        </div>
        <button
            className={`${s[`${type}-btn`]} ${s.mainBtn}`}
            onClick={handleStart}
            disabled={loading}
        >
            {loading ? 'В процессе...' : `Запустить ${type.toUpperCase()} парсинг`}
        </button>
        {status.text && (<div className={`${s.status} ${s[status.type]}`} style={{display: 'block'}}>
            {status.text}
        </div>)}

        <PriceGrid type={type}/>
    </div>);
};

const PriceGrid = ({type}) => {
    const [rules, setRules] = useState([]);
    const [saving, setSaving] = useState(false);

    useEffect(() => {
        fetch('https://gwstorebot.ru/api/admin/price-rules/'+type)
            .then(res => res.ok ? res.json() : [])
            .then(data => setRules(data.length ? data : (type === 'xb' ? [{
                min: 0, max: 100, type: 'MULTIPLIER', value: 1, commission: 0
            }] : [{
                min: 0, max: 100, type: 'MULTIPLIER', value: 1
            }])))
            .catch(() => console.error("Ошибка загрузки цен"));
    }, []);

    const addRow = () => {
        const lastMax = rules.length > 0 ? rules[rules.length - 1].max : 0;
        setRules([...rules, (type === 'xb' ? {
            min: 0, max: 100, type: 'MULTIPLIER', value: 1, commission: 0
        } : {
            min: 0, max: 100, type: 'MULTIPLIER', value: 1
        })]);
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
            const res = await fetch('https://gwstorebot.ru/api/admin/price-rules/'+type, {
                method: 'POST', headers: {'Content-Type': 'application/json'}, body: JSON.stringify({rules})
            });
            if (res.ok) alert('Сетка сохранена!');
        } catch (e) {
            alert('Ошибка при сохранении');
        } finally {
            setSaving(false);
        }
    };

    return (<div>
        <h2 className={s['xb-title']} style={{color: '#28a745'}}>Сетка цен</h2>
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
            {rules.map((r, i) => (<tr key={i}>
                <td><input type="number" value={r.min} onChange={e => updateRule(i, 'min', e.target.value)}/>
                </td>
                <td><input type="number" value={r.max} onChange={e => updateRule(i, 'max', e.target.value)}/>
                </td>
                <td>
                    <select value={r.type} onChange={e => updateRule(i, 'type', e.target.value)}>
                        <option value="MULTIPLIER">*</option>
                        <option value="FIXED">Fix</option>
                    </select>
                </td>
                <td><input type="number" value={r.value}
                           onChange={e => updateRule(i, 'value', e.target.value)}/></td>
                {type === 'xb' && <td><input type="number" value={r.value}
                                             onChange={e => updateRule(i, 'value', e.target.value)}/></td>}
                <td style={{textAlign: 'center', cursor: 'pointer', color: '#ff4d4d'}}
                    onClick={() => deleteRow(i)}>✕
                </td>
            </tr>))}
            </tbody>
        </table>
        <button className={s['add-btn']} onClick={addRow}>+ Добавить интервал</button>
        <button className={s['xb-btn']} onClick={handleSave} disabled={saving}>
            {saving ? 'Сохранение...' : 'Сохранить настройки цен'}
        </button>
    </div>);
};

export default function Parsing() {
    return (<div className={s.dashboard}>
        <ParserCard
            title="Парсер Playstation"
            type="ps"
            apiEndpoint="https://gwstorebot.ru/api/admin/start-parse-ps"
            placeholder="https://store.playstation.com/en-tr/category/3f772501-f6f8-49b7-abac-874a88ca4897"
        />
        <ParserCard
            title="Парсер XBDeals"
            type="xb"
            apiEndpoint="https://gwstorebot.ru/api/admin/start-parse-xbdeals"
            placeholder="https://xbdeals.net..."
        />
    </div>);
}
