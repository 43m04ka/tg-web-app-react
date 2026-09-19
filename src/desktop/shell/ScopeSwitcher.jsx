import React, {useMemo} from 'react';
import {positionsLabel} from '../model/storefrontTotals';
import {GridIcon} from './DesktopIcons';
import style from './ScopeSwitcher.module.scss';

export default function ScopeSwitcher({items, scopeId, onSelect, allLabel = 'Все витрины', totals}) {
    const options = useMemo(
        () => [{id: null, label: allLabel, icon: null}, ...items],
        [items, allLabel]
    );

    if (!items.length) return null;

    return (
        <div className={style.root} role="tablist" aria-label="Витрина">
            {options.map((item, index) => {
                const isOn = item.id === scopeId;

                return (
                    <button
                        key={item.id === null ? 'all' : item.id}
                        type="button"
                        role="tab"
                        aria-selected={isOn}
                        className={isOn ? `${style.card} ${style.cardOn}` : style.card}
                        style={{'--i': index}}
                        onClick={() => onSelect(item)}
                    >
                        <span className={style.logo}>
                            {item.icon ? (
                                <span
                                    className={style.logoImage}
                                    style={{backgroundImage: `url(${item.icon})`}}
                                    aria-hidden="true"
                                />
                            ) : (
                                <GridIcon className={style.logoGlyph}/>
                            )}
                        </span>

                        <span className={style.body}>
                            <span className={style.name}>{item.label}</span>
                            <span className={style.note}>{positionsLabel(totals?.get(item.id) ?? null)}</span>
                        </span>
                    </button>
                );
            })}
        </div>
    );
}
