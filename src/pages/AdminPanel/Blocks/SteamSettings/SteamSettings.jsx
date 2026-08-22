import React, {useEffect, useState} from 'react';
import {useServer} from '../../useServer';
import useData from '../../useData';
import styles from './SteamSettings.module.scss';

const FIELDS = [
    {
        key: 'steam_commission_percent',
        label: 'Наша наценка',
        hint: 'Меняем свободно — это наша маржа',
    },
    {
        key: 'aurapay_acquiring_percent',
        label: 'Комиссия AuraPay за приём (СБП)',
        hint: 'Менять только при смене тарифа кассы',
        tariff: true,
    },
    {
        key: 'aurapay_payout_percent',
        label: 'Комиссия AuraPay за зачисление в Steam',
        hint: 'Менять только при смене тарифа кассы',
        tariff: true,
    },
];

export default function SteamSettings() {
    const {getSystemSettings, updateSystemSetting} = useServer();
    const {authenticationData} = useData();

    const [values, setValues] = useState({});
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [savingKey, setSavingKey] = useState(null);

    const [loadResult, setLoadResult] = useState(null);

    useEffect(() => {
        getSystemSettings(setLoadResult);
    }, []);

    useEffect(() => {
        if (!loadResult) return;
        if (loadResult.error) {
            setError(loadResult.error);
        } else {
            const next = {};
            FIELDS.forEach(({key}) => {
                next[key] = loadResult?.settings?.[key]?.value ?? '';
            });
            setValues(next);
        }
        setLoading(false);
    }, [loadResult]);

    const handleBlur = (key) => async (event) => {
        const raw = event.target.value.trim();
        const num = Number(raw);
        // На 100 серверная формула делится на ноль, поэтому верхняя граница не включена
        if (raw === '' || Number.isNaN(num) || num < 0 || num >= 100) {
            setError('Процент должен быть числом от 0 до 100 (не включая 100)');
            return;
        }
        setError(null);
        setSavingKey(key);
        await updateSystemSetting((result) => {
            if (result?.error) setError(result.error);
        }, authenticationData, key, num, 'number');
        setSavingKey(null);
    };

    const handleChange = (key) => (event) => {
        setValues(prev => ({...prev, [key]: event.target.value}));
    };

    if (loading) {
        return <div className={`${styles.steamSettings} ${styles.loadingMsg}`}>Загрузка…</div>;
    }

    return (
        <div className={styles.steamSettings}>
            {error && <div className={styles.errorMsg}>{error}</div>}
            {FIELDS.map(({key, label, hint, tariff}) => (
                <div key={key} className={`${styles.row} ${tariff ? styles.tariffRow : ''}`}>
                    <div className={styles.labelBlock}>
                        <span className={styles.title}>{label}</span>
                        <span className={styles.hint}>{hint}</span>
                    </div>
                    <div className={styles.inputWrapper}>
                        <input
                            type="number"
                            min="0"
                            max="99"
                            className={styles.input}
                            value={values[key] ?? ''}
                            onChange={handleChange(key)}
                            onBlur={handleBlur(key)}
                            disabled={savingKey === key}
                        />
                        <span className={styles.percentSign}>%</span>
                    </div>
                </div>
            ))}
        </div>
    );
}
