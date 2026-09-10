import React, {useCallback, useEffect, useState} from 'react';
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
import {MAINTENANCE_SECTIONS, normalizeSections} from '../../../../shared/lib/maintenance';
import {cancelAssociationsSchedule, fetchAssociationsSchedule, runAssociations} from '../catalogs/api';
import {fetchSettings, refreshStructure, updateSetting} from './api';
import style from './SettingsScreen.module.scss';import {fromMoscowInput, toMoscowInput} from '../../platform/moscowTime';


const sectionsPayload = (sections) => Object.entries(sections).reduce((picked, [id, item]) => {
    picked[id] = {enabled: true, until: item.until || ''};
    return picked;
}, {});

export default function SettingsScreen() {
    usePageHeader('Настройки');

    const settings = useResource(keys.settings, fetchSettings);
    const schedule = useResource(keys.associationsSchedule, fetchAssociationsSchedule);
    const values = settings.data?.settings || {};

    const write = useMutation(updateSetting, {invalidates: [keys.settings], done: 'Настройка сохранена'});
    const rebuild = useMutation(refreshStructure, {done: 'Структура витрины обновлена'});
    const associations = useMutation(() => runAssociations(), {done: 'Обновление ассоциаций запущено'});
    const cancelPlan = useMutation(cancelAssociationsSchedule, {
        invalidates: [keys.associationsSchedule],
        done: 'Запланированное обновление отменено',
    });

    const [until, setUntil] = useState('');
    const [sections, setSections] = useState({});

    useEffect(() => {
        setUntil(toMoscowInput(values.maintenance_mode_until?.value));
        setSections(normalizeSections(values.maintenance_sections?.value));
    }, [settings.data]);

    const maintenance = values.maintenance_mode?.value === true;
    const closedCount = Object.keys(sections).length;
    const plannedAt = schedule.data?.scheduled ? schedule.data.runAtIso : null;

    const onMaintenance = useCallback(async (next) => {
        const answer = await askConfirm({
            title: next ? 'Закрыть всю витрину на техработы?' : 'Открыть витрину?',
            text: next
                ? 'Витрина сразу покажет заглушку всем покупателям, покупки станут недоступны.'
                : 'Витрина сразу вернётся к обычной работе.',
            confirmText: next ? 'Закрыть' : 'Открыть',
            tone: next ? 'danger' : 'accent',
        });

        if (answer) write.run({key: 'maintenance_mode', value: next, type: 'boolean'});
    }, [write]);

    const onUntil = useCallback(() => {
        write.run({key: 'maintenance_mode_until', value: fromMoscowInput(until), type: 'string'});
    }, [write, until]);

    const saveSections = useCallback((next) => {
        setSections(next);
        write.run({key: 'maintenance_sections', value: sectionsPayload(next), type: 'object'});
    }, [write]);

    const onSection = useCallback(async (section, next) => {
        const answer = await askConfirm({
            title: next ? `Закрыть «${section.title}»?` : `Открыть «${section.title}»?`,
            text: next
                ? 'Покупатели увидят заглушку техработ только в этом разделе, остальная витрина продолжит работать.'
                : 'Раздел сразу станет доступен покупателям.',
            confirmText: next ? 'Закрыть раздел' : 'Открыть раздел',
            tone: next ? 'danger' : 'accent',
        });

        if (!answer) return;

        const draft = {...sections};
        if (next) draft[section.id] = {enabled: true, until: null};
        else delete draft[section.id];

        saveSections(draft);
    }, [sections, saveSections]);

    const onSectionUntil = useCallback((id, text) => {
        setSections((current) => (current[id]
            ? {...current, [id]: {enabled: true, until: fromMoscowInput(text) || null}}
            : current));
    }, []);

    const onAssociations = useCallback(async () => {
        const answer = await askConfirm({
            title: 'Обновить ассоциации?',
            text: 'Пересчитываются связи между изданиями и платформами во всех каталогах.',
            consequence: 'Пересчёт тяжёлый: пока он идёт, сервер отвечает медленнее.',
            confirmText: 'Обновить',
        });

        if (answer) associations.run();
    }, [associations]);

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
                <div className={style.stack}>
                    <Grid columns={2}>
                        <section className={style.card}>
                            <header className={style.cardHead}>
                                <span className={style.cardTitle}>Вся витрина</span>
                                {maintenance ? <Badge tone="danger">закрыта</Badge> : <Badge tone="positive">работает</Badge>}
                            </header>

                            <Toggle checked={maintenance} onChange={onMaintenance} label="Закрыть витрину на техработы"/>

                            <Field label="Окончание" hint="Показывается покупателю на заглушке. Пусто — время не задано.">
                                <div className={style.row}>
                                    <Input
                                        type="datetime-local"
                                        value={until}
                                        onChange={(event) => setUntil(event.target.value)}
                                    />
                                    <Button size="s" variant="secondary" onClick={onUntil} loading={write.loading}>
                                        Сохранить
                                    </Button>
                                </div>
                            </Field>
                        </section>

                        <section className={style.card}>
                            <header className={style.cardHead}>
                                <span className={style.cardTitle}>Обновление данных</span>
                            </header>

                            <div className={style.action}>
                                <div className={style.actionText}>
                                    <span className={style.actionTitle}>Ассоциации</span>
                                    <span className={style.actionHint}>
                                        Связи между изданиями и платформами: похожие товары и переключатель версий в карточке.
                                    </span>
                                    {plannedAt ? (
                                        <span className={style.actionPlan}>
                                            Запланировано на {new Date(plannedAt).toLocaleString('ru-RU')}
                                        </span>
                                    ) : null}
                                </div>
                                <ButtonRow>
                                    {plannedAt ? (
                                        <Button size="s" variant="ghost" loading={cancelPlan.loading} onClick={() => cancelPlan.run()}>
                                            Отменить план
                                        </Button>
                                    ) : null}
                                    <Button size="s" variant="secondary" loading={associations.loading} onClick={onAssociations}>
                                        Обновить
                                    </Button>
                                </ButtonRow>
                            </div>

                            <div className={style.action}>
                                <div className={style.actionText}>
                                    <span className={style.actionTitle}>Структура витрины</span>
                                    <span className={style.actionHint}>
                                        Пересобирает главную: блоки, баннеры, подборки. Нужна после правок в обход админки.
                                    </span>
                                </div>
                                <Button size="s" variant="secondary" loading={rebuild.loading} onClick={() => rebuild.run()}>
                                    Обновить
                                </Button>
                            </div>
                        </section>
                    </Grid>

                    <section className={style.card}>
                        <header className={style.cardHead}>
                            <span className={style.cardTitle}>Разделы на техработах</span>
                            {closedCount
                                ? <Badge tone="danger">закрыто: {closedCount}</Badge>
                                : <Badge tone="positive">все открыты</Badge>}
                        </header>

                        <Note>
                            Закрывает отдельную страницу, не трогая остальную витрину. Покупатель увидит
                            заглушку с кнопкой возврата на главную.
                        </Note>

                        <ul className={style.sections}>
                            {MAINTENANCE_SECTIONS.map((section) => {
                                const state = sections[section.id];

                                return (
                                    <li key={section.id} className={state ? style.sectionClosed : style.section}>
                                        <div className={style.sectionText}>
                                            <span className={style.sectionTitle}>{section.title}</span>
                                            <span className={style.sectionHint}>{section.hint}</span>
                                        </div>

                                        {state ? (
                                            <Input
                                                type="datetime-local"
                                                value={toMoscowInput(state.until)}
                                                title="Окончание работ в разделе"
                                                onChange={(event) => onSectionUntil(section.id, event.target.value)}
                                                onBlur={() => saveSections(sections)}
                                            />
                                        ) : <span className={style.sectionOpen}>открыт</span>}

                                        <Toggle
                                            checked={Boolean(state)}
                                            disabled={write.loading}
                                            onChange={(next) => onSection(section, next)}
                                        />
                                    </li>
                                );
                            })}
                        </ul>
                    </section>

                    <section className={style.card}>
                        <header className={style.cardHead}>
                            <span className={style.cardTitle}>Сеанс</span>
                        </header>

                        <div className={style.session}>
                            <div className={style.sessionText}>
                                <span className={style.sessionTitle}>Вы вошли в админку</span>
                                <span className={style.sessionHint}>
                                    Сервер: <Mono muted>{API_BASE_URL || 'тот же домен'}</Mono>
                                </span>
                            </div>
                            <Button variant="danger" onClick={() => signOut()}>Выйти</Button>
                        </div>
                    </section>
                </div>
            </Panel>
        </Workspace>
    );
}
