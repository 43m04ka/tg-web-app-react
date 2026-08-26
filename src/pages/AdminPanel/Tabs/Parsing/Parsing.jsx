import React, {useCallback, useEffect, useMemo, useState} from 'react';
import s from './Parsing.module.scss';
import {API_BASE_URL} from '../../legacy/baseUrl';
import {useFeedback} from '../../Elements/Feedback/Feedback';

const PLATFORMS = [
    {key: 'ps', label: 'PlayStation', region: 'витрина Турции', currency: '₺', hasCommission: false, fallback: 3},
    {key: 'xbox', label: 'Xbox', region: 'витрина США', currency: '$', hasCommission: true, fallback: 6},
    {key: 'india', label: 'PS Индия', region: 'витрина Индии', currency: '₹', hasCommission: true, fallback: 3},
];

const platformByKey = (key) => PLATFORMS.find((item) => item.key === key) || PLATFORMS[0];

const roundUpTo5 = (number) => Math.ceil(number / 5) * 5;

const num = (raw) => {
    const text = String(raw ?? '').trim().replace(',', '.');
    if (!text) return null;

    const value = Number(text);
    return Number.isFinite(value) ? value : null;
};

const toDraft = (rule, index) => ({
    key: `${rule.id ?? 'new'}-${index}`,
    min: String(rule.min ?? 0),
    max: String(rule.max ?? 0),
    type: rule.type === 'FIXED' ? 'FIXED' : 'MULTIPLIER',
    value: String(rule.value ?? 1),
    commission: String(rule.commission ?? 0),
});

