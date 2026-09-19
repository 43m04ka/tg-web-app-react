import React, {useMemo} from 'react';
import {positionsLabel} from '../model/storefrontTotals';
import {GridIcon} from './DesktopIcons';
import style from './ScopeSwitcher.module.scss';

function Tile({icon, name, note, isOn, isLink, index, onClick}) {
    return (
        <button
            type="button"
            className={isOn ? `${style.card} ${style.cardOn}` : style.card}
            aria-pressed={isLink ? undefined : isOn}
            style={{'--i': index}}
            onClick={onClick}
        >
            <span className={style.logo}>
                {icon ? (
                    <span
                        className={style.logoImage}
                        style={{backgroundImage: `url(${icon})`}}
                        aria-hidden="true"
                    />
                ) : (
                    <GridIcon className={style.logoGlyph}/>
                )}
            </span>

            <span className={style.body}>
                <span className={style.name}>{name}</span>
                <span className={style.note}>{note}</span>
            </span>

            {isLink ? <span className={style.arrow} aria-hidden="true">→</span> : null}
        </button>
    );
}

export default function ScopeSwitcher({
    items,
    scopeId,
    onSelect,
    allLabel = 'Все витрины',
    totals,
    links = [],
    onOpenLink
}) {
    const options = useMemo(
        () => [{id: null, label: allLabel, icon: null}, ...items],
        [items, allLabel]
    );

    if (!items.length) return null;

    return (
        <div className={style.root}>
            {options.map((item, index) => (
                <Tile
                    key={item.id === null ? 'all' : item.id}
                    icon={item.icon}
                    name={item.label}
                    note={positionsLabel(totals?.get(item.id) ?? null)}
                    isOn={item.id === scopeId}
                    index={index}
                    onClick={() => onSelect(item)}
                />
            ))}

            {links.map((link, index) => (
                <Tile
                    key={link.key}
                    icon={link.icon}
                    name={link.label}
                    note={link.note}
                    isLink
                    index={options.length + index}
                    onClick={() => onOpenLink(link)}
                />
            ))}
        </div>
    );
}
