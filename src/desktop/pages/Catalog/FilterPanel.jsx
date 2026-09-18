import React from 'react';
import {
    FILTER_GROUPS,
    PRICE_PRESETS,
    TOGGLES,
    countActiveFilters,
    createFilters,
    isSamePriceRange,
    optionLabel,
    setPriceRange,
    toggleFlag,
    toggleListValue
} from '../../../shared/lib/catalogQuery';
import style from './DesktopCatalog.module.scss';

export default function FilterPanel({filters, facets, price, onChange}) {
    const active = countActiveFilters(filters);

    const groups = FILTER_GROUPS
        .map((group) => ({...group, options: facets?.[group.key] || []}))
        .filter((group) => group.options.length > 0);

    return (
        <aside className={style.panel}>
            <header className={style.panelHead}>
                <span className={style.panelTitle}>Фильтры</span>
                {active > 0 ? (
                    <button type="button" className={style.reset} onClick={() => onChange(createFilters())}>
                        Сбросить
                    </button>
                ) : null}
            </header>

            {groups.map((group) => (
                <section key={group.key} className={style.group}>
                    <span className={style.groupTitle}>{group.title}</span>

                    <div className={style.options}>
                        {group.options.slice(0, group.limit || 12).map((option) => {
                            const isOn = (filters[group.key] || []).includes(option.value);

                            return (
                                <button
                                    key={option.value}
                                    type="button"
                                    className={`${style.option} ${isOn ? style.optionOn : ''}`}
                                    onClick={() => onChange(toggleListValue(filters, group.key, option.value))}
                                >
                                    {optionLabel(group.key, option)}
                                    {option.count ? <span className={style.optionCount}>{option.count}</span> : null}
                                </button>
                            );
                        })}
                    </div>
                </section>
            ))}

            <section className={style.group}>
                <span className={style.groupTitle}>
                    Цена
                    {price ? <span className={style.groupNote}>{price.min} — {price.max} ₽</span> : null}
                </span>

                <div className={style.options}>
                    {PRICE_PRESETS.map((preset) => (
                        <button
                            key={preset.label}
                            type="button"
                            className={`${style.option} ${isSamePriceRange(filters, preset) ? style.optionOn : ''}`}
                            onClick={() => onChange(isSamePriceRange(filters, preset)
                                ? setPriceRange(filters, null, null)
                                : setPriceRange(filters, preset.priceMin, preset.priceMax))}
                        >
                            {preset.label}
                        </button>
                    ))}
                </div>
            </section>

            <section className={style.toggles}>
                {TOGGLES.map((toggle) => (
                    <button
                        key={toggle.key}
                        type="button"
                        className={style.toggle}
                        onClick={() => onChange(toggleFlag(filters, toggle.key))}
                        aria-pressed={Boolean(filters[toggle.key])}
                    >
                        <span className={style.toggleLabel}>{toggle.label}</span>
                        <span className={`${style.switch} ${filters[toggle.key] ? style.switchOn : ''}`}>
                            <span className={style.knob}/>
                        </span>
                    </button>
                ))}
            </section>
        </aside>
    );
}
