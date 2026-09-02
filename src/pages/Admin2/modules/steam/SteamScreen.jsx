import React, {useCallback, useEffect, useMemo, useState} from 'react';
import {
    Button,
    ErrorState,
    Field,
    Grid,
    Input,
    Note,
    Panel,
    SkeletonRows,
    Stat,
    StatRow,
    Workspace,
} from '../../ui';
import {usePageHeader} from '../../shell/pageHeader';
import {useResource} from '../../platform/useResource';
import {useMutation} from '../../platform/useMutation';
import {keys} from '../../platform/resources';
import {fetchSettings, updateSetting} from './api';
import style from './SteamScreen.module.scss';

const PERCENTS = [
    {key: 'steam_commission_percent', title: 'Наша маржа, %', hint: 'Сколько зарабатываем сверх издержек'},
    {key: 'aurapay_acquiring_percent', title: 'Приём платежа, %', hint: 'Тариф AuraPay за СБП'},
    {key: 'aurapay_payout_percent', title: 'Выплата на баланс, %', hint: 'Тариф AuraPay за зачисление в Steam'},
];

const percentValid = (raw) => {
    const parsed = Number(String(raw).replace(',', '.'));
    return Number.isFinite(parsed) && parsed >= 0 && parsed < 100;
};

const compute = (topup, {margin, acquiring, payout}) => {
    const amount = Number(topup);
    if (!Number.isFinite(amount) || amount <= 0) return null;

    const acquiringRate = 1 - acquiring / 100;
    if (acquiringRate <= 0) return null;

    const payoutCost = amount * (1 + payout / 100);
    const revenueNeeded = payoutCost * (1 + margin / 100);
    const total = Math.ceil(revenueNeeded / acquiringRate);
    const revenue = total * acquiringRate;

    return {
        total,
        invoiceAmount: Math.round(revenue * 100) / 100,
        profit: Math.round(revenue - payoutCost),
    };
};

export default function SteamScreen() {
    usePageHeader('Steam');

    const settings = useResource(keys.settings, fetchSettings);
    const values = settings.data?.settings || {};

    const write = useMutation(updateSetting, {invalidates: [keys.settings], done: 'Процент сохранён'});

    const [percents, setPercents] = useState({});
    const [topup, setTopup] = useState('1000');

    useEffect(() => {
        setPercents(Object.fromEntries(PERCENTS.map((item) => [item.key, String(values[item.key]?.value ?? '')])));
    }, [settings.data]);

    const rates = useMemo(() => ({
        margin: Number(percents.steam_commission_percent) || 0,
        acquiring: Number(percents.aurapay_acquiring_percent) || 0,
        payout: Number(percents.aurapay_payout_percent) || 0,
    }), [percents]);

    const calc = useMemo(() => compute(topup, rates), [topup, rates]);

    const onSave = useCallback((key) => {
        const raw = percents[key];
        if (!percentValid(raw)) return;

        write.run({key, value: Number(String(raw).replace(',', '.')), type: 'number'});
    }, [write, percents]);

    if (settings.error) {
        return <Workspace><Panel scroll><ErrorState error={settings.error} onRetry={settings.refresh}/></Panel></Workspace>;
    }

    if (settings.isLoading) {
        return <Workspace><Panel scroll><SkeletonRows count={7}/></Panel></Workspace>;
    }

    return (
        <Workspace>
            <Panel scroll wide>
                <Grid columns={2}>
                    <div className={style.card}>
                        <span className={style.cardTitle}>Проценты</span>

                        {PERCENTS.map((item) => {
                            const raw = percents[item.key] ?? '';
                            const invalid = raw !== '' && !percentValid(raw);
                            const saved = String(values[item.key]?.value ?? '');

                            return (
                                <Field
                                    key={item.key}
                                    label={item.title}
                                    hint={invalid ? '' : item.hint}
                                    error={invalid ? 'Число от 0 до 100, сотню сервер не примет' : ''}
                                >
                                    <div className={style.row}>
                                        <Input
                                            value={raw}
                                            inputMode="decimal"
                                            invalid={invalid}
                                            onChange={(event) => setPercents((current) => ({...current, [item.key]: event.target.value}))}
                                        />
                                        <Button
                                            size="s"
                                            disabled={invalid || raw === saved}
                                            loading={write.loading}
                                            onClick={() => onSave(item.key)}
                                        >
                                            Сохранить
                                        </Button>
                                    </div>
                                </Field>
                            );
                        })}
                    </div>

                    <div className={style.card}>
                        <span className={style.cardTitle}>Калькулятор пополнения</span>

                        <Field label="Сумма на баланс Steam, ₽">
                            <Input value={topup} inputMode="numeric" onChange={(event) => setTopup(event.target.value)}/>
                        </Field>

                        {calc ? (
                            <StatRow>
                                <Stat label="Платит клиент" value={`${calc.total} ₽`}/>
                                <Stat label="Уходит в кассу" value={`${calc.invoiceAmount} ₽`} note="комиссию добавит касса"/>
                                <Stat label="Прибыль" value={`${calc.profit} ₽`} tone={calc.profit > 0 ? 'positive' : 'danger'}/>
                            </StatRow>
                        ) : <Note tone="warning">Введите сумму пополнения больше нуля.</Note>}

                        <Note>
                            Расчёт повторяет серверный: выплата и маржа накручиваются сверху, эквайринг поднимается
                            делением. Значения берутся из полей слева, в том числе несохранённых.
                        </Note>
                    </div>
                </Grid>
            </Panel>
        </Workspace>
    );
}
