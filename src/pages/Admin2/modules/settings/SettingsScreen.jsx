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

const KNOWN = new Set([
    'maintenance_mode',
    'maintenance_mode_until',
    'steam_commission_percent',
    'aurapay_acquiring_percent',
    'aurapay_payout_percent',
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

export default function SettingsScreen() {
    usePageHeader('Настройки');

    const settings = useResource(keys.settings, fetchSettings);
    const values = settings.data?.settings || {};

    const write = useMutation(updateSetting, {invalidates: [keys.settings], done: 'Настройка сохранена'});
    const rebuild = useMutation(refreshStructure, {done: 'Статика витрины пересобрана'});

    const [until, setUntil] = useState('');
    const [extra, setExtra] = useState({key: '', value: '', type: 'string'});

    useEffect(() => {
        setUntil(toLocalInput(values.maintenance_mode_until?.value));
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
