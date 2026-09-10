import React, {useCallback, useEffect, useMemo, useState} from 'react';
import {
    Badge,
    Button,
    ButtonRow,
    EmptyState,
    ErrorState,
    Field,
    Input,
    Note,
    Panel,
    Select,
    SkeletonRows,
    Tabs,
    Toggle,
    Workspace,
} from '../../ui';
import {usePageHeader} from '../../shell/pageHeader';
import {useResource} from '../../platform/useResource';
import {useMutation} from '../../platform/useMutation';
import {askConfirm} from '../../platform/notify';
import {keys} from '../../platform/resources';
import {deleteMethod, fetchRegistry, saveMethod, saveRules, updateSetting} from './api';
import {
    FLOW_TITLES,
    PLATFORM_TITLES,
    PROVIDER_TITLES,
    SCENARIO_TITLES,
    describeRule,
    emptyMethod,
    indexRules,
    methodProblem,
    numberOrNull,
    pageTypesOf,
    ruleKey,
    toForm,
} from './paymentsModel';
import style from './PaymentsScreen.module.scss';

const FLOW_OPTIONS = [
    {value: 'manual', title: FLOW_TITLES.manual},
    {value: 'auto', title: FLOW_TITLES.auto},
];

const PROVIDER_OPTIONS = [
    {value: '', title: 'Не нужна'},
    {value: 'paykeeper', title: PROVIDER_TITLES.paykeeper},
    {value: 'aurapay', title: PROVIDER_TITLES.aurapay},
];

const OVERRIDE_FLOW_OPTIONS = [
    {value: '', title: 'Как у метода'},
    {value: 'auto', title: FLOW_TITLES.auto},
    {value: 'manual', title: FLOW_TITLES.manual},
];

function MatrixCell({rule, onToggle, onOpen}) {
    const enabled = !!rule && rule.isEnabled;
    const note = describeRule(rule);

    return (
        <td className={style.cell}>
            <div className={style.cellInner}>
                <Toggle checked={enabled} onChange={onToggle}/>
                <button type="button" className={style.cellNote} onClick={onOpen}>
                    {note || (enabled ? 'по умолчанию' : '—')}
                </button>
            </div>
        </td>
    );
}

function RuleEditor({rule, methodTitle, platform, onChange, onClose}) {
    const [draft, setDraft] = useState(() => ({
        minTotal: rule?.minTotal ?? '',
        maxTotal: rule?.maxTotal ?? '',
        flowOverride: rule?.flowOverride || '',
        providerOverride: rule?.providerOverride || '',
    }));

    const patch = (key, value) => setDraft((current) => ({...current, [key]: value}));

    const apply = () => {
        onChange({
            minTotal: numberOrNull(draft.minTotal),
            maxTotal: numberOrNull(draft.maxTotal),
            flowOverride: draft.flowOverride || null,
            providerOverride: draft.providerOverride || null,
        });
        onClose();
    };

    return (
        <Panel
            scroll
            title={`${methodTitle} · ${PLATFORM_TITLES[platform] || platform}`}
            subtitle="Уточнение правила для этой клетки"
            actions={<Button variant="ghost" onClick={onClose}>Закрыть</Button>}
        >
            <div className={style.editorGrid}>
                <Field label="Минимальная сумма, ₽" hint="Ниже неё метод недоступен">
                    <Input
                        value={draft.minTotal}
                        inputMode="numeric"
                        placeholder="без ограничения"
                        onChange={(event) => patch('minTotal', event.target.value)}
                    />
                </Field>
                <Field label="Максимальная сумма, ₽">
                    <Input
                        value={draft.maxTotal}
                        inputMode="numeric"
                        placeholder="без ограничения"
                        onChange={(event) => patch('maxTotal', event.target.value)}
                    />
                </Field>
                <Field label="Как принимается оплата" hint="Переопределяет режим метода на этой площадке">
                    <Select
                        options={OVERRIDE_FLOW_OPTIONS}
                        value={draft.flowOverride}
                        onChange={(event) => patch('flowOverride', event.target.value)}
                    />
                </Field>
                <Field label="Касса" hint="Пусто — как у метода">
                    <Select
                        options={PROVIDER_OPTIONS}
                        value={draft.providerOverride}
                        onChange={(event) => patch('providerOverride', event.target.value)}
                    />
                </Field>
            </div>
            <ButtonRow>
                <Button variant="primary" onClick={apply}>Применить</Button>
            </ButtonRow>
        </Panel>
    );
}

