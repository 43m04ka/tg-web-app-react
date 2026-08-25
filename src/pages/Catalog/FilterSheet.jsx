import React, {useEffect, useState} from 'react';
import {useAppInsets} from '../../shared/hooks/useAppInsets';
import {hapticImpact} from '../../shared/lib/haptic';
import {fetchCatalogProducts} from '../../shared/api/catalog';
import {
    FILTER_GROUPS,
    PRICE_PRESETS,
    SORTINGS,
    TOGGLES,
    countActiveFilters,
    createFilters,
    describeFilters,
    isSamePriceRange,
    productsPlural,
    setPriceRange,
    toggleFlag,
    toggleListValue
} from '../../shared/lib/catalogQuery';
import style from './FilterSheet.module.scss';

function Group({group, options, values, onToggle}) {
    const [isExpanded, setExpanded] = useState(false);

    if (!options.length) return null;

    const limit = group.limit || options.length;
    const visible = isExpanded ? options : options.slice(0, limit);
    const hidden = options.length - visible.length;

    return (
        <section className={style.group}>
            <div className={style.groupHead}>
                <span className={style.groupTitle}>{group.title}</span>

                {hidden > 0 || isExpanded ? (
                    <button type="button" className={style.groupMore} onClick={() => setExpanded(!isExpanded)}>
                        {isExpanded ? 'Свернуть ▴' : `Ещё ${hidden} ▾`}
                    </button>
                ) : null}
            </div>

            <div className={style.options}>
                {visible.map((option) => {
                    const isActive = values.includes(option.value);

                    return (
                        <button
                            key={option.value}
                            type="button"
                            className={`${style.option} ${isActive ? style.optionActive : ''}`}
                            aria-pressed={isActive}
                            onClick={() => onToggle(group.key, option.value)}
                        >
                            {option.label}
                        </button>
                    );
                })}
            </div>
        </section>
    );
}

const PREVIEW_DELAY_MS = 250;
const SLIDER_STEPS = 100;

const resolveBounds = (price) => {
    const min = Number(price?.min);
    const max = Number(price?.max);

    if (!Number.isFinite(min) || !Number.isFinite(max) || max <= min) return null;

    return {min: Math.floor(min), max: Math.ceil(max)};
};

const money = (value) => Number(value).toLocaleString('ru-RU');

const priceNote = (filters, bounds) => {
    if (filters.priceMin === null && filters.priceMax === null) {
        return bounds ? `${money(bounds.min)} — ${money(bounds.max)} ₽` : 'Любая';
    }

    if (filters.priceMin !== null && filters.priceMax !== null) {
        return `${money(filters.priceMin)} — ${money(filters.priceMax)} ₽`;
    }

    return filters.priceMax !== null ? `до ${money(filters.priceMax)} ₽` : `от ${money(filters.priceMin)} ₽`;
};

function PriceSlider({bounds, priceMin, priceMax, onChange}) {
    const step = Math.max(1, Math.round((bounds.max - bounds.min) / SLIDER_STEPS));

    const from = priceMin === null ? bounds.min : Math.max(bounds.min, priceMin);
    const to = priceMax === null ? bounds.max : Math.min(bounds.max, priceMax);

    // Границы диапазона равны краям — это «фильтра нет», и в запрос уходит null:
    // иначе товар с ценой ровно на краю мог бы отсечься округлением шага
    const commit = (nextFrom, nextTo) => onChange(
        nextFrom <= bounds.min ? null : nextFrom,
        nextTo >= bounds.max ? null : nextTo
    );

    const percent = (value) => ((value - bounds.min) / (bounds.max - bounds.min)) * 100;

    return (
        <div className={style.slider}>
            <span className={style.sliderTrack}/>
            <span
                className={style.sliderRange}
                style={{left: `${percent(from)}%`, right: `${100 - percent(to)}%`}}
            />

            <input
                className={style.sliderInput}
                type="range"
                min={bounds.min}
                max={bounds.max}
                step={step}
                value={from}
                aria-label="Цена от"
                onChange={(event) => commit(Math.min(Number(event.target.value), to), to)}
            />
            <input
                className={style.sliderInput}
                type="range"
                min={bounds.min}
                max={bounds.max}
                step={step}
                value={to}
                aria-label="Цена до"
                onChange={(event) => commit(from, Math.max(Number(event.target.value), from))}
            />
        </div>
    );
}

