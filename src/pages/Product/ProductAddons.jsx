import React from 'react';
import {formatPrice} from '../Main/catalogSections';
import {hasValue} from './productView';
import style from './Product.module.scss';

const plural = (count) => {
    const tail = count % 10;
    const hundred = count % 100;
    if (tail === 1 && hundred !== 11) return 'дополнение';
    if (tail >= 2 && tail <= 4 && (hundred < 12 || hundred > 14)) return 'дополнения';
    return 'дополнений';
};

export default function ProductAddons({addons, selectedIds, onToggle}) {
    if (addons.length === 0) return null;

    const selectedCount = addons.filter((addon) => selectedIds.has(addon.id)).length;

    return (
        <section className={style.section}>
            <div className={style.sectionHead}>
                <h2 className={style.sectionTitle}>Дополнения</h2>
                <span className={style.sectionNote}>
                    {selectedCount > 0
                        ? `Выбрано ${selectedCount}`
                        : `${addons.length} ${plural(addons.length)}`}
                </span>
            </div>

            <div className={style.addons}>
                {addons.map((addon) => {
                    const isSelected = selectedIds.has(addon.id);

                    return (
                        <button
                            key={addon.id}
                            type="button"
                            className={`${style.addon} ${isSelected ? style.addonSelected : ''}`}
                            onClick={() => onToggle(addon)}
                            aria-pressed={isSelected}
                        >
                            <span className={style.addonBox} aria-hidden="true">
                                <svg viewBox="0 0 24 24" fill="none">
                                    <path d="m5.5 12.5 4 4 9-9" stroke="currentColor" strokeWidth="2.6"
                                          strokeLinecap="round" strokeLinejoin="round"/>
                                </svg>
                            </span>

                            <span
                                className={style.addonCover}
                                style={addon.image ? {backgroundImage: `url(${addon.image})`} : undefined}
                                aria-hidden="true"
                            />

                            <span className={style.addonBody}>
                                <span className={style.addonName}>{addon.name}</span>
                                {hasValue(addon.typeLabel) ? (
                                    <span className={style.addonNote}>{addon.typeLabel}</span>
                                ) : null}
                            </span>

                            <span className={style.addonPrice}>{formatPrice(addon.price)}</span>
                        </button>
                    );
                })}
            </div>
        </section>
    );
}