function MethodForm({value, isNew, onSubmit, onDelete, saving}) {
    const [form, setForm] = useState(() => toForm(value));

    useEffect(() => setForm(toForm(value)), [value]);

    const patch = (key, next) => setForm((current) => ({...current, [key]: next}));
    const problem = methodProblem(form);

    return (
        <Panel
            scroll
            title={isNew ? 'Новый способ оплаты' : form.title || form.code}
            subtitle={isNew ? 'Появится в матрице после сохранения' : `код: ${form.code}`}
            actions={isNew ? null : (
                <Button variant="danger" onClick={() => onDelete(form.code)}>Удалить</Button>
            )}
        >
            <div className={style.editorGrid}>
                <Field label="Код" hint="Уходит в заказ, потом не изменить" required>
                    <Input
                        value={form.code}
                        disabled={!isNew}
                        mono
                        onChange={(event) => patch('code', event.target.value.trim().toLowerCase())}
                    />
                </Field>
                <Field label="Название" hint="Его видит покупатель" required>
                    <Input value={form.title} onChange={(event) => patch('title', event.target.value)}/>
                </Field>
            </div>

            <Field label="Описание" hint="Строка под названием в корзине">
                <Input value={form.note} onChange={(event) => patch('note', event.target.value)}/>
            </Field>

            <div className={style.editorGrid}>
                <Field label="Как принимается оплата" required>
                    <Select
                        options={FLOW_OPTIONS}
                        value={form.flow}
                        onChange={(event) => patch('flow', event.target.value)}
                    />
                </Field>
                <Field label="Касса" hint="Нужна только автоматическому счёту">
                    <Select
                        options={PROVIDER_OPTIONS}
                        value={form.provider}
                        onChange={(event) => patch('provider', event.target.value)}
                    />
                </Field>
            </div>

            <div className={style.editorGrid}>
                <Field label="Иконка" hint="Имя файла в public/payments">
                    <Input value={form.icon} mono onChange={(event) => patch('icon', event.target.value)}/>
                </Field>
                <Field label="Цветовая метка" hint="Класс оформления в корзине">
                    <Input value={form.tone} mono onChange={(event) => patch('tone', event.target.value)}/>
                </Field>
            </div>

            <div className={style.editorGrid}>
                <Field label="Подпись ссылки на условия">
                    <Input value={form.termsLabel} onChange={(event) => patch('termsLabel', event.target.value)}/>
                </Field>
                <Field label="Ссылка на условия">
                    <Input value={form.termsUrl} onChange={(event) => patch('termsUrl', event.target.value)}/>
                </Field>
            </div>

            <div className={style.switches}>
                <Toggle
                    checked={form.isEnabled}
                    label="Метод включён"
                    onChange={() => patch('isEnabled', !form.isEnabled)}
                />
                <Toggle
                    checked={form.requiresEmail}
                    label="Спрашивать почту для чека"
                    onChange={() => patch('requiresEmail', !form.requiresEmail)}
                />
                <Toggle
                    checked={form.schedule}
                    label="Показывать график платежей"
                    onChange={() => patch('schedule', !form.schedule)}
                />
            </div>

            <Field label="Порядок в списке">
                <Input
                    value={form.serialNumber}
                    inputMode="numeric"
                    onChange={(event) => patch('serialNumber', event.target.value)}
                />
            </Field>

            {problem ? <Note tone="warning">{problem}</Note> : null}

            <ButtonRow>
                <Button
                    variant="primary"
                    disabled={!!problem || saving}
                    onClick={() => onSubmit({...form, serialNumber: numberOrNull(form.serialNumber) ?? 0})}
                >
                    Сохранить способ
                </Button>
            </ButtonRow>
        </Panel>
    );
}