const emptyDraft = (previousMax) => ({
    key: `new-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
    min: String(previousMax ?? 0),
    max: String((previousMax ?? 0) + 100),
    type: 'MULTIPLIER',
    value: '1',
    commission: '0',
});

const sameRules = (left, right) => JSON.stringify(left.map(({key, ...rest}) => rest))
    === JSON.stringify(right.map(({key, ...rest}) => rest));

const priceFor = (rule, sourcePrice) => {
    const value = num(rule.value);
    const commission = num(rule.commission) ?? 0;
    if (value === null) return null;

    const raw = rule.type === 'FIXED' ? value + commission : sourcePrice * value + commission;
    if (!Number.isFinite(raw) || raw <= 0) return null;

    return roundUpTo5(raw);
};

const formatRub = (value) => `${Math.round(value).toLocaleString('ru-RU')} ₽`;

const Parsing = () => {
    const {showToast} = useFeedback();

    const [active, setActive] = useState('ps');
    const [drafts, setDrafts] = useState({});
    const [saved, setSaved] = useState({});
    const [loading, setLoading] = useState({});
    const [saving, setSaving] = useState(false);
    const [probe, setProbe] = useState('');

    const platform = platformByKey(active);
    const rules = drafts[active] || [];
    const isLoading = Boolean(loading[active]);
    const isLoaded = Array.isArray(saved[active]);

    const load = useCallback(async (key) => {
        setLoading((prev) => ({...prev, [key]: true}));
        try {
            const response = await fetch(`${API_BASE_URL}/api/parsing/price-rules/${key}`);
            if (!response.ok) throw new Error('Сервер не отдал сетку цен');

            const data = await response.json();
            const list = (Array.isArray(data) ? data : []).map(toDraft);

            setDrafts((prev) => ({...prev, [key]: list}));
            setSaved((prev) => ({...prev, [key]: list}));
        } catch (error) {
            showToast(error.message || 'Не удалось загрузить сетку цен', 'error');
            setDrafts((prev) => ({...prev, [key]: prev[key] || []}));
            setSaved((prev) => ({...prev, [key]: prev[key] || []}));
        } finally {
            setLoading((prev) => ({...prev, [key]: false}));
        }
    }, [showToast]);

    useEffect(() => {
        if (saved[active] === undefined && !loading[active]) load(active);
    }, [active, saved, loading, load]);

    const dirtyKeys = useMemo(() => PLATFORMS
        .map((item) => item.key)
        .filter((key) => Array.isArray(saved[key]) && !sameRules(drafts[key] || [], saved[key])), [drafts, saved]);

    const isDirty = dirtyKeys.includes(active);

    const updateRule = (index, field, value) => setDrafts((prev) => {
        const list = [...(prev[active] || [])];
        list[index] = {...list[index], [field]: value};
        return {...prev, [active]: list};
    });

    const addRule = () => setDrafts((prev) => {
        const list = prev[active] || [];
        const previousMax = list.length ? num(list[list.length - 1].max) : 0;
        return {...prev, [active]: [...list, emptyDraft(previousMax ?? 0)]};
    });

    const removeRule = (index) => setDrafts((prev) => ({
        ...prev,
        [active]: (prev[active] || []).filter((_, i) => i !== index),
    }));

    const rowProblems = useMemo(() => rules.map((rule, index) => {
        const min = num(rule.min);
        const max = num(rule.max);
        const value = num(rule.value);
        const problems = [];

        if (min === null || max === null) problems.push({level: 'error', text: 'Границы интервала не заполнены'});
        else if (max <= min) problems.push({level: 'error', text: 'Конец интервала должен быть больше начала'});

        if (value === null || value <= 0) problems.push({level: 'error', text: 'Значение должно быть больше нуля'});

        const previous = index > 0 ? rules[index - 1] : null;
        if (previous) {
            const previousMax = num(previous.max);
            if (previousMax !== null && min !== null) {
                if (min < previousMax) problems.push({level: 'warn', text: 'Интервал перекрывает предыдущий'});
                else if (min > previousMax) problems.push({level: 'warn', text: `Разрыв: цены от ${previousMax} до ${min} не покрыты`});
            }
        }

        return problems;
    }), [rules]);

    const hasErrors = rowProblems.some((list) => list.some((problem) => problem.level === 'error'));

    const issues = useMemo(() => {
        const result = [];

        rowProblems.forEach((list, index) => list.forEach((problem) => {
            result.push({...problem, text: `Строка ${index + 1}: ${problem.text}`});
        }));

        const first = rules.length ? num(rules[0].min) : null;
        if (first !== null && first > 0) {
            result.push({level: 'warn', text: `Цены до ${first} ${platform.currency} не покрыты — пойдут по запасному множителю ×${platform.fallback}`});
        }

        const last = rules.length ? num(rules[rules.length - 1].max) : null;
        if (last !== null) {
            result.push({level: 'warn', text: `Цены выше ${last} ${platform.currency} не покрыты — пойдут по запасному множителю ×${platform.fallback}`});
        }

        if (!rules.length && isLoaded) {
            result.push({level: 'warn', text: `Сетка пуста — все цены пойдут по запасному множителю ×${platform.fallback}`});
        }

        return result;
    }, [rowProblems, rules, platform, isLoaded]);

    const probeValue = num(probe);
    const probeIndex = probeValue === null ? -1 : rules.findIndex((rule) => {
        const min = num(rule.min);
        const max = num(rule.max);
        return min !== null && max !== null && probeValue > min && probeValue <= max;
    });
    const probeResult = probeIndex >= 0 ? priceFor(rules[probeIndex], probeValue) : null;

    const save = async () => {
        if (hasErrors) {
            showToast('В сетке есть ошибки — исправьте подсвеченные строки', 'error');
            return;
        }

        setSaving(true);
        try {
            const payload = rules.map((rule) => {
                const row = {
                    min: num(rule.min),
                    max: num(rule.max),
                    type: rule.type,
                    value: num(rule.value),
                };
                if (platform.hasCommission) row.commission = num(rule.commission) ?? 0;
                return row;
            });

            const response = await fetch(`${API_BASE_URL}/api/parsing/price-rules/${active}`, {
                method: 'POST',
                headers: {'Content-Type': 'application/json'},
                body: JSON.stringify({rules: payload}),
            });

            if (!response.ok) throw new Error('Сервер не принял сетку цен');

            setSaved((prev) => ({...prev, [active]: rules}));
            showToast(`Сетка «${platform.label}» сохранена`, 'success');
        } catch (error) {
            showToast(error.message || 'Не удалось сохранить сетку цен', 'error');
        } finally {
            setSaving(false);
        }
    };

    const columns = platform.hasCommission ? 6 : 5;

    return (
        <div className={s['screen']}>
            <header className={s['header']}>
                <div className={s['headerTop']}>
                    <h1 className={s['title']}>Сетки цен</h1>
                    <span className={s['counter']}>
                        {isLoading ? 'Загрузка…' : `${rules.length} интервалов · ${platform.region}`}
                    </span>
                    {isDirty ? <span className={s['dirtyMark']}>не сохранено</span> : null}
                </div>

                <div className={s['toolbar']}>
                    <div className={s['segmented']}>
                        {PLATFORMS.map((item) => (
                            <button key={item.key} type="button"
                                    className={`${s['segment']} ${item.key === active ? s['segmentActive'] : ''}`}
                                    onClick={() => setActive(item.key)}>
                                {item.label}
                                {dirtyKeys.includes(item.key) ? <span className={s['segmentDot']}/> : null}
                            </button>
                        ))}
                    </div>

                    <div className={s['probe']}>
                        <span className={s['probeLabel']}>Проверить цену</span>
                        <input className={s['probeInput']} type="number" inputMode="decimal"
                               placeholder="0"
                               value={probe}
                               onChange={(event) => setProbe(event.target.value)}/>
                        <span className={s['probeCurrency']}>{platform.currency}</span>
                        <span className={s['probeArrow']}>→</span>
                        <span className={s['probeResult']}>
                            {probeValue === null
                                ? '—'
                                : (probeResult === null
                                    ? `запасной ×${platform.fallback}`
                                    : formatRub(probeResult))}
                        </span>
                    </div>

                    <div className={s['toolbarEnd']}>
                        <button type="button" className={s['btn']} disabled={isLoading} onClick={() => load(active)}>
                            Обновить
                        </button>
                        <button type="button" className={`${s['btn']} ${s['btnPrimary']}`}
                                disabled={saving || isLoading || !isDirty}
                                onClick={save}>
                            {saving ? 'Сохранение…' : 'Сохранить'}
                        </button>
                    </div>
                </div>

                <p className={s['formula']}>
                    Цена витрины = цена источника × коэффициент
                    {platform.hasCommission ? ' + комиссия' : ''}, округление вверх до 5 ₽.
                    Интервал считается «больше начала и до конца включительно».
                </p>

                {issues.length ? (
                    <ul className={s['issues']}>
                        {issues.map((issue, index) => (
                            <li key={index} className={issue.level === 'error' ? s['issueError'] : s['issueWarn']}>
                                {issue.text}
                            </li>
                        ))}
                    </ul>
                ) : null}
            </header>

            <div className={s['tableWrap']}>
                <table className={s['table']}>
                    <thead>
                        <tr>
                            <th className={s['rangeCol']}>Интервал источника, {platform.currency}</th>
                            <th className={s['typeCol']}>Правило</th>
                            <th className={s['valueCol']}>Значение</th>
                            {platform.hasCommission ? <th className={s['valueCol']}>Комиссия, ₽</th> : null}
                            <th className={s['previewCol']}>На витрине</th>
                            <th className={s['removeCol']}/>
                        </tr>
                    </thead>
                    <tbody>
                        {rules.length === 0 ? (
                            <tr>
                                <td className={s['emptyCell']} colSpan={columns}>
                                    {isLoading ? 'Загрузка…' : 'Интервалов пока нет — добавьте первый'}
                                </td>
                            </tr>
                        ) : rules.map((rule, index) => {
                            const problems = rowProblems[index];
                            const level = problems.some((problem) => problem.level === 'error')
                                ? 'error'
                                : (problems.length ? 'warn' : '');
                            const sample = num(rule.max);
                            const preview = sample === null ? null : priceFor(rule, sample);

                            return (
                                <tr key={rule.key}
                                    className={`${level === 'error' ? s['rowError'] : ''} ${level === 'warn' ? s['rowWarn'] : ''} ${index === probeIndex ? s['rowProbe'] : ''}`}>
                                    <td className={s['rangeCol']}>
                                        <div className={s['range']}>
                                            <span className={s['rangePrefix']}>от</span>
                                            <input className={s['cellInput']} type="number" inputMode="decimal"
                                                   value={rule.min}
                                                   onChange={(event) => updateRule(index, 'min', event.target.value)}/>
                                            <span className={s['rangePrefix']}>до</span>
                                            <input className={s['cellInput']} type="number" inputMode="decimal"
                                                   value={rule.max}
                                                   onChange={(event) => updateRule(index, 'max', event.target.value)}/>
                                        </div>
                                    </td>

                                    <td className={s['typeCol']}>
                                        <div className={s['typeSwitch']}>
                                            <button type="button"
                                                    className={`${s['typeOption']} ${rule.type === 'MULTIPLIER' ? s['typeOptionActive'] : ''}`}
                                                    onClick={() => updateRule(index, 'type', 'MULTIPLIER')}>
                                                Умножить
                                            </button>
                                            <button type="button"
                                                    className={`${s['typeOption']} ${rule.type === 'FIXED' ? s['typeOptionActive'] : ''}`}
                                                    onClick={() => updateRule(index, 'type', 'FIXED')}>
                                                Фикс. цена
                                            </button>
                                        </div>
                                    </td>

                                    <td className={s['valueCol']}>
                                        <div className={s['valueField']}>
                                            <input className={s['cellInput']} type="number" inputMode="decimal" step="any"
                                                   value={rule.value}
                                                   onChange={(event) => updateRule(index, 'value', event.target.value)}/>
                                            <span className={s['unit']}>{rule.type === 'FIXED' ? '₽' : '×'}</span>
                                        </div>
                                    </td>

                                    {platform.hasCommission ? (
                                        <td className={s['valueCol']}>
                                            <input className={s['cellInput']} type="number" inputMode="decimal" step="any"
                                                   value={rule.commission}
                                                   onChange={(event) => updateRule(index, 'commission', event.target.value)}/>
                                        </td>
                                    ) : null}

                                    <td className={s['previewCol']}>
                                        {preview === null ? (
                                            <span className={s['previewMuted']}>—</span>
                                        ) : (
                                            <span className={s['preview']}>
                                                {sample} {platform.currency} → <b>{formatRub(preview)}</b>
                                            </span>
                                        )}
                                    </td>

                                    <td className={s['removeCol']}>
                                        <button type="button" className={s['removeBtn']} aria-label="Удалить интервал"
                                                onClick={() => removeRule(index)}>
                                            ✕
                                        </button>
                                    </td>
                                </tr>
                            );
                        })}
                    </tbody>
                </table>

                <button type="button" className={s['addRow']} onClick={addRule}>
                    + Добавить интервал
                </button>
            </div>
        </div>
    );
};

export default Parsing;
