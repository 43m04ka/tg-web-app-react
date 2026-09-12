import React, {useCallback, useEffect, useMemo, useState} from 'react';
import {
    Badge,
    Button,
    ButtonRow,
    ErrorState,
    Field,
    Input,
    Note,
    Panel,
    Select,
    SkeletonRows,
    Stat,
    StatRow,
    Workspace,
} from '../../ui';
import {usePageHeader} from '../../shell/pageHeader';
import {useResource} from '../../platform/useResource';
import {useMutation} from '../../platform/useMutation';
import {keys} from '../../platform/resources';
import {askConfirm} from '../../platform/notify';
import {fetchCatalogs, fetchRules, recalculate, saveRules} from './api';
import {
    FALLBACK_MULTIPLIER,
    PLATFORMS,
    TYPE_OPTIONS,
    applyRules,
    checkRows,
    diffRules,
    diffText,
    emptyRow,
    platformById,
    rowsFrom,
    toRules,
} from './rulesModel';
import style from './PricesScreen.module.scss';

const money = new Intl.NumberFormat('ru-RU', {maximumFractionDigits: 0});

const ruleTitle = (rule) => {
    if (!rule) return `запасной ×${FALLBACK_MULTIPLIER}`;

    const base = rule.type === 'FIXED' ? `${money.format(rule.value)} ₽` : `×${rule.value}`;
    const extra = rule.commission ? ` + ${money.format(rule.commission)} ₽` : '';

    return `${money.format(rule.min)}–${money.format(rule.max)}: ${base}${extra}`;
};