export default function PaymentsScreen() {
    usePageHeader('Оплата');

    const registry = useResource(keys.paymentRegistry, fetchRegistry);

    const methods = useMemo(() => registry.data?.methods || [], [registry.data]);
    const platforms = useMemo(() => registry.data?.platforms || [], [registry.data]);
    const scenarios = useMemo(() => registry.data?.scenarios || [], [registry.data]);

    const [scenario, setScenario] = useState('catalog');
    const [pageType, setPageType] = useState('');
    const [draftRules, setDraftRules] = useState(null);
    const [editing, setEditing] = useState(null);
    const [selectedMethod, setSelectedMethod] = useState(null);

    useEffect(() => {
        if (registry.data?.rules) setDraftRules(registry.data.rules);
    }, [registry.data]);

    const writeMethod = useMutation(saveMethod, {
        invalidates: [keys.paymentRegistry],
        done: 'Способ оплаты сохранён',
        onDone: () => setSelectedMethod(null),
    });

    const removeMethod = useMutation(deleteMethod, {
        invalidates: [keys.paymentRegistry],
        done: 'Способ оплаты удалён',
        onDone: () => setSelectedMethod(null),
    });

    const writeRules = useMutation(saveRules, {
        invalidates: [keys.paymentRegistry],
        done: 'Матрица сохранена',
    });

    const writeEnforce = useMutation(updateSetting, {
        invalidates: [keys.paymentRegistry, keys.settings],
        done: 'Режим проверки изменён',
    });

    const ruleMap = useMemo(() => indexRules(draftRules), [draftRules]);
    const pageTypes = useMemo(() => pageTypesOf(draftRules, scenario), [draftRules, scenario]);

    const currentPageType = pageType || null;

    const patchRule = useCallback((methodCode, platform, patch) => {
        setDraftRules((current) => {
            const list = current ? [...current] : [];
            const key = ruleKey(methodCode, platform, scenario, currentPageType);
            const at = list.findIndex((rule) =>
                ruleKey(rule.methodCode, rule.platform, rule.scenario, rule.pageType) === key);

            if (at === -1) {
                list.push({
                    methodCode,
                    platform,
                    scenario,
                    pageType: currentPageType,
                    isEnabled: true,
                    minTotal: null,
                    maxTotal: null,
                    flowOverride: null,
                    providerOverride: null,
                    ...patch,
                });
                return list;
            }

            list[at] = {...list[at], ...patch};
            return list;
        });
    }, [scenario, currentPageType]);

    const toggleRule = useCallback((methodCode, platform) => {
        const existing = ruleMap.get(ruleKey(methodCode, platform, scenario, currentPageType));
        patchRule(methodCode, platform, {isEnabled: !(existing && existing.isEnabled)});
    }, [ruleMap, patchRule, scenario, currentPageType]);

    const onDeleteMethod = useCallback(async (code) => {
        const confirmed = await askConfirm({
            title: `Удалить способ «${code}»?`,
            text: 'Уйдут и все его правила. Оформленные заказы не изменятся — они хранят свой снимок метода.',
            confirmText: 'Удалить',
            tone: 'danger',
        });

        if (confirmed) removeMethod.run(code);
    }, [removeMethod]);

    const enforce = registry.data?.enforce === true;

    const onToggleEnforce = useCallback(async () => {
        const confirmed = await askConfirm({
            title: enforce ? 'Выключить строгую проверку?' : 'Включить строгую проверку?',
            text: enforce
                ? 'Заказы с методом, которого нет в матрице, снова будут проходить — с записью в лог.'
                : 'Заказ с методом, которого нет в матрице, будет отклонён. Сначала убедитесь, что в логе нет строк «Мягкий режим».',
            confirmText: enforce ? 'Выключить' : 'Включить',
            tone: enforce ? 'accent' : 'danger',
        });

        if (confirmed) {
            writeEnforce.run({key: 'payment_rules_enforce', value: !enforce, type: 'boolean'});
        }
    }, [enforce, writeEnforce]);

    if (registry.isLoading) {
        return <Workspace><Panel scroll title="Оплата"><SkeletonRows count={6}/></Panel></Workspace>;
    }

    if (registry.error) {
        return (
            <Workspace>
                <ErrorState error={registry.error} onRetry={registry.refresh}/>
            </Workspace>
        );
    }

    const dirty = JSON.stringify(draftRules) !== JSON.stringify(registry.data?.rules || []);

    return (
        <Workspace>
            <Panel
                scroll
                title="Доступность по площадкам"
                subtitle="Где какой способ оплаты видит покупатель"
                actions={(
                    <ButtonRow>
                        {dirty ? (
                            <Button variant="ghost" onClick={() => setDraftRules(registry.data?.rules || [])}>
                                Отменить
                            </Button>
                        ) : null}
                        <Button
                            variant="primary"
                            disabled={!dirty || writeRules.loading}
                            onClick={() => writeRules.run(draftRules)}
                        >
                            Сохранить матрицу
                        </Button>
                    </ButtonRow>
                )}
            >
                <div className={enforce ? style.enforceOn : style.enforce}>
                    <div className={style.enforceText}>
                        <span className={style.enforceTitle}>
                            Строгая проверка
                            <Badge tone={enforce ? 'positive' : 'warning'}>{enforce ? 'включена' : 'выключена'}</Badge>
                        </span>
                        <span className={style.enforceHint}>
                            {enforce
                                ? 'Заказ со способом оплаты вне матрицы отклоняется.'
                                : 'Мягкий режим: расхождения только пишутся в лог, заказы проходят.'}
                        </span>
                    </div>
                    <Toggle checked={enforce} disabled={writeEnforce.loading} onChange={onToggleEnforce}/>
                </div>

                <Tabs
                    items={scenarios.map((item) => ({id: item, title: SCENARIO_TITLES[item] || item}))}
                    value={scenario}
                    onChange={(next) => {
                        setScenario(next);
                        setPageType('');
                        setEditing(null);
                    }}
                />

                {pageTypes.length ? (
                    <div className={style.pageTypes}>
                        <Tabs
                            items={[
                                {id: '', title: 'Все страницы'},
                                ...pageTypes.map((item) => ({id: item, title: item})),
                            ]}
                            value={pageType}
                            onChange={(next) => {
                                setPageType(next);
                                setEditing(null);
                            }}
                        />
                    </div>
                ) : null}

                {currentPageType ? (
                    <Note tone="accent">
                        Правило для страниц типа <b>{currentPageType}</b> перекрывает общее правило сценария.
                    </Note>
                ) : null}

                {methods.length === 0 ? (
                    <EmptyState title="Способов оплаты пока нет" text="Заведите первый в панели справа."/>
                ) : (
                    <div className={style.tableWrap}>
                        <table className={style.matrix}>
                            <thead>
                                <tr>
                                    <th className={style.methodHead}>Способ</th>
                                    {platforms.map((platform) => (
                                        <th key={platform}>{PLATFORM_TITLES[platform] || platform}</th>
                                    ))}
                                </tr>
                            </thead>
                            <tbody>
                                {methods.map((method) => (
                                    <tr key={method.code}>
                                        <th className={style.methodHead}>
                                            <button
                                                type="button"
                                                className={style.methodName}
                                                onClick={() => setSelectedMethod(method.code)}
                                            >
                                                {method.title}
                                            </button>
                                            <div className={style.methodMeta}>
                                                <Badge tone={method.flow === 'auto' ? 'positive' : 'neutral'}>
                                                    {FLOW_TITLES[method.flow] || method.flow}
                                                </Badge>
                                                {method.isEnabled ? null : <Badge tone="danger">выключен</Badge>}
                                            </div>
                                        </th>
                                        {platforms.map((platform) => (
                                            <MatrixCell
                                                key={platform}
                                                rule={ruleMap.get(ruleKey(method.code, platform, scenario, currentPageType))}
                                                onToggle={() => toggleRule(method.code, platform)}
                                                onOpen={() => setEditing({methodCode: method.code, platform})}
                                            />
                                        ))}
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}

            </Panel>

            {editing ? (
                <RuleEditor
                    rule={ruleMap.get(ruleKey(editing.methodCode, editing.platform, scenario, currentPageType))}
                    methodTitle={(methods.find((item) => item.code === editing.methodCode) || {}).title || editing.methodCode}
                    platform={editing.platform}
                    onChange={(patch) => patchRule(editing.methodCode, editing.platform, patch)}
                    onClose={() => setEditing(null)}
                />
            ) : null}

            <Panel
                scroll
                title="Способы оплаты"
                subtitle="Справочник: название, режим и касса"
                actions={<Button variant="primary" onClick={() => setSelectedMethod('')}>Добавить</Button>}
            >
                <div className={style.methodList}>
                    {methods.map((method) => (
                        <button
                            key={method.code}
                            type="button"
                            className={selectedMethod === method.code ? style.methodRowActive : style.methodRow}
                            onClick={() => setSelectedMethod(method.code)}
                        >
                            <span className={style.methodRowTitle}>{method.title}</span>
                            <span className={style.methodRowCode}>{method.code}</span>
                            <span className={style.methodRowFlow}>{FLOW_TITLES[method.flow] || method.flow}</span>
                        </button>
                    ))}
                </div>
            </Panel>

            {selectedMethod === null ? null : (
                <MethodForm
                    value={selectedMethod === ''
                        ? emptyMethod()
                        : methods.find((item) => item.code === selectedMethod) || emptyMethod()}
                    isNew={selectedMethod === ''}
                    saving={writeMethod.loading}
                    onSubmit={(form) => writeMethod.run(form)}
                    onDelete={onDeleteMethod}
                />
            )}
        </Workspace>
    );
}
