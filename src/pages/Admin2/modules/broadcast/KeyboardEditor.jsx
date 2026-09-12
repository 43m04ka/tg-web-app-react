import React, {useCallback, useEffect, useMemo, useState} from 'react';
import {Button, Field, IconButton, Input, Mono, Note, Select} from '../../ui';
import {useResource} from '../../platform/useResource';
import {keys} from '../../platform/resources';
import {fetchCatalogs} from '../catalogs/api';
import {searchProducts} from '../storefront/api';
import {TARGETS, buttonProblem, countButtons, emptyRow, targetUrl} from './broadcastModel';
import style from './BroadcastScreen.module.scss';

const SEARCH_DELAY = 350;

function ProductPicker({button, disabled, onPick}) {
    const [query, setQuery] = useState('');
    const [found, setFound] = useState([]);

    useEffect(() => {
        const needle = query.trim();
        if (needle.length < 2) {
            setFound([]);
            return undefined;
        }

        const timerId = setTimeout(() => {
            searchProducts(needle)
                .then((payload) => setFound((payload?.items || payload?.result || []).slice(0, 8)))
                .catch(() => setFound([]));
        }, SEARCH_DELAY);

        return () => clearTimeout(timerId);
    }, [query]);

    if (button.productId) {
        return (
            <div className={style.picked}>
                <span className={style.pickedName}>{button.productName || `Товар №${button.productId}`}</span>
                <Mono muted>№{button.productId}</Mono>
                <Button size="s" variant="ghost" disabled={disabled} onClick={() => onPick(null)}>Сменить</Button>
            </div>
        );
    }

    return (
        <div className={style.pickerBox}>
            <Input
                value={query}
                disabled={disabled}
                placeholder="Начните вводить название игры"
                onChange={(event) => setQuery(event.target.value)}
            />

            {query.trim().length >= 2 && found.length === 0 ? (
                <span className={style.pickerEmpty}>Ничего не нашлось</span>
            ) : null}

            {found.length ? (
                <div className={style.found}>
                    {found.map((product) => (
                        <button
                            key={product.id}
                            type="button"
                            className={style.foundItem}
                            onClick={() => {
                                onPick(product);
                                setQuery('');
                                setFound([]);
                            }}
                        >
                            <span
                                className={style.foundArt}
                                style={product.image ? {backgroundImage: `url(${product.image})`} : undefined}
                            />
                            <span className={style.foundBody}>
                                <span className={style.foundName}>{product.name}</span>
                                <span className={style.foundMeta}>
                                    №{product.id}
                                    {product.onSale === false ? ' · снят с продажи' : ''}
                                </span>
                            </span>
                        </button>
                    ))}
                </div>
            ) : null}
        </div>
    );
}

export default function KeyboardEditor({rows, disabled, limits, onChange}) {
    const total = countButtons(rows);
    const maxButtons = limits?.inlineKeyboard?.maxButtonsTotal ?? 100;

    const catalogs = useResource(keys.catalogList, fetchCatalogs);

    const catalogOptions = useMemo(() => ([
        {value: '', title: 'Выберите каталог'},
        ...((catalogs.data?.result || [])
            .slice()
            .sort((left, right) => String(left.path).localeCompare(String(right.path)))
            .map((catalog) => ({value: catalog.path, title: catalog.path})))
    ]), [catalogs.data]);

    const patch = useCallback((rowId, next) => {
        onChange(rows.map((row) => (row.id !== rowId ? row : {
            ...row,
            buttons: row.buttons.map((button, index) => (index === 0 ? {...button, ...next} : button))
        })));
    }, [rows, onChange]);

    const add = useCallback(() => onChange([...rows, emptyRow()]), [rows, onChange]);

    const drop = useCallback((rowId) => onChange(rows.filter((row) => row.id !== rowId)), [rows, onChange]);

    return (
        <div className={style.keyboard}>
            {rows.length === 0 ? (
                <p className={style.keyboardEmpty}>
                    Кнопок нет — сообщение уйдёт без них. Кнопка ведёт в каталог, на игру или по своей ссылке.
                </p>
            ) : null}

            {rows.map((row, index) => {
                const button = row.buttons[0];
                if (!button) return null;

                const problem = buttonProblem(button);
                const link = targetUrl(button);
                const touched = Boolean(String(button.text || '').trim() || link);

                return (
                    <div key={row.id} className={style.kbButton}>
                        <div className={style.kbHead}>
                            <span className={style.kbIndex}>Кнопка {index + 1}</span>
                            <IconButton label="Убрать кнопку" disabled={disabled} onClick={() => drop(row.id)}>×</IconButton>
                        </div>

                        <div className={style.kbGrid}>
                            <Field label="Подпись на кнопке">
                                <Input
                                    value={button.text}
                                    disabled={disabled}
                                    placeholder="Открыть каталог"
                                    onChange={(event) => patch(row.id, {text: event.target.value})}
                                />
                            </Field>

                            <div className={style.kbTargetField}>
                                <span className={style.kbLabel}>Куда ведёт</span>
                                <div className={style.targets} role="radiogroup">
                                    {TARGETS.map((target) => (
                                        <button
                                            key={target.value}
                                            type="button"
                                            role="radio"
                                            aria-checked={button.target === target.value}
                                            disabled={disabled}
                                            className={button.target === target.value ? style.targetOn : style.target}
                                            onClick={() => patch(row.id, {target: target.value})}
                                        >
                                            {target.title}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        </div>

                        {button.target === 'catalog' ? (
                            <Select
                                options={catalogOptions}
                                value={button.catalogPath}
                                disabled={disabled}
                                onChange={(event) => patch(row.id, {catalogPath: event.target.value})}
                            />
                        ) : null}

                        {button.target === 'product' ? (
                            <ProductPicker
                                button={button}
                                disabled={disabled}
                                onPick={(product) => patch(row.id, {
                                    productId: product ? product.id : '',
                                    productName: product ? product.name : ''
                                })}
                            />
                        ) : null}

                        {button.target === 'url' ? (
                            <Input
                                value={button.url}
                                disabled={disabled}
                                placeholder="https://"
                                onChange={(event) => patch(row.id, {url: event.target.value})}
                            />
                        ) : null}

                        {touched && problem ? <span className={style.kbProblem}>{problem}</span> : null}
                        {link && !problem ? <span className={style.kbLink}>{link}</span> : null}
                    </div>
                );
            })}

            <div className={style.keyboardFoot}>
                <Button size="s" variant="secondary" disabled={disabled || total >= maxButtons} onClick={add}>
                    Добавить кнопку
                </Button>

                <span className={style.keyboardCount}>{total} из {maxButtons}</span>
            </div>

            {total > maxButtons ? (
                <Note tone="danger">Кнопок больше, чем примет Telegram.</Note>
            ) : null}
        </div>
    );
}
