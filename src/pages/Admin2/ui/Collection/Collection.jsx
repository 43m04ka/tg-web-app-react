import React, {useCallback, useMemo, useState} from 'react';
import {Button, IconButton} from '../primitives/Button';
import {SearchInput} from '../primitives/Field';
import {EmptyState, ErrorState, SkeletonRows, Spinner} from '../primitives/Feedback';
import style from './Collection.module.scss';

const classes = (...list) => list.filter(Boolean).join(' ');

const DENSITY_KEY = 'admin2.density';

const readDensity = () => {
    try {
        return localStorage.getItem(DENSITY_KEY) === 'roomy' ? 'roomy' : 'compact';
    } catch {
        return 'compact';
    }
};

const useDensity = () => {
    const [density, setDensity] = useState(readDensity);

    const toggle = useCallback(() => {
        setDensity((current) => {
            const next = current === 'compact' ? 'roomy' : 'compact';
            try {
                localStorage.setItem(DENSITY_KEY, next);
            } catch {
                return next;
            }
            return next;
        });
    }, []);

    return [density, toggle];
};

function SelectBox({checked, indeterminate = false, onChange, label}) {
    return (
        <span className={style.box}>
            <input
                type="checkbox"
                aria-label={label}
                checked={checked}
                ref={(node) => {
                    if (node) node.indeterminate = indeterminate && !checked;
                }}
                onChange={(event) => onChange(event.target.checked)}
                onClick={(event) => event.stopPropagation()}
            />
        </span>
    );
}

function Pagination({page, pages, total, pageSize, onPage, onPageSize}) {
    if (!pages || pages <= 0) return null;

    return (
        <div className={style.pagination}>
            <span className={style.total}>
                {total === null || total === undefined ? '' : `Всего ${total}`}
            </span>

            <div className={style.pager}>
                {onPageSize ? (
                    <select
                        className={style.pageSize}
                        value={pageSize}
                        onChange={(event) => onPageSize(Number(event.target.value))}
                    >
                        {[50, 100, 200].map((size) => (
                            <option key={size} value={size}>{`по ${size}`}</option>
                        ))}
                    </select>
                ) : null}

                <IconButton label="Предыдущая страница" disabled={page <= 1} onClick={() => onPage(page - 1)}>‹</IconButton>
                <span className={style.pageNow}>{page} / {pages}</span>
                <IconButton label="Следующая страница" disabled={page >= pages} onClick={() => onPage(page + 1)}>›</IconButton>
            </div>
        </div>
    );
}

