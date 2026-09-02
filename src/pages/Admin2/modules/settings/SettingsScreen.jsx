import React, {useCallback, useEffect, useMemo, useState} from 'react';
import {
    Badge,
    Button,
    ButtonRow,
    ErrorState,
    Field,
    Grid,
    Input,
    Mono,
    Note,
    Panel,
    Select,
    SkeletonRows,
    Stat,
    StatRow,
    Toggle,
    Workspace,
} from '../../ui';
import {usePageHeader} from '../../shell/pageHeader';
import {useResource} from '../../platform/useResource';
import {useMutation} from '../../platform/useMutation';
import {keys} from '../../platform/resources';
import {askConfirm} from '../../platform/notify';
import {signOut} from '../../platform/session';
import {API_BASE_URL} from '../../../../shared/config/env';
import {fetchSettings, refreshStructure, updateSetting} from './api';
import style from './SettingsScreen.module.scss';

const PERCENT_KEYS = [
    {key: 'steam_commission_percent', title: 'Наша маржа, %'},
    {key: 'aurapay_acquiring_percent', title: 'Приём платежа, %'},
    {key: 'aurapay_payout_percent', title: 'Выплата на баланс, %'},
];

const KNOWN = new Set([
    'maintenance_mode',
    'maintenance_mode_until',
    ...PERCENT_KEYS.map((item) => item.key),
]);

const TYPE_OPTIONS = [
    {value: 'string', title: 'строка'},
    {value: 'number', title: 'число'},
    {value: 'boolean', title: 'да/нет'},
];

