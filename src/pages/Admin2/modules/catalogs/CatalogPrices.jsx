import React, {useCallback, useEffect, useMemo, useState} from 'react';
import {
    Badge,
    Button,
    ButtonRow,
    ErrorState,
    Input,
    InspectorSection,
    Note,
    Select,
    SkeletonRows,
    Stat,
    StatRow
} from '../../ui';
import {useResource} from '../../platform/useResource';
import {useMutation} from '../../platform/useMutation';
import {keys} from '../../platform/resources';
import {askConfirm} from '../../platform/notify';
import {fetchRules, recalculate} from '../prices/api';
import {
    FALLBACK_MULTIPLIER,
    TYPE_OPTIONS,
    applyRules,
    checkRows,
    diffRules,
    diffText,
    emptyRow,
    platformById,
    rowsFrom,
    toRules
} from '../prices/rulesModel';
import table from '../prices/PricesScreen.module.scss';

const PLATFORM_BY_SOURCE = {
    ps: 'ps',
    ps_india: 'india',
    xbox: 'xbox'
};

const money = new Intl.NumberFormat('ru-RU', {maximumFractionDigits: 0});

export default function CatalogPrices({catalog, source}) {
    const platform = PLATFORM_BY_SOURCE[source] || null;

    if (!platform) {
        return (
            <InspectorSection title="Пересчёт цен">
                <Note tone="warning">У каталога не определена витрина — непонятно, какую сетку брать.</Note>
            </InspectorSection>
        );
    }

    return <PricesForm key={`${catalog.id}:${platform}`} catalog={catalog} platform={platform}/>;
}

function PricesForm({catalog, platform}) {
    const meta = platformById(platform);

    const rules = useResource(keys.priceRuleSet(platform), () => fetchRules(platform));
    const saved = useMemo(() => (Array.isArray(rules.data) ? rules.data : []), [rules.data]);

    const [rows, setRows] = useState(null);
    const [report, setReport] = useState(null);

    useEffect(() => {
        if (!Array.isArray(rules.data)) return;

        setRows((current) => current || rowsFrom(rules.data));
    }, [rules.data]);

    const run = useMutation(recalculate, {
        invalidates: [keys.products],
        done: 'Цены каталога пересчитаны',
        onDone: (result) => setReport(result)
    });

    const check = useMemo(() => checkRows(rows || [], meta.commission), [rows, meta.commission]);
    const draftRules = useMemo(() => toRules(rows || [], meta.commission), [rows, meta.commission]);
    const diff = useMemo(() => diffRules(saved, rows || [], meta.commission), [saved, rows, meta.commission]);

    const setRow = useCallback((index, patch) => {
        setRows((current) => {
            const list = (current || []).slice();
            list[index] = {...list[index], ...patch};
            return list;
        });
    }, []);

    const addRow = useCallback(() => setRows((current) => [...(current || []), emptyRow(current || [])]), []);

    const dropRow = useCallback((index) => {
        setRows((current) => (current || []).filter((item, position) => position !== index));
    }, []);

    const sortRows = useCallback(() => {
        setRows((current) => (current || []).slice().sort((left, right) => Number(left.min) - Number(right.min)));
    }, []);

    const reset = useCallback(() => setRows(rowsFrom(saved)), [saved]);

    const onRecalculate = useCallback(async () => {
        if (check.hasErrors) return;

        const answer = await askConfirm({
            title: `Пересчитать цены каталога «${catalog.path}»?`,
            text: diff.total
                ? 'Ко всем товарам каталога применяется сетка из этой вкладки. Общие правила платформы не меняются.'
                : `Ко всем товарам каталога применяются сохранённые правила «${meta.title}».`,
            consequence: 'Прежние цены не сохраняются.',
            confirmText: 'Пересчитать'
        });

        if (!answer) return;

        setReport(null);
        run.run({catalogId: catalog.id, rules: draftRules});
    }, [check.hasErrors, catalog, diff.total, meta.title, run, draftRules]);

    return (
        <InspectorSection
            title="Пересчёт цен"
            note={`${meta.title} · ${meta.source}. Сетка действует только на этот каталог и в общие правила не сохраняется.`}
        >
            {rules.error ? <ErrorState error={rules.error} onRetry={rules.refresh}/> : null}

            {!rules.error && rules.isLoading && !rows ? <SkeletonRows count={6}/> : null}

            {!rules.error && rows ? (
                <>
                    <div className={table.table}>
                        <div className={`${table.head} ${meta.commission ? table.wide : ''}`}>
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
                                    className={`${table.row} ${meta.commission ? table.wide : ''} ${overlap ? table.rowBad : ''}`}
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
                                    <span className={table.edge}>
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
                        <Button size="s" variant="ghost" disabled={!diff.total} onClick={reset}>
                            Вернуть сетку платформы
                        </Button>
                        {diff.total
                            ? <Badge tone="warning">{`своя сетка: ${diffText(diff)}`}</Badge>
                            : <Badge tone="positive">совпадает с сеткой платформы</Badge>}
                    </ButtonRow>

                    {check.overlaps.size ? (
                        <Note tone="danger">
                            Диапазоны пересекаются — цена посчитается по первому подходящему правилу. Разведите границы.
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

                    <ButtonRow>
                        <Button
                            variant="primary"
                            disabled={check.hasErrors}
                            loading={run.loading}
                            onClick={onRecalculate}
                        >
                            Пересчитать цены каталога
                        </Button>
                    </ButtonRow>

                    {report ? (
                        <StatRow>
                            <Stat label="Изменено" value={report.updatedCount ?? 0} tone="positive"/>
                            <Stat label="Без изменений" value={report.unchangedCount ?? 0}/>
                            <Stat label="Без цены источника" value={report.emptyCount ?? 0}/>
                        </StatRow>
                    ) : null}
                </>
            ) : null}
        </InspectorSection>
    );
}