export function Collection({
    columns,
    rows,
    rowKey = (row) => row.id,
    loading = false,
    stale = false,
    error = null,
    onRetry = null,
    search = null,
    filters = null,
    actions = null,
    selection = null,
    pagination = null,
    onOpen = null,
    activeKey = null,
    empty = null,
    footNote = '',
}) {
    const [density, toggleDensity] = useDensity();

    const keys = useMemo(() => (rows || []).map(rowKey), [rows, rowKey]);
    const selected = selection?.ids || [];
    const selectedSet = useMemo(() => new Set(selected), [selected]);

    const allOnPage = keys.length > 0 && keys.every((key) => selectedSet.has(key));
    const someOnPage = keys.some((key) => selectedSet.has(key));

    const toggleAll = (checked) => {
        if (!selection) return;
        if (checked) selection.onChange([...new Set([...selected, ...keys])]);
        else selection.onChange(selected.filter((id) => !keys.includes(id)));
    };

    const toggleOne = (key, checked) => {
        if (!selection) return;
        if (checked) selection.onChange([...selected, key]);
        else selection.onChange(selected.filter((id) => id !== key));
    };

    const onRowKeyDown = (event, row) => {
        if (event.key === 'Enter' && onOpen) {
            event.preventDefault();
            onOpen(row);
            return;
        }

        if (event.key !== 'ArrowDown' && event.key !== 'ArrowUp') return;

        event.preventDefault();
        const current = event.currentTarget;
        const next = event.key === 'ArrowDown' ? current.nextElementSibling : current.previousElementSibling;
        if (next) next.focus();
    };

    const showRows = Boolean(rows && rows.length);
    const busy = loading && !showRows;

    return (
        <div className={style.collection}>
            {(search || filters || actions) ? (
                <div className={style.toolbar}>
                    {search ? (
                        <SearchInput
                            value={search.value}
                            onChange={search.onChange}
                            placeholder={search.placeholder || 'Поиск'}
                        />
                    ) : null}

                    {filters ? <div className={style.filters}>{filters}</div> : null}

                    <div className={style.toolbarTail}>
                        {stale ? <Spinner size={13}/> : null}
                        {actions}
                        <IconButton
                            label={density === 'compact' ? 'Просторные строки' : 'Плотные строки'}
                            onClick={toggleDensity}
                        >
                            {density === 'compact' ? '⇕' : '⇳'}
                        </IconButton>
                    </div>
                </div>
            ) : null}

            {selection && selected.length ? (
                <div className={style.bulk}>
                    <span className={style.bulkCount}>Выбрано {selected.length}</span>
                    <div className={style.bulkActions}>
                        {(selection.actions || []).map((action) => (
                            <Button
                                key={action.id}
                                size="s"
                                variant={action.tone === 'danger' ? 'danger' : 'secondary'}
                                loading={action.loading}
                                onClick={() => action.run(selected)}
                            >
                                {action.title}
                            </Button>
                        ))}
                    </div>
                    <Button size="s" variant="ghost" onClick={() => selection.onChange([])}>Снять выбор</Button>
                </div>
            ) : null}

            <div className={style.viewport}>
                {error ? (
                    <div className={style.state}><ErrorState error={error} onRetry={onRetry}/></div>
                ) : busy ? (
                    <div className={style.state}><SkeletonRows count={8}/></div>
                ) : !showRows ? (
                    <div className={style.state}>
                        <EmptyState
                            title={empty?.title || 'Ничего не найдено'}
                            text={empty?.text || ''}
                            action={empty?.action || null}
                        />
                    </div>
                ) : (
                    <table className={classes(style.table, style[density])}>
                        <thead>
                            <tr>
                                {selection ? (
                                    <th className={style.pick}>
                                        <SelectBox
                                            label="Выбрать все строки страницы"
                                            checked={allOnPage}
                                            indeterminate={someOnPage}
                                            onChange={toggleAll}
                                        />
                                    </th>
                                ) : null}
                                {columns.map((column) => (
                                    <th
                                        key={column.id}
                                        style={{width: column.width}}
                                        className={classes(column.align === 'right' && style.right)}
                                    >
                                        {column.title}
                                    </th>
                                ))}
                            </tr>
                        </thead>
                        <tbody>
                            {rows.map((row) => {
                                const key = rowKey(row);
                                const isActive = activeKey !== null && key === activeKey;

                                return (
                                    <tr
                                        key={key}
                                        tabIndex={0}
                                        className={classes(
                                            style.row,
                                            onOpen && style.clickable,
                                            isActive && style.active,
                                            selectedSet.has(key) && style.picked,
                                        )}
                                        onClick={() => onOpen && onOpen(row)}
                                        onKeyDown={(event) => onRowKeyDown(event, row)}
                                    >
                                        {selection ? (
                                            <td className={style.pick}>
                                                <SelectBox
                                                    label="Выбрать строку"
                                                    checked={selectedSet.has(key)}
                                                    onChange={(checked) => toggleOne(key, checked)}
                                                />
                                            </td>
                                        ) : null}
                                        {columns.map((column) => (
                                            <td
                                                key={column.id}
                                                className={classes(column.align === 'right' && style.right)}
                                            >
                                                {column.cell(row)}
                                            </td>
                                        ))}
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                )}
            </div>

            {footNote ? <div className={style.footNote}>{footNote}</div> : null}

            {pagination ? <Pagination {...pagination}/> : null}
        </div>
    );
}