export default function FilterSheet({
    isOpen,
    scope,
    facets,
    price,
    filters,
    sorting,
    total,
    onApply,
    onClose
}) {
    const {safeAreaInset} = useAppInsets();

    const [draft, setDraft] = useState(filters);
    const [draftSorting, setDraftSorting] = useState(sorting);
    const [preview, setPreview] = useState(total);

    useEffect(() => {
        if (!isOpen) return;
        setDraft(filters);
        setDraftSorting(sorting);
        setPreview(total);
    }, [isOpen, filters, sorting, total]);

    const scopeKey = JSON.stringify(scope);
    const draftKey = JSON.stringify(draft);

    useEffect(() => {
        if (!isOpen) return undefined;

        const controller = new AbortController();

        const timer = setTimeout(() => {
            fetchCatalogProducts(
                {...JSON.parse(scopeKey), filters: JSON.parse(draftKey), page: 1, perPage: 1},
                controller.signal
            )
                .then((payload) => setPreview(payload?.total ?? 0))
                .catch(() => setPreview(null));
        }, PREVIEW_DELAY_MS);

        return () => {
            clearTimeout(timer);
            controller.abort();
        };
    }, [isOpen, scopeKey, draftKey]);

    if (!isOpen) return null;

    const chips = describeFilters(draft, facets);
    const activeCount = countActiveFilters(draft);
    const bounds = resolveBounds(price);

    const toggleOption = (key, value) => {
        hapticImpact('light');
        setDraft((current) => toggleListValue(current, key, value));
    };

    const applyPreset = (preset) => {
        hapticImpact('light');
        setDraft((current) => (isSamePriceRange(current, preset)
            ? setPriceRange(current, null, null)
            : setPriceRange(current, preset.priceMin, preset.priceMax)));
    };

    const reset = () => {
        hapticImpact('light');
        setDraft(createFilters());
        setDraftSorting('default');
    };

    const apply = () => {
        hapticImpact('medium');
        onApply(draft, draftSorting);
    };

    return (
        <div className={style.overlay} role="dialog" aria-modal="true" aria-label="Фильтры">
            <button type="button" className={style.backdrop} aria-label="Закрыть фильтры" onClick={onClose}/>

            <div className={style.sheet}>
                <div className={style.head}>
                    <span className={style.grabber} aria-hidden="true"/>

                    <div className={style.headRow}>
                        <span className={style.headTitle}>Фильтры</span>
                        {activeCount > 0 ? (
                            <button type="button" className={style.reset} onClick={reset}>Сбросить всё</button>
                        ) : null}
                    </div>

                    {chips.length ? (
                        <div className={style.chips}>
                            {chips.map((chip) => (
                                <button
                                    key={chip.id}
                                    type="button"
                                    className={style.chip}
                                    onClick={() => setDraft((current) => chip.remove(current))}
                                >
                                    {chip.label}
                                    <span className={style.chipCross} aria-hidden="true">✕</span>
                                </button>
                            ))}
                        </div>
                    ) : null}
                </div>

                <div className={style.body}>
                    {FILTER_GROUPS.map((group) => (
                        <Group
                            key={group.key}
                            group={group}
                            options={facets?.[group.key] || []}
                            values={draft[group.key] || []}
                            onToggle={toggleOption}
                        />
                    ))}

                    <section className={style.group}>
                        <div className={style.groupHead}>
                            <span className={style.groupTitle}>Цена</span>
                            <span className={style.groupNote}>{priceNote(draft, bounds)}</span>
                        </div>

                        {bounds ? (
                            <PriceSlider
                                bounds={bounds}
                                priceMin={draft.priceMin}
                                priceMax={draft.priceMax}
                                onChange={(min, max) => setDraft((current) => setPriceRange(current, min, max))}
                            />
                        ) : null}

                        <div className={style.options}>
                            {PRICE_PRESETS.map((preset) => {
                                const isActive = isSamePriceRange(draft, preset);

                                return (
                                    <button
                                        key={preset.label}
                                        type="button"
                                        className={`${style.option} ${isActive ? style.optionActive : ''}`}
                                        aria-pressed={isActive}
                                        onClick={() => applyPreset(preset)}
                                    >
                                        {preset.label}
                                    </button>
                                );
                            })}
                        </div>
                    </section>

                    <section className={style.group}>
                        <div className={style.groupHead}>
                            <span className={style.groupTitle}>Сортировка</span>
                        </div>

                        <div className={style.options}>
                            {SORTINGS.map((option) => {
                                const isActive = draftSorting === option.key;

                                return (
                                    <button
                                        key={option.key}
                                        type="button"
                                        className={`${style.option} ${isActive ? style.optionActive : ''}`}
                                        aria-pressed={isActive}
                                        onClick={() => {
                                            hapticImpact('light');
                                            setDraftSorting(option.key);
                                        }}
                                    >
                                        {option.label}
                                    </button>
                                );
                            })}
                        </div>
                    </section>

                    <section className={style.switches}>
                        {TOGGLES.map(({key, label}) => {
                            const isOn = Boolean(draft[key]);

                            return (
                                <button
                                    key={key}
                                    type="button"
                                    className={style.switchRow}
                                    role="switch"
                                    aria-checked={isOn}
                                    onClick={() => {
                                        hapticImpact('light');
                                        setDraft((current) => toggleFlag(current, key));
                                    }}
                                >
                                    <span className={style.switchLabel}>{label}</span>
                                    <span className={`${style.switch} ${isOn ? style.switchOn : ''}`}>
                                        <span className={style.switchKnob}/>
                                    </span>
                                </button>
                            );
                        })}
                    </section>
                </div>

                <div className={style.footer} style={{paddingBottom: `calc(${safeAreaInset.bottom}px + 20 * var(--u))`}}>
                    <button type="button" className={style.apply} onClick={apply}>
                        {typeof preview === 'number'
                            ? `Показать ${preview.toLocaleString('ru-RU')} ${productsPlural(preview)}`
                            : 'Показать товары'}
                    </button>
                </div>
            </div>
        </div>
    );
}
