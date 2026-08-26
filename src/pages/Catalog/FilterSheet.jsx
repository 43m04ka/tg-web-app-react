import React, {useCallback, useEffect, useRef, useState} from 'react';
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
    optionLabel,
    productsPlural,
    setPriceRange,
    toggleFlag,
    toggleListValue
} from '../../shared/lib/catalogQuery';
import {
    GenreIcon,
    LanguageIcon,
    PlatformIcon,
    PlayersIcon,
    PriceIcon,
    SortIcon,
    TypeIcon
} from './CatalogIcons';
import style from './FilterSheet.module.scss';

const GROUP_ICONS = {
    platform: PlatformIcon,
    type: TypeIcon,
    genre: GenreIcon,
    language: LanguageIcon,
    players: PlayersIcon,
    price: PriceIcon,
    sort: SortIcon
};

function GroupHead({icon, title, children}) {
    const IconComponent = GROUP_ICONS[icon];

    return (
        <div className={style.groupHead}>
            <span className={style.groupTitle}>
                {IconComponent ? <IconComponent className={style.groupIcon}/> : null}
                {title}
            </span>
            {children}
        </div>
    );
}

function Group({group, options, values, onToggle}) {
    const [isExpanded, setExpanded] = useState(false);

    if (!options.length) return null;

    const limit = group.limit || options.length;
    const visible = isExpanded ? options : options.slice(0, limit);
    const hidden = options.length - visible.length;

    return (
        <section className={style.group}>
            <GroupHead icon={group.icon} title={group.title}>
                {hidden > 0 || isExpanded ? (
                    <button type="button" className={style.groupMore} onClick={() => setExpanded(!isExpanded)}>
                        {isExpanded ? 'Свернуть' : `Ещё ${hidden}`}
                        <span className={`${style.groupMoreChevron} ${isExpanded ? style.groupMoreOpen : ''}`}>▾</span>
                    </button>
                ) : null}
            </GroupHead>

            <div className={style.options}>
                {visible.map((option, index) => {
                    const isActive = values.includes(option.value);
                    const isRevealed = index >= limit;

                    return (
                        <button
                            key={option.value}
                            type="button"
                            className={`${style.option} ${isActive ? style.optionActive : ''} ${isRevealed ? style.optionRevealed : ''}`}
                            style={isRevealed ? {animationDelay: `${Math.min(index - limit, 8) * 28}ms`} : undefined}
                            aria-pressed={isActive}
                            onClick={() => onToggle(group.key, option.value)}
                        >
                            {optionLabel(group.key, option)}
                        </button>
                    );
                })}
            </div>
        </section>
    );
}

const PREVIEW_DELAY_MS = 250;
const SLIDER_STEPS = 100;

const CLOSE_DISTANCE = 96;
const CLOSE_VELOCITY = 0.6;

const DRAG_THRESHOLD = 6;

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
    const [isCounting, setCounting] = useState(false);
    const [isClosing, setClosing] = useState(false);
    const [dragOffset, setDragOffset] = useState(0);

    const dragRef = useRef(null);
    const appliedRef = useRef(JSON.stringify(filters));

    const scopeKey = JSON.stringify(scope);
    const draftKey = JSON.stringify(draft);
    const appliedKey = appliedRef.current;

    useEffect(() => {
        const controller = new AbortController();

        if (draftKey !== appliedKey) setCounting(true);

        const timer = setTimeout(() => {
            fetchCatalogProducts(
                {...JSON.parse(scopeKey), filters: JSON.parse(draftKey), page: 1, perPage: 1},
                controller.signal
            )
                .then((payload) => {
                    setPreview(payload?.total ?? 0);
                    setCounting(false);
                })
                .catch(() => {
                    if (controller.signal.aborted) return;
                    setPreview(null);
                    setCounting(false);
                });
        }, PREVIEW_DELAY_MS);

        return () => {
            clearTimeout(timer);
            controller.abort();
        };
    }, [scopeKey, draftKey, appliedKey]);

    const requestClose = useCallback(() => setClosing(true), []);

    const handleAnimationEnd = useCallback((event) => {
        if (event.target !== event.currentTarget) return;
        if (isClosing) onClose();
    }, [isClosing, onClose]);

    const startDrag = (event) => {
        if (event.pointerType === 'mouse' && event.button !== 0) return;

        dragRef.current = {
            startY: event.clientY,
            lastY: event.clientY,
            lastAt: event.timeStamp,
            velocity: 0,
            isActive: false
        };
    };

    const moveDrag = (event) => {
        const drag = dragRef.current;
        if (!drag) return;

        const shift = event.clientY - drag.startY;

        if (!drag.isActive) {
            if (shift < DRAG_THRESHOLD) return;

            drag.isActive = true;
            event.currentTarget.setPointerCapture(event.pointerId);
        }

        const elapsed = event.timeStamp - drag.lastAt;
        if (elapsed > 0) drag.velocity = (event.clientY - drag.lastY) / elapsed;

        drag.lastY = event.clientY;
        drag.lastAt = event.timeStamp;

        setDragOffset(Math.max(0, shift));
    };

    const endDrag = () => {
        const drag = dragRef.current;
        if (!drag) return;

        dragRef.current = null;

        if (!drag.isActive) return;

        if (dragOffset > CLOSE_DISTANCE || drag.velocity > CLOSE_VELOCITY) {
            hapticImpact('light');
            requestClose();
            return;
        }

        setDragOffset(0);
    };

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
        requestClose();
    };

    const isDragging = dragRef.current?.isActive === true;

    return (
        <div className={style.overlay} role="dialog" aria-modal="true" aria-label="Фильтры">
            <button
                type="button"
                className={`${style.backdrop} ${isClosing ? style.backdropClosing : ''}`}
                aria-label="Закрыть фильтры"
                onClick={requestClose}
            />

            <div
                className={`${style.sheet} ${isClosing ? style.sheetClosing : ''}`}
                style={{
                    '--drag-offset': `${dragOffset}px`,
                    transform: dragOffset && !isClosing ? `translateY(${dragOffset}px)` : undefined,
                    transition: isDragging ? 'none' : undefined
                }}
                onAnimationEnd={handleAnimationEnd}
            >
                <div
                    className={style.head}
                    onPointerDown={startDrag}
                    onPointerMove={moveDrag}
                    onPointerUp={endDrag}
                    onPointerCancel={endDrag}
                >
                    <span className={style.grabber} aria-hidden="true"/>

                    <div className={style.headRow}>
                        <span className={style.headTitle}>Фильтры и сортировка</span>
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
                    <section className={style.sortBlock}>
                        <GroupHead icon="sort" title="Сортировка"/>

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

                    <span className={style.divider}>Фильтры</span>

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
                        <GroupHead icon="price" title="Цена">
                            <span className={style.groupNote}>{priceNote(draft, bounds)}</span>
                        </GroupHead>

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
                    <button type="button" className={`${style.apply} ${isCounting ? style.applyCounting : ''}`}
                            onClick={apply}>
                        {isCounting ? (
                            <span className={style.applyCount}>
                                Считаем
                                <span className={style.dots} aria-hidden="true">
                                    <i/><i/><i/>
                                </span>
                            </span>
                        ) : (
                            <span className={style.applyCount}>
                                {typeof preview === 'number'
                                    ? `Показать ${money(preview)} ${productsPlural(preview)}`
                                    : 'Показать товары'}
                            </span>
                        )}
                    </button>
                </div>
            </div>
        </div>
    );
}