const toLocalInput = (iso) => {
    if (!iso) return '';

    const date = new Date(iso);
    if (Number.isNaN(date.getTime())) return '';

    const pad = (value) => String(value).padStart(2, '0');
    return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}`;
};

const fromLocalInput = (text) => {
    if (!text) return '';

    const date = new Date(text);
    return Number.isNaN(date.getTime()) ? '' : date.toISOString();
};

const percentValid = (raw) => {
    const parsed = Number(String(raw).replace(',', '.'));
    return Number.isFinite(parsed) && parsed >= 0 && parsed < 100;
};

const steamTotal = (topup, {margin, acquiring, payout}) => {
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

export default function SettingsScreen() {
    usePageHeader('Настройки');

    const settings = useResource(keys.settings, fetchSettings);
    const values = settings.data?.settings || {};

    const write = useMutation(updateSetting, {invalidates: [keys.settings], done: 'Настройка сохранена'});
    const rebuild = useMutation(refreshStructure, {done: 'Статика витрины пересобрана'});

    const [until, setUntil] = useState('');
    const [percents, setPercents] = useState({});
    const [topup, setTopup] = useState('1000');
    const [extra, setExtra] = useState({key: '', value: '', type: 'string'});

    useEffect(() => {
        setUntil(toLocalInput(values.maintenance_mode_until?.value));
        setPercents(Object.fromEntries(PERCENT_KEYS.map((item) => [
            item.key,
            String(values[item.key]?.value ?? ''),
        ])));
    }, [settings.data]);

    const maintenance = values.maintenance_mode?.value === true;

    const onMaintenance = useCallback(async (next) => {
        const answer = await askConfirm({
            title: next ? 'Включить режим техработ?' : 'Выключить режим техработ?',
            text: next
                ? 'Витрина сразу покажет заглушку всем покупателям, покупки станут недоступны.'
                : 'Витрина сразу вернётся к обычной работе.',
            confirmText: next ? 'Включить' : 'Выключить',
            tone: next ? 'danger' : 'accent',
        });

        if (answer) write.run({key: 'maintenance_mode', value: next, type: 'boolean'});
    }, [write]);

    const onUntil = useCallback(() => {
        write.run({key: 'maintenance_mode_until', value: fromLocalInput(until), type: 'string'});
    }, [write, until]);

    const onPercent = useCallback((key) => {
        const raw = percents[key];

        if (!percentValid(raw)) return;

        write.run({key, value: Number(String(raw).replace(',', '.')), type: 'number'});
    }, [write, percents]);

    const rates = useMemo(() => ({
        margin: Number(percents.steam_commission_percent) || 0,
        acquiring: Number(percents.aurapay_acquiring_percent) || 0,
        payout: Number(percents.aurapay_payout_percent) || 0,
    }), [percents]);

    const calc = useMemo(() => steamTotal(topup, rates), [topup, rates]);

    const others = useMemo(() => Object.entries(values)
        .filter(([key]) => !KNOWN.has(key))
        .map(([key, item]) => ({key, ...item})), [values]);

    const onExtra = useCallback(() => {
        const key = extra.key.trim();
        if (!key) return;

        const value = extra.type === 'number'
            ? Number(String(extra.value).replace(',', '.'))
            : extra.type === 'boolean'
                ? extra.value === 'true'
                : extra.value;

        write.run({key, value, type: extra.type});
        setExtra({key: '', value: '', type: 'string'});
    }, [write, extra]);

    if (settings.error) {
        return (
            <Workspace>
                <Panel scroll><ErrorState error={settings.error} onRetry={settings.refresh}/></Panel>
            </Workspace>
        );
    }

    if (settings.isLoading) {
        return (
            <Workspace>
                <Panel scroll><SkeletonRows count={8}/></Panel>
            </Workspace>
        );
    }

    return (
        <Workspace>
            <Panel scroll wide>
                <Grid columns={2}>
                    <div className={style.card}>
                        <div className={style.cardHead}>
                            <span className={style.cardTitle}>Режим техработ</span>
                            {maintenance ? <Badge tone="danger">включён</Badge> : <Badge tone="positive">выключен</Badge>}
                        </div>

                        <Toggle checked={maintenance} onChange={onMaintenance} label="Витрина закрыта на техработы"/>

                        <Field label="Окончание" hint="Показывается покупателю на заглушке. Пусто — время не задано.">
                            <div className={style.row}>
                                <Input
                                    type="datetime-local"
                                    value={until}
                                    onChange={(event) => setUntil(event.target.value)}
                                />
                                <Button size="s" onClick={onUntil} loading={write.loading}>Сохранить</Button>
                            </div>
                        </Field>

                        <Note tone={maintenance ? 'warning' : 'neutral'}>
                            Переключатель действует сразу: статика витрины пересобирается автоматически.
                        </Note>
                    </div>

                    <div className={style.card}>
                        <div className={style.cardHead}>
                            <span className={style.cardTitle}>Проценты Steam</span>
                        </div>

                        {PERCENT_KEYS.map((item) => {
                            const raw = percents[item.key] ?? '';
                            const invalid = raw !== '' && !percentValid(raw);
                            const saved = String(values[item.key]?.value ?? '');

                            return (
                                <Field
                                    key={item.key}
                                    label={item.title}
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
                                            onClick={() => onPercent(item.key)}
                                        >
                                            Сохранить
                                        </Button>
                                    </div>
                                </Field>
                            );
                        })}
                    </div>

                    <div className={style.card}>
                        <div className={style.cardHead}>
                            <span className={style.cardTitle}>Калькулятор пополнения</span>
                        </div>

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
                            Расчёт повторяет серверный: выплата и маржа накручиваются сверху, эквайринг поднимается делением.
                            Значения берутся из полей выше — в том числе несохранённых.
                        </Note>
                    </div>

                    <div className={style.card}>
                        <div className={style.cardHead}>
                            <span className={style.cardTitle}>Служебное</span>
                        </div>

                        <ButtonRow>
                            <Button variant="secondary" loading={rebuild.loading} onClick={() => rebuild.run()}>
                                Пересобрать статику витрины
                            </Button>
                        </ButtonRow>

                        <Note>
                            Пересборка нужна, если структура или баннеры правились в обход админки.
                            В обычной работе сервер делает это сам после каждой правки.
                        </Note>

                        <div className={style.info}>
                            <span>Сервер</span>
                            <Mono muted>{API_BASE_URL || 'тот же домен'}</Mono>
                        </div>

                        <ButtonRow>
                            <Button variant="ghost" onClick={() => signOut()}>Выйти из админки</Button>
                        </ButtonRow>
                    </div>
                </Grid>

                <div className={style.card}>
                    <div className={style.cardHead}>
                        <span className={style.cardTitle}>Прочие настройки</span>
                    </div>

                    {others.length ? (
                        <ul className={style.others}>
                            {others.map((item) => (
                                <li key={item.key} className={style.other}>
                                    <Mono>{item.key}</Mono>
                                    <span className={style.otherType}>{item.type}</span>
                                    <span className={style.otherValue}>{String(item.value)}</span>
                                </li>
                            ))}
                        </ul>
                    ) : <Note>Кроме известных настроек в файле ничего нет.</Note>}

                    <div className={style.extra}>
                        <Field label="Ключ">
                            <Input
                                value={extra.key}
                                placeholder="new_setting_key"
                                onChange={(event) => setExtra((current) => ({...current, key: event.target.value}))}
                            />
                        </Field>
                        <Field label="Тип">
                            <Select
                                options={TYPE_OPTIONS}
                                value={extra.type}
                                onChange={(event) => setExtra((current) => ({...current, type: event.target.value, value: ''}))}
                            />
                        </Field>
                        <Field label="Значение">
                            {extra.type === 'boolean' ? (
                                <Select
                                    options={[{value: 'false', title: 'нет'}, {value: 'true', title: 'да'}]}
                                    value={extra.value || 'false'}
                                    onChange={(event) => setExtra((current) => ({...current, value: event.target.value}))}
                                />
                            ) : (
                                <Input
                                    value={extra.value}
                                    onChange={(event) => setExtra((current) => ({...current, value: event.target.value}))}
                                />
                            )}
                        </Field>
                        <Button variant="secondary" disabled={!extra.key.trim()} loading={write.loading} onClick={onExtra}>
                            Добавить
                        </Button>
                    </div>
                </div>
            </Panel>
        </Workspace>
    );
}