export default function PricesScreen() {
    usePageHeader('Сетки цен');

    const [platform, setPlatform] = useState(PLATFORMS[0].id);
    const [drafts, setDrafts] = useState({});
    const [probe, setProbe] = useState('1000');
    const [catalogId, setCatalogId] = useState('');
    const [report, setReport] = useState(null);

    const meta = platformById(platform);

    const rules = useResource(keys.priceRuleSet(platform), () => fetchRules(platform));
    const catalogs = useResource(keys.catalogList, fetchCatalogs);

    const saved = useMemo(() => (Array.isArray(rules.data) ? rules.data : []), [rules.data]);
    const rows = drafts[platform] || null;

    useEffect(() => {
        if (!Array.isArray(rules.data)) return;

        setDrafts((current) => (current[platform] ? current : {...current, [platform]: rowsFrom(rules.data)}));
    }, [rules.data, platform]);

    const write = useMutation(saveRules, {
        invalidates: [keys.priceRules, keys.products],
        done: 'Правила сохранены',
        onDone: () => setDrafts((current) => {
            const next = {...current};
            delete next[platform];
            return next;
        }),
    });

    const run = useMutation(recalculate, {
        invalidates: [keys.products],
        onDone: (result) => setReport(result),
    });

    const check = useMemo(() => checkRows(rows || [], meta.commission), [rows, meta.commission]);
    const draftRules = useMemo(() => toRules(rows || [], meta.commission), [rows, meta.commission]);
    const savedRules = useMemo(() => toRules(rowsFrom(saved), meta.commission), [saved, meta.commission]);
    const diff = useMemo(() => diffRules(saved, rows || [], meta.commission), [saved, rows, meta.commission]);

    const before = useMemo(() => applyRules(probe, savedRules), [probe, savedRules]);
    const after = useMemo(() => applyRules(probe, draftRules), [probe, draftRules]);

    const setRow = useCallback((index, patch) => {
        setDrafts((current) => {
            const list = (current[platform] || []).slice();
            list[index] = {...list[index], ...patch};
            return {...current, [platform]: list};
        });
    }, [platform]);

    const addRow = useCallback(() => {
        setDrafts((current) => {
            const list = current[platform] || [];
            return {...current, [platform]: [...list, emptyRow(list)]};
        });
    }, [platform]);

    const dropRow = useCallback((index) => {
        setDrafts((current) => {
            const list = (current[platform] || []).filter((item, position) => position !== index);
            return {...current, [platform]: list};
        });
    }, [platform]);

    const sortRows = useCallback(() => {
        setDrafts((current) => {
            const list = (current[platform] || []).slice()
                .sort((left, right) => Number(left.min) - Number(right.min));
            return {...current, [platform]: list};
        });
    }, [platform]);

    const reset = useCallback(() => {
        setDrafts((current) => {
            const next = {...current};
            delete next[platform];
            return next;
        });
    }, [platform]);

    const onSave = useCallback(async () => {
        if (check.hasErrors) return;

        const answer = await askConfirm({
            title: `Сохранить правила «${meta.title}»?`,
            text: 'Набор заменяется целиком. Цены уже загруженных товаров не изменятся, пока не запустить пересчёт.',
            consequence: diffText(diff),
            confirmText: 'Сохранить',
        });

        if (answer) write.run({platform, rules: draftRules});
    }, [check.hasErrors, meta.title, diff, write, platform, draftRules]);

    const onRecalculate = useCallback(async () => {
        const catalog = (catalogs.data?.result || []).find((item) => String(item.id) === String(catalogId));
        if (!catalog) return;

        const answer = await askConfirm({
            title: `Пересчитать цены каталога «${catalog.path}»?`,
            text: `Ко всем товарам каталога применяются сохранённые правила «${meta.title}». Прежние цены не сохраняются.`,
            confirmText: 'Пересчитать',
        });

        if (!answer) return;

        setReport(null);
        run.run({catalogId: catalog.id, rules: savedRules});
    }, [catalogs.data, catalogId, meta.title, run, savedRules]);

    const catalogOptions = useMemo(() => [
        {value: '', title: 'Выберите каталог'},
        ...(catalogs.data?.result || []).map((item) => ({
            value: String(item.id),
            title: item.isExchangeIndiaCatalog ? `${item.path} · Индия` : item.path,
        })),
    ], [catalogs.data]);

    return (
        <Workspace>
            <Panel
                wide
                title="Правила наценки"
                subtitle="Диапазон считается как «больше от, не больше до»"
                actions={(
                    <div className={style.switch} role="tablist">
                        {PLATFORMS.map((item) => (
                            <button
                                key={item.id}
                                type="button"
                                role="tab"
                                aria-selected={item.id === platform}
                                className={`${style.switchItem} ${style[`tone_${item.id}`]} ${item.id === platform ? style.switchOn : ''}`}
                                onClick={() => setPlatform(item.id)}
                            >
                                <span className={style.switchDot}/>
                                {item.title}
                            </button>
                        ))}
                    </div>
                )}
                scroll
            >
                <div className={`${style.banner} ${style[`tone_${platform}`]}`}>
                    <span className={style.bannerTitle}>{meta.title}</span>
                    <span className={style.bannerText}>{meta.source}</span>
                </div>

                {rules.error ? <ErrorState error={rules.error} onRetry={rules.refresh}/> : null}

                {!rules.error && rules.isLoading && !rows ? <SkeletonRows count={6}/> : null}

                {!rules.error && rows ? (
                    <>
                        <div className={style.table}>
                            <div className={`${style.head} ${meta.commission ? style.wide : ''}`}>
                                <span>От</span>
                                <span>До</span>
                                <span>Тип</span>
                                <span>Значение</span>
                                {meta.commission ? <span>Комиссия</span> : null}
                                <span>На верхней границе</span>
                                <span/>
                            </div>

                            {rows.map((row, index) => {
                                const problems = check.perRow[index] || {};
                                const overlap = check.overlaps.has(index);
                                const edge = applyRules(row.max, draftRules);

                                return (
                                    <div
                                        key={row.key}
                                        className={`${style.row} ${meta.commission ? style.wide : ''} ${overlap ? style.rowBad : ''}`}
                                    >
                                        <Input
                                            value={row.min}
                                            invalid={Boolean(problems.min)}
                                            title={problems.min || ''}
                                            onChange={(event) => setRow(index, {min: event.target.value})}
                                        />
                                        <Input
                                            value={row.max}
                                            invalid={Boolean(problems.max)}
                                            title={problems.max || ''}
                                            onChange={(event) => setRow(index, {max: event.target.value})}
                                        />
                                        <Select
                                            options={TYPE_OPTIONS}
                                            value={row.type}
                                            onChange={(event) => setRow(index, {type: event.target.value})}
                                        />
                                        <Input
                                            value={row.value}
                                            invalid={Boolean(problems.value)}
                                            title={problems.value || ''}
                                            onChange={(event) => setRow(index, {value: event.target.value})}
                                        />
                                        {meta.commission ? (
                                            <Input
                                                value={row.commission}
                                                invalid={Boolean(problems.commission)}
                                                placeholder="0"
                                                onChange={(event) => setRow(index, {commission: event.target.value})}
                                            />
                                        ) : null}
                                        <span className={style.edge}>
                                            {edge ? `${money.format(edge.price)} ₽` : '—'}
                                        </span>
                                        <Button size="s" variant="ghost" onClick={() => dropRow(index)}>Убрать</Button>
                                    </div>
                                );
                            })}
                        </div>

                        <ButtonRow>
                            <Button size="s" variant="secondary" onClick={addRow}>Добавить диапазон</Button>
                            <Button size="s" variant="ghost" onClick={sortRows}>Упорядочить по «от»</Button>
                        </ButtonRow>

                        {check.overlaps.size ? (
                            <Note tone="danger">
                                Диапазоны пересекаются — сервер примет такой набор, но цена будет считаться
                                по первому подходящему правилу. Разведите границы.
                            </Note>
                        ) : null}

                        {check.gaps.length ? (
                            <Note tone="warning">
                                {`Между диапазонами есть разрывы (${check.gaps
                                    .map((gap) => `${money.format(gap.from)}–${money.format(gap.to)}`)
                                    .join(', ')}). Цены из разрыва считаются запасным правилом ×${FALLBACK_MULTIPLIER}.`}
                            </Note>
                        ) : null}

                        {!rows.length ? (
                            <Note tone="warning">
                                {`Правил нет: любая цена умножается на запасной множитель ×${FALLBACK_MULTIPLIER}.`}
                            </Note>
                        ) : null}
                    </>
                ) : null}
            </Panel>

            <Panel title="Проверка" scroll>
                <div className={style.card}>
                    <div className={style.cardHead}>
                        <span className={style.cardTitle}>Изменения</span>
                        {diff.total
                            ? <Badge tone="warning">не сохранено</Badge>
                            : <Badge tone="positive">совпадает с сервером</Badge>}
                    </div>

                    <span className={style.diff}>
                        {diff.total ? diffText(diff) : 'Черновик не отличается от сохранённого набора'}
                    </span>

                    <ButtonRow>
                        <Button
                            variant="primary"
                            disabled={!diff.total || check.hasErrors}
                            loading={write.loading}
                            onClick={onSave}
                        >
                            Сохранить набор
                        </Button>
                        <Button variant="ghost" disabled={!diff.total} onClick={reset}>Вернуть как было</Button>
                    </ButtonRow>

                    {check.hasErrors ? (
                        <Note tone="danger">В диапазонах есть ошибки — сохранение недоступно.</Note>
                    ) : null}
                </div>

                <div className={style.card}>
                    <div className={style.cardHead}>
                        <span className={style.cardTitle}>Калькулятор</span>
                    </div>

                    <Field label="Цена источника" hint={meta.source}>
                        <Input
                            value={probe}
                            inputMode="decimal"
                            onChange={(event) => setProbe(event.target.value)}
                        />
                    </Field>

                    <StatRow>
                        <Stat
                            label="Сейчас на витрине"
                            value={before ? `${money.format(before.price)} ₽` : '—'}
                            note={before ? ruleTitle(before.rule) : 'нужна цена больше нуля'}
                        />
                        <Stat
                            label="После сохранения"
                            value={after ? `${money.format(after.price)} ₽` : '—'}
                            note={after ? ruleTitle(after.rule) : ''}
                            tone={before && after && before.price !== after.price ? 'accent' : 'default'}
                        />
                    </StatRow>

                    {before && after && before.price !== after.price ? (
                        <Note tone="warning">
                            {`Разница ${after.price > before.price ? '+' : ''}${money.format(after.price - before.price)} ₽`}
                        </Note>
                    ) : null}
                </div>

                <div className={style.card}>
                    <div className={style.cardHead}>
                        <span className={style.cardTitle}>Пересчёт каталога</span>
                    </div>

                    <Field label="Каталог" hint="Пересчёт идёт по сохранённым правилам выбранной платформы">
                        <Select
                            options={catalogOptions}
                            value={catalogId}
                            onChange={(event) => setCatalogId(event.target.value)}
                        />
                    </Field>

                    <ButtonRow>
                        <Button
                            variant="secondary"
                            disabled={!catalogId || diff.total > 0}
                            loading={run.loading}
                            onClick={onRecalculate}
                        >
                            Пересчитать цены
                        </Button>
                    </ButtonRow>

                    {diff.total ? (
                        <Note>Сначала сохраните правила — пересчёт берёт то, что лежит на сервере.</Note>
                    ) : null}

                    {report ? (
                        <StatRow>
                            <Stat label="Изменено" value={report.updatedCount ?? 0} tone="positive"/>
                            <Stat label="Без изменений" value={report.unchangedCount ?? 0}/>
                            <Stat label="Без цены источника" value={report.emptyCount ?? 0}/>
                        </StatRow>
                    ) : null}
                </div>
            </Panel>
        </Workspace>
    );
}
